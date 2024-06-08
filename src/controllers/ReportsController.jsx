import { jsPDF } from 'jspdf';

import { getRequestParams, postRequest } from './Database';

export async function DownloadReport(mode, format, language, info) {
    let message = '';
    if (mode === 'project') {
        // info = array con info de un proyecto
        try {
            const infoProject = await formatProject(language, info);
            const data = [infoProject[0]];
            const str_fileName = infoProject[1];
            const title = infoProject[2];
            
            setFormat(data, str_fileName, title, format, mode);

            message = 'The report '+format+' was successfully generated';
            console.log(message);
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    }
    else if (mode === 'projects') {
        // info = array de proyectos
        try {
            const infoProjects = await formatProjects(language, info);
            const data = infoProjects[0];
            const str_fileName = infoProjects[1];
            const title = infoProjects[2];
                    
            setFormat(data, str_fileName, title, format, mode);
        
            message = 'The report '+format+' was successfully generated';
            console.log(message);
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    }
    else if (mode === 'colabs') {
        // info = array de colabs
        try {
            const infoColabs = await formatColabs(language, info);
            const data = infoColabs[0];
            const freeColabs = infoColabs[1];
            const str_fileName = infoColabs[2];
            const title = infoColabs[3];
            
            setFormat(data, str_fileName, title, format, freeColabs, language, mode);
        
            message = 'The report '+format+' was successfully generated';
            console.log(message);
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    }

    return message;
};

function setFormat(data, str_fileName, title, format, freeColabs, language, mode) {
    if (format === 'CSV') {
        const blob = new Blob([convertToCSV(data, mode)], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = str_fileName+'.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    else if (format === 'XML') {
        const blob = new Blob([convertToXML(data)], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = str_fileName+'.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    else if (format === 'PDF') {
        const doc = new jsPDF();
    
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const lineHeight = 10;
    
        // Obtiene el ancho del texto (en unidades de puntos)
        const textWidth = doc.getTextWidth(title);
    
        // Calcula la posición x para centrar el texto
        const x = (pageWidth - textWidth) / 2;
    
        doc.setFontSize(20);
        doc.text(title, x, margin);
        doc.setFontSize(12);
        
        let y = margin + 20;

        let subtitle = '';
        
        let contador = 0;
        data.forEach((item) => {
            Object.keys(item).forEach((key) => {
                if (y + lineHeight > pageHeight - margin) {  // Verifica si el próximo texto excede el límite de la página
                    doc.addPage();
                    y = margin;
                }
                if (mode == 'colabs' && contador === 2) {
                    if (language === 'Spanish') {subtitle='Colaboradores libres:'};
                    if (language === 'English') {subtitle='Free collaborators:'};
                    doc.setFontSize(16);
                    doc.text(subtitle, margin, y);
                    doc.setFontSize(12);
                    y+=10;
                };
                if (mode == 'colabs'&& contador === freeColabs*7) {
                    if (language === 'Spanish') {subtitle='Colaboradores con proyecto:'};
                    if (language === 'English') {subtitle='Collaborators with project:'}
                    doc.setFontSize(16);
                    doc.text(subtitle, margin, y);
                    doc.setFontSize(12);
                    y += lineHeight;
                };
                doc.text(`${key}: ${item[key]}`, margin, y);
                contador++;
                y += lineHeight;
            });
            y += lineHeight;  // Espacio adicional entre elementos
        });
    
        doc.save(str_fileName + '.pdf');
    }    
}

const convertToCSV = (objArray, mode) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let posicion = 0;
    if (mode === 'colabs') {posicion = 1}; 

    const headers = Object.keys(array[posicion]).join(',') + '\r\n';
    str += headers;

    for (let i = posicion; i < array.length; i++) {
        let line = '';
        for (const index in array[i]) {
            if (line !== '') line += ',';

            // Detectar si el valor es un array y convertirlo a una cadena
            if (Array.isArray(array[i][index])) {
                line += `"${array[i][index].join(', ')}"`;
            } else {
                line += array[i][index];
            }
        }
        str += line + '\r\n';
    }

    if (mode === 'colabs') {
        let line = '';
        for (const index in array[0]) {
            if (line !== '') line += ',';

            // Detectar si el valor es un array y convertirlo a una cadena
            if (Array.isArray(array[0][index])) {
                line += `"${array[0][index].join(', ')}"`;
            } else {
                line += array[0][index];
            }
        }
        str += line + '\r\n';
    }

    return str;
};

const convertToXML = (objArray) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

    objArray.forEach((obj) => {
        xml += '  <item>\n';
        for (const [key, value] of Object.entries(obj)) {
            xml += `    <${convertSpacesToUnderscores(key)}>${value}</${convertSpacesToUnderscores(key)}>\n`;
        }
        xml += '  </item>\n';
    });

    xml += '</root>';

    return xml;
};

async function formatProject(language, info) {
    let project = {};
    let str_fileName = '';
    let title = '';
    
    const responseProject = await getRequestParams('proyectos/' + info[0]);
    const responseColabs = await getRequestParams('proyectos/' + info[0] + "/colab");
    const responseColab = await getRequestParams('colaboradores/' + responseProject.responsable + '/correo');

    if (!responseProject || !responseColabs || !responseColab) {
        console.log('Could not connect to the server.');
    } else {
        if (responseProject === null || responseProject === undefined) {
            console.error(responseColab.message);
        }
        else if (responseColabs === null || responseColabs === undefined) {
            console.error(responseColabs.message);
        } else if (responseColab === null || responseColab === undefined) {
            console.error(responseColab.message);
        } else {
            let stateData = info[4];
            let state;
            let colabs = formatColabsNames(responseColabs)
            if (language === "Spanish") {
                if (stateData === "Not Started") {state = 'No Iniciado'}
                else if (stateData === "Started") {state = 'Iniciado'}
                else if (stateData === "Finished") {state = 'Terminado'};
                project = {
                    "Encargado": responseColab.nombre,
                    "Colaboradores": colabs,
                    "Cantidad de tareas pendientes": info[1],
                    "Cantidad de tareas activas": info[2],
                    "Cantidad de tareas terminadas": info[3],
                    "Estado": state,
                };
                str_fileName = info[0]+'_reporte_sp';
                title = 'Reporte - '+info[0];
            } else if (language === "English") {
                project = {
                    "Attendant": responseColab.nombre,
                    "Collaborators": colabs,
                    "Amount of pending tasks": info[1],
                    "Amount of active tasks": info[2],
                    "Amount of finished tasks": info[3],
                    "State": stateData
                }
                str_fileName = info[0]+'_report_en';
                title = 'Report - '+info[0];
            }
        }
    }
    return [project, str_fileName, title]
}

async function formatProjects(language, info) {
    let projects = [];
    let str_fileName = '';
    let title = '';

    for (const projectData of info) {
        let project = {};
        const responseColabs = await getRequestParams('proyectos/' + projectData.name + "/colab");
        const responseColab = await getRequestParams('colaboradores/' + projectData.responsible + '/correo');
        const responseTasks = await getRequestParams('proyectos/' + projectData.name + '/tareas');

        if (!responseColabs || !responseColab || !responseTasks) {
            console.log('Could not connect to the server.');
        } else {
            if (responseColabs === null || responseColabs === undefined) {
                console.error(responseColabs.message);
            } else if (responseColab === null || responseColab === undefined) {
                console.error(responseColab.message);
            } else if (responseTasks === null || responseTasks === undefined) {
                console.error(responseTasks.message);
            } else {
                const tasks = getTaskByState(responseTasks);
                let colabs = formatColabsNames(responseColabs);
                let stateData = projectData.status;
                let state;
                if (language === "Spanish") {
                    if (stateData === "Not Started") {state = 'No Iniciado'}
                    else if (stateData === "Started") {state = 'Iniciado'}
                    else if (stateData === "Finished") {state = 'Terminado'};
                    project = {
                        "Encargado": responseColab.nombre,
                        "Colaboradores": colabs,
                        "Cantidad de tareas pendientes": tasks[0],
                        "Cantidad de tareas activas": tasks[1],
                        "Cantidad de tareas terminadas": tasks[2],
                        "Estado": state,
                    };
                    str_fileName = 'Reporte_proyectos_sp';
                    title = 'Reporte Proyectos';
                } else if (language === "English") {
                    project = {
                        "Attendant": responseColab.nombre,
                        "Collaborators": colabs,
                        "Amount of pending tasks": tasks[0],
                        "Amount of active tasks": tasks[1],
                        "Amount of finished tasks": tasks[2],
                        "State": projectData.status
                    }
                    str_fileName = 'Proyects_report_en';
                    title = 'Proyects Report';
                }
            }
        }
        projects.push(project);
    }
    return [projects, str_fileName, title]
}

async function formatColabs(language, info) {
    let colabs = [];
    let colab = {};
    let str_fileName = '';
    let title = '';
    const orderedColabsData = orderColabsByStatus(info);
    const orderedColabs = orderedColabsData[0];
    const freeColabs = orderedColabsData[1];
    const busyColabs = orderedColabsData[2];

    if (language === "Spanish") {
        colabs.push({"Cantidad de colaboradores libres": freeColabs,
                     "Cantidad de colaboradores con proyecto": busyColabs
        });
    } else if (language === "English") {
        colabs.push({"Number of free collaborators": freeColabs,
                     "Number of collaborators with project": busyColabs
        });
    }

    for (const colabsData of orderedColabs) {
        let project = colabsData.project;
        if (language === "Spanish") {
            if (colabsData.project === null) {project = 'Libre'};
            colab = {
                "Nombre": colabsData.name,
                "Cedula": colabsData.id,
                "Correo": colabsData.email,
                "Telefono": colabsData.phone,
                "Departamento": colabsData.department,
                "Proyecto": project,
            };
            str_fileName = 'Reporte_colaboradores_sp';
            title = 'Reporte Colaboradores';
        } else if (language === "English") {
            if (colabsData.project === null) {project = 'Free'};
            colab = {
                "Name": colabsData.name,
                "ID": colabsData.id,
                "Email": colabsData.email,
                "Phone number": colabsData.phone,
                "Department": colabsData.department,
                "Project": project,
            };
            str_fileName = 'Collaborators_report_en';
            title = 'Collaborators Report';
        }
        colabs.push(colab);
    }
    return [colabs, freeColabs, str_fileName, title]
}

function orderColabsByStatus(info) {
    let orderedColabs = [];
    let freeColabs = 0;
    let busyColabs = 0;
    for (const colabsData of info) {
        if (colabsData.project === null) {
            orderedColabs.push(colabsData);
            freeColabs++;
        }
    }
    for (const colabsData of info) {
        if (colabsData.project != null) {
            orderedColabs.push(colabsData);
            busyColabs++;
        }
    }

    return [orderedColabs, freeColabs, busyColabs]
}

function convertSpacesToUnderscores(str) {
    return str.replace(/ /g, '_');
}

function formatColabsNames(colabsData) {
    let colabs = [];
    colabsData.forEach(colab => {
        colabs.push(colab.nombre);
    });
    return colabs;
}

export const getTaskByState = (tareas) => {
    let countPending = 0;
    let countProgress = 0;
    let countFinished = 0;
    tareas.forEach(tarea => {
        if (tarea.estado === 'Todo') countPending++;
        else if (tarea.estado === 'Doing') countProgress++;
        else if (tarea.estado === 'Done') countFinished++;
    });
    return [countPending, countProgress, countFinished];
}

export const getWeeks = (selectedProjectData) => {
    let fechaFinal = selectedProjectData.fechaFin;
    if (fechaFinal == null) {
        fechaFinal = new Date();
    } else {
        fechaFinal = new Date(selectedProjectData.fechaFin);
    }
    let fechaInicio = new Date(selectedProjectData.fechaInicio);
    const diffMiliS = Math.abs(fechaFinal - fechaInicio);
    const totalWeeks = Math.ceil(diffMiliS / (1000 * 60 * 60 * 24 * 7)) + 1;
    return totalWeeks;
};

export const getIdealProgressRate = (selectedProjectData, totalWeeks) => {
    const { tareas } = selectedProjectData;
    let totalStoryPoints = 0;

    tareas.forEach(tarea => {
        totalStoryPoints += tarea.storyPoints;
    });

    const idealProgressRate = totalStoryPoints / totalWeeks;
    return [idealProgressRate, totalStoryPoints];
};

export const getActualProgress = (selectedProjectData, totalWeeks, totalStoryPoints) => {
    const { tareas } = selectedProjectData;
    let actualProgress = [totalStoryPoints];

    for (var i = 1; i <= totalWeeks; i++) {
        tareas.forEach(tarea => {
            if (tarea.estado === 'Done') {
                let fechaInicio = new Date(selectedProjectData.fechaInicio);
                let fechaFinal = new Date(tarea.fechaFinal);
                const diffMiliS = Math.abs(fechaFinal - fechaInicio);
                const weeks = Math.ceil(diffMiliS / (1000 * 60 * 60 * 24 * 7));
                if (weeks === i) actualProgress.push(totalStoryPoints - tarea.storyPoints);
            }
        });
    }

    return actualProgress;
};

export async function sendEmail(correo, info, format, language, mode) {
    let data;
    let freeColabs;
    let str_fileName;
    let title; 
    let text;
    let message = '';
    if (mode === 'project') {
        try {
            const infoProject = await formatProject(language, info);
            data = [infoProject[0]];
            str_fileName = infoProject[1];
            title = infoProject[2];
            if (language === 'Spanish') {text=`Adjunto encontrará el informe del proyecto ${info[0]}, que cuenta con el responsable, los colaboradores y la cantidad de tareas por estado. Este informe está en formato ${format} y en el idioma español.`}
            else if (language === 'English') {text=`Attached you will find a report of the project ${data[0].name}, which includes the person in charge, the collaborators and the number of tasks per state. This report is in ${format} format and in the english language.`}
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    } else if (mode === 'projects') {
        try {
            const infoProjects = await formatProjects(language, info);
            data = infoProjects[0];
            str_fileName = infoProjects[1];
            title = infoProjects[2];
            if (language === 'Spanish') {text=`Adjunto encontrará el informe de los proyectos seleccionados. Cada proyecto cuenta con el responsable, los colaboradores y la cantidad de tareas por estado. Este informe está en formato ${format} y en el idioma español.`}
            else if (language === 'English') {text=`Attached you will find a report of the selected projects, which includes the person in charge, the collaborators and the number of tasks per state. This report is in ${format} format and in the english language.`}
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    } else if (mode === 'colabs') {
        try {
            const infoColabs = await formatColabs(language, info);
            data = infoColabs[0];
            freeColabs = infoColabs[1];
            str_fileName = infoColabs[2];
            title = infoColabs[3];
            if (language === 'Spanish') {text=`Adjunto encontrará el informe de todos los colaboradores, divididos en libres y trabajando en algún proyecto, además de la respectiva cantidad. Cada colaborador cuenta con su nombre, cédula, correo, teléfono, departamento y proyecto. Este informe está en formato ${format} y en el idioma español.`}
            else if (language === 'English') {text= `Attached you will find the report of all collaborators, divided into free and working on a project, in addition to the respective amount. Each collaborator has their name, ID, email, phone number, department and project. This report is in ${format} format and in the english language.`}
        } catch (error) {
            message = 'Error generating the report '+format;
            console.error(message+':', error);
        }
    }

    const payload = {
        correo: correo,
        nombreReporte: title,
        text: text,
        data: data,
        format: format,
        title: title,
        language: language,
        freeColabs: freeColabs,
        mode: mode,
        fileName: str_fileName
    };

    try {
         // correo, nombreReporte, text, data, format, title, language, freeColabs
        const response = await postRequest(payload, "send");

        if (response.ok) {
            message = 'The report '+format+' was successfully sent';
            console.log(message);
        } else {
            message = 'Error sending the report';
            console.log(message);
        }
    } catch (error) {
        message = 'Error sending the report '+format;
        console.error(message+':', error);
    }

    return message;
}