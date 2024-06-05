// Styles imports
import '../../styles/Style.css'
import '../../styles/Tabs.css'
// Local imports
import {determineProjectStatus} from "../../controllers/BusinessLogic.jsx";
import {getRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import Project from "../../models/Project.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
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
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("")

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}`)

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
                            projectEndDate
                        )
                        setProject(project)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchProject()
    }, []);


    return (
        <Container fluid className={"m-header p-3"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <Row>
                <Col className={"text-start"}>
                    <h1 className={"h1"}>{project.name}</h1>
                    <p>Status: {project.status} - Start date: {project.startDate ? project.startDate.toLocaleDateString() : 'Loading...'}</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Tabs
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                    >
                        <Tab eventKey="collaborators" title="Collaborators">
                            <ProjectCollaborators />
                        </Tab>
                        <Tab eventKey="information" title="Information">
                            <ProjectInformation />
                        </Tab>
                        <Tab eventKey="logs" title="Logs">
                            <ProjectLogs />
                        </Tab>
                        <Tab eventKey="meetings" title="Meetings">
                            <ProjectMeetings />
                        </Tab>
                        <Tab eventKey="resources" title="Resources">
                            <ProjectResources />
                        </Tab>
                        <Tab eventKey="tasks" title="Tasks">
                            <ProjectTasks />
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    )
}

export default ProjectIndividual