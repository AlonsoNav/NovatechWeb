import { jsPDF } from 'jspdf';

import { getRequestParams } from './Database';

export async function Download(format, projectName, language, pendingTasks, activeTasks, finishedTasks) {
    try {
        const responseProject = await getRequestParams('proyectos/' + projectName);
        const responseColabs = await getRequestParams('proyectos/' + projectName + "/colab");
        const responseColab = await getRequestParams('colaboradores/' + responseProject.responsable + '/correo');

        if (!responseColabs || !responseColab) {
            console.log('Could not connect to the server.');
        } else {
            if (!responseColabs || responseColabs === null || responseColabs === undefined) {
                console.error(responseColabs.message);
            } else if (!responseColab || responseColab === null || responseColab === undefined) {
                console.error(responseColab.message);
            } else {
                let colabs = [];
                responseColabs.forEach(colab => {
                    colabs.push(colab.nombre);
                });
                let data = []
                let str_fileName = ''
                if (language === "Spanish") {
                    data = [
                        {
                            "Proyecto": projectName,
                            "Encargado": responseColab.nombre,
                            "Colaboradores": colabs,
                            "Cantidad de tareas pendientes": pendingTasks,
                            "Cantidad de tareas activas": activeTasks,
                            "Cantidad de tareas terminadas": finishedTasks
                        }
                    ];

                    str_fileName = projectName+'_reporte_sp';
                } else if (language === "English") {
                    data = [
                        {
                            "Project": projectName,
                            "Attendant": responseColab.nombre,
                            "Collaborators": colabs,
                            "Amount of pending tasks": pendingTasks,
                            "Amount of active tasks": activeTasks,
                            "Amount of finished tasks": finishedTasks
                        }
                    ];

                    str_fileName = projectName+'_report_en';
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

                    doc.setFontSize(12);
                    doc.text("Reporte de Datos", 10, 10);

                    let y = 20;
                    data.forEach((item) => {
                        doc.text(`Nombre: ${item.name}`, 10, y);
                        doc.text(`Edad: ${item.age}`, 10, y + 10);
                        doc.text(`Ciudad: ${item.city}`, 10, y + 20);
                        y += 30;
                    });

                    doc.save(str_fileName+'.pdf');
                }
            
                console.log('El reporte '+format+' ha sido generado exitosamente');
            }
        }
    } catch (error) {
        console.error('Error generando el reporte CSV:', error);
    }
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
            line += array[i][index];
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
            xml += `    <${key}>${value}</${key}>\n`;
        }
        xml += '  </item>\n';
    });

    xml += '</root>';

    return xml;
};