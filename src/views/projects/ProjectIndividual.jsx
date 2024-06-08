// Styles imports
import '../../styles/Style.css'
import '../../styles/Tabs.css'
// Local imports
import {determineProjectStatus} from "../../controllers/BusinessLogic.jsx";
import {getRequest, postRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import Project from "../../models/Project.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from 'react-bootstrap/Button';
// React imports
import { useParams } from 'react-router-dom';
import {useEffect, useState} from "react";
// Tabs imports
import ProjectCollaborators from "./ProjectCollaborators.jsx";
import ProjectInformation from "./ProjectInformation.jsx";
import ProjectLogs from "./ProjectLogs.jsx";
import ProjectMeetings from "./ProjectMeetings.jsx";
import ProjectResources from "./ProjectResources.jsx";
import ProjectTasks from "./ProjectTasks.jsx";

const ProjectIndividual = () => {
    // Data
    const { projectName } = useParams();
    const [project, setProject] = useState({})
    const [key, setKey] = useState('information');
    const [canCreateForum, setCanCreateForum] = useState(false);
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}`)
                const user = JSON.parse(localStorage.getItem("user"));

                if (!response){
                    setToastMessage("Could not connect to the server.")
                    setShowToast(true)
                }
                else {
                    const body = await response.json()
                    if (!response.ok) {
                        setToastMessage(body.message)
                        setShowToast(true)
                    }else {
                        let projectStartDate = new Date(body.fechaInicio)
                        let projectEndDate = new Date(body.fechaFin)
                        const project = new Project(
                            body.nombre,
                            body.responsable,
                            determineProjectStatus(projectStartDate, projectEndDate),
                            projectStartDate,
                            projectEndDate,
                            body.presupuesto,
                            body.descripcion
                        )
                        setProject(project)
                        setCanCreateForum((user.admin || (project.responsible && project.responsible === user.correo)) && !body.tieneForo);
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchProject()
    }, []);

    const handleCreateForum = async e => {
        e.preventDefault();
        const response = await postRequest({}, `foros/${project.name}`);
        if (!response){
            setToastMessage("Could not connect to the server.");
            setShowToast(true);
            return;
        }
        const body = await response.json();
        console.log(body.message);
        setToastMessage(body.message);
        setShowToast(true);
        if (response.ok) { 
            setCanCreateForum(false);
            const user = JSON.parse(localStorage.getItem("user"));
            user.proyecto.tieneForo = true;
            localStorage.setItem("user", JSON.stringify(user));
        }

    }


    return (
        <Container fluid className={"m-header"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
            <Row className={"px-3 pt-3"}>
                <Col className={"text-start"}>
                    <h1 className={"h1"}>{project.name}</h1>
                    <p>Status: {project.status} - Start date: {project.startDate ? project.startDate.toLocaleDateString() : 'Loading...'}</p>
                </Col>
                <Col className={"text-end"}>
                    {canCreateForum ? 
                        <Button onClick={handleCreateForum}>Create forum</Button> 
                    : ""}
                </Col>
            </Row>
            <Row>
                <Col className={"p-0"}>
                    <Tabs
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className={"px-2"}
                    >
                        <Tab eventKey="collaborators" title="Collaborators">
                            <ProjectCollaborators  projectName={projectName} responsible={project.responsible || ""}/>
                        </Tab>
                        <Tab eventKey="information" title="Information">
                            <ProjectInformation project={project}/>
                        </Tab>
                        <Tab eventKey="logs" title="Logs">
                            <ProjectLogs projectName={projectName}/>
                        </Tab>
                        <Tab eventKey="meetings" title="Meetings">
                            <ProjectMeetings projectName={projectName} responsible={project.responsible || ""}/>
                        </Tab>
                        <Tab eventKey="resources" title="Resources">
                            <ProjectResources projectName={projectName} responsible={project.responsible || ""}/>
                        </Tab>
                        <Tab eventKey="tasks" title="Tasks">
                            <ProjectTasks projectName={projectName} responsible={project.responsible || ""}/>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    )
}

export default ProjectIndividual