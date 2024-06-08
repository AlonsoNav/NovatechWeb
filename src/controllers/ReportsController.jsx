import { jsPDF } from 'jspdf';

import { getRequestParams, getRequest } from './Database';

export async function DownloadReport(mode, format, language, info, type) {
    if (mode === 'project') {
        // info = [nombreProyecto, pendingTasks, activeTasks, finishedTasks] -> string, int, int, int
        try {
            const infoProject = await formatProject(language, info);
            const data = [infoProject[0]];
            const str_fileName = infoProject[1];
            const title = infoProject[2];
                    
            if (format === 'CSV') {
                const blob = new Blob([convertToCSV(data)], { type: 'text/csv' });
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
                // Obtiene el ancho del texto (en unidades de puntos)
                const textWidth = doc.getTextWidth(title);
                // Calcula la posición x para centrar el texto
                const x = (pageWidth - textWidth) / 2;
                doc.setFontSize(20);
                doc.text(title, x, 10);
                doc.setFontSize(12);
                let y = 20;
                data.forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        doc.text(`${key}: ${item[key]}`, 10, y=y+10);
                    })
                });
                doc.save(str_fileName+'.pdf');
            }
            console.log('El reporte '+format+' ha sido generado exitosamente');
        } catch (error) {
            console.error('Error generando el reporte '+format+':', error);
        }
    }
    else if (mode === 'projects') {
        // info = [[nombreProyecto, pendingTasks, activeTasks, finishedTasks], [nombreProyecto, pendingTasks, activeTasks, finishedTasks]]
        try {
            let str_fileName = '';
            let title = '';
            let responseProjects = null;

            if (type === 'No started') {
                if (language === 'Spanish') {
                    str_fileName = 'Reporte_Proyectos_No_Iniciados';
                    title = 'Reporte Proyectos No Iniciados';
                    responseProjects = await getRequestParams('proyectos/No ');
                }
                else if (language === 'English') {
                    str_fileName = 'Projects_Report';
                    title = 'Projects Report';
                }
            }
            else if (type === 'Started') {
                if (language === 'Spanish') {
                    str_fileName = 'Reporte_Proyectos_Iniciados';
                    title = 'Reporte Proyectos Iniciados';
                }
                else if (language === 'English') {
                    str_fileName = 'Projects_Report';
                    title = 'Projects Report';
                }
            }
            else if (type === 'Finished') {
                if (language === 'Spanish') {
                    str_fileName = 'Reporte_Proyectos_Terminados';
                    title = 'Reporte Proyectos Terminados';
                }
                else if (language === 'English') {
                    str_fileName = 'Projects_Report';
                    title = 'Projects Report';
                }
            }
            else if (type === 'All') {
                if (language === 'Spanish') {
                    str_fileName = 'Reporte_Proyectos';
                    title = 'Reporte Proyectos';
                }
                else if (language === 'English') {
                    str_fileName = 'Projects_Report';
                    title = 'Projects Report';
                }
            }
            
            if (!responseProjects) {
                console.log('Could not connect to the server.');
            }
            else {
                let projects = [];

                responseProjects.forEach(async (project) => {
                    let projectData = [project.nombre]
                    projectData.append(getTaskByState(project))
                    const infoProject = await formatProject(language, projectData);
                    projects.push(infoProject[0]);
                });
            }
                    
            if (format === 'CSV') {
                const blob = new Blob([convertToCSV(data)], { type: 'text/csv' });
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

                // Obtiene el ancho del texto (en unidades de puntos)
                const textWidth = doc.getTextWidth(title);

                // Calcula la posición x para centrar el texto
                const x = (pageWidth - textWidth) / 2;

                doc.setFontSize(20);
                doc.text(title, x, 10);
                doc.setFontSize(12);
                let y = 20;
                data.forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        doc.text(`${key}: ${item[key]}`, 10, y=y+10);
                    })
                });

                doc.save(str_fileName+'.pdf');
            }
        
            console.log('El reporte '+format+' ha sido generado exitosamente');
        } catch (error) {
            console.error('Error generando el reporte '+format+':', error);
        }
    }
    // else if (mode === 'colabs') {
    //     try {
    //         const responseProject = await getRequestParams('proyectos/' + projectName);
    //         const responseColabs = await getRequestParams('proyectos/' + projectName + "/colab");
    //         const responseColab = await getRequestParams('colaboradores/' + responseProject.responsable + '/correo');

    //         if (!responseColabs || !responseColab) {
    //             console.log('Could not connect to the server.');
    //         } else {
    //             if (!responseColabs || responseColabs === null || responseColabs === undefined) {
    //                 console.error(responseColabs.message);
    //             } else if (!responseColab || responseColab === null || responseColab === undefined) {
    //                 console.error(responseColab.message);
    //             } else {
    //                 let colabs = [];
    //                 responseColabs.forEach(colab => {
    //                     colabs.push(colab.nombre);
    //                 });
    //                 let data = []
    //                 let str_fileName = ''
    //                 let title = ''
    //                 if (language === "Spanish") {
    //                     data = [
    //                         {
    //                             "Encargado": responseColab.nombre,
    //                             "Colaboradores": colabs,
    //                             "Cantidad de tareas pendientes": pendingTasks,
    //                             "Cantidad de tareas activas": activeTasks,
    //                             "Cantidad de tareas terminadas": finishedTasks
    //                         }
    //                     ];
    //                     str_fileName = projectName+'_reporte_sp';
    //                     title = 'Reporte - '+projectName;
    //                 } else if (language === "English") {
    //                     data = [
    //                         {
    //                             "Attendant": responseColab.nombre,
    //                             "Collaborators": colabs,
    //                             "Amount of pending tasks": pendingTasks,
    //                             "Amount of active tasks": activeTasks,
    //                             "Amount of finished tasks": finishedTasks
    //                         }
    //                     ];

    //                     str_fileName = projectName+'_report_en';
    //                     title = 'Report - '+projectName;
    //                 }
                    
    //                 if (format === 'CSV') {
    //                     const blob = new Blob([convertToCSV(data)], { type: 'text/csv' });
    //                     const url = URL.createObjectURL(blob);
    //                     const a = document.createElement('a');
    //                     a.href = url;
    //                     a.download = str_fileName+'.csv';
    //                     document.body.appendChild(a);
    //                     a.click();
    //                     document.body.removeChild(a);
    //                 }
    //                 else if (format === 'XML') {
    //                     const blob = new Blob([convertToXML(data)], { type: 'application/xml' });
    //                     const url = URL.createObjectURL(blob);
    //                     const a = document.createElement('a');
    //                     a.href = url;
    //                     a.download = str_fileName+'.xml';
    //                     document.body.appendChild(a);
    //                     a.click();
    //                     document.body.removeChild(a);
    //                 }
    //                 else if (format === 'PDF') {
    //                     const doc = new jsPDF();

    //                     const pageWidth = doc.internal.pageSize.getWidth();

    //                     // Obtiene el ancho del texto (en unidades de puntos)
    //                     const textWidth = doc.getTextWidth(title);

    //                     // Calcula la posición x para centrar el texto
    //                     const x = (pageWidth - textWidth) / 2;

    //                     doc.setFontSize(20);
    //                     doc.text(title, x, 10);
    //                     doc.setFontSize(12);
    //                     let y = 20;
    //                     data.forEach((item) => {
    //                         Object.keys(item).forEach((key) => {
    //                             doc.text(`${key}: ${item[key]}`, 10, y=y+10);
    //                         })
    //                     });

    //                     doc.save(str_fileName+'.pdf');
    //                 }
                
    //                 console.log('El reporte '+format+' ha sido generado exitosamente');
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error generando el reporte CSV:', error);
    //     }
    // }
};

const convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    const headers = Object.keys(array[0]).join(',') + '\r\n';
    str += headers;

    for (let i = 0; i < array.length; i++) {
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
            let colabs = formatColabs(responseColabs)
            if (language === "Spanish") {
                project = {
                    "Encargado": responseColab.nombre,
                    "Colaboradores": colabs,
                    "Cantidad de tareas pendientes": info[1],
                    "Cantidad de tareas activas": info[2],
                    "Cantidad de tareas terminadas": info[3],
                    "Estado": responseProject.estado,
                };
                str_fileName = info[0]+'_reporte_sp';
                title = 'Reporte - '+info[0];
            } else if (language === "English") {
                project = {
                    "Attendant": responseColab.nombre,
                    "Collaborators": colabs,
                    "Amount of pending tasks": pendingTasks,
                    "Amount of active tasks": activeTasks,
                    "Amount of finished tasks": finishedTasks,
                    "State": responseProject.estado
                }
                str_fileName = info[0]+'_report_en';
                title = 'Report - '+info[0];
            }
        }
    }
    return [project, str_fileName, title]
}

function convertSpacesToUnderscores(str) {
    return str.replace(/ /g, '_');
}

function formatColabs(colabsData) {
    let colabs = [];
    colabsData.forEach(colab => {
        colabs.push(colab.nombre);
    });
    return colabs;
}

export const getTaskByState = (selectedProjectData) => {
    const { tareas } = selectedProjectData;
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