// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ModalComponent from "../../components/ModalComponent.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import {getRequest} from "../../controllers/Database.jsx";
import Project from "../../models/Project.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
// FontAwesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faFilter, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// React imports
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import DatePicker from 'react-datepicker';

const Projects = () => {
    //
    const today = new Date();
    const [resultsAmount, setResultsAmount] = useState(0)
    const [selectedProject, setSelectedProject] = useState({})
    const [projects, setProjects] = useState([])
    const { isAdmin } = useAuth();
    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateRangeActive, setDateRangeActive] = useState(false)
    const [statuses, setStatuses] = useState(["Finished", "Not started", "Started"])
    const [selectedStatus, setSelectedStatus] = useState([])
    const [filteredProjects, setFilteredProjects] = useState([])
    // Components
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showOffcanvas, setShowOffcanvas] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastBg, setToastBg] = useState('danger')

    // Fetch data
    const determineProjectStatus = (startDate, endDate) => {
        if (today < startDate)
            return "Not started"
        else if (today < endDate)
            return "Started"
        else
            return "Finished"
    }

    useEffect(() => {
        const fetchProjectsForAdmin = async () => {
            try {
                const response = await getRequest("proyectos/")

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
                        const projectsMap = body.map(project => {
                            const projectStartDate = new Date(project.fechaInicio)
                            const projectEndDate = new Date(project.fechaFin)
                            return new Project(
                                project.nombre,
                                project.responsable,
                                determineProjectStatus(projectStartDate, projectEndDate),
                                projectStartDate,
                                projectEndDate
                            )
                        })
                        setProjects(projectsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        const getProjectForCollaborator = () => {
            const user = JSON.parse(localStorage.getItem("user"))
            if(user.proyecto){
                const projectStartDate = new Date(project.fechaInicio)
                const projectEndDate = new Date(project.fechaFin)
                const project = new Project(
                    user.proyecto.nombre,
                    user.proyecto.responsable,
                    determineProjectStatus(projectStartDate, projectEndDate),
                    projectStartDate,
                    projectEndDate
                )
                setProjects([project])
            }
        }

        if(isAdmin)
            fetchProjectsForAdmin()
        else
            getProjectForCollaborator()
    }, []);

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredProjects.length)
    }, [filteredProjects])

    // Filter projects
    useEffect(() => {
        const filteredProjects = projects.filter(project => {
            return filterProjectsByStatus(project)
                && filterProjectsBySearchTerm(project)
                && filterProjectsByDateRange(project)
        })

        setFilteredProjects(filteredProjects)
    }, [projects, selectedStatus, startDate, endDate, searchTerm, dateRangeActive])

    const filterProjectsByStatus = (project) => {
        if (selectedStatus.length === 0)
            return true
        else
            return selectedStatus.includes(project.status)
    }

    const filterProjectsBySearchTerm = (project) => {
        if (searchTerm === "")
            return true
        else {
            const searchTermLowerCase = searchTerm.toLowerCase()
            const projectNameLowerCase = project.name.toLowerCase()

            return projectNameLowerCase.includes(searchTermLowerCase)
        }
    }

    const filterProjectsByDateRange = (project) => {
        if(!dateRangeActive)
            return true
        // Convert dates to milliseconds to compare them easily
        const projectStartDate = new Date(project.startDate).getTime();
        const projectEndDate = new Date(project.endDate).getTime();
        const selectedStartDate = new Date(startDate).getTime();
        const selectedEndDate = new Date(endDate).getTime();

        return projectStartDate >= selectedStartDate && projectEndDate <= selectedEndDate;
    }

    // Project Card
    const calculateProgress = (startDate, endDate) => {
        const now = new Date();
        const totalDuration = endDate - startDate;
        const elapsedDuration = now - startDate;

        const progress = (elapsedDuration / totalDuration) * 100;

        return Math.min(progress, 100); // Make sure the progress is not greater than 100
    }

    const projectCards = filteredProjects.map((project, index) => (
        <Col key={`project_card_${index}`}>
            <Card className={"bg-secondary color-secondary text-start"}>
                <Card.Body>
                    <Row className={"mb-2"}>
                        <Col className={"flex-grow-1"}>
                            <Card.Title>{project.name}</Card.Title>
                            <Card.Subtitle><b>Responsible:</b> {project.responsible}</Card.Subtitle>
                            <Card.Text>{project.status}</Card.Text>
                        </Col>
                        <Col className={"col-auto"}>
                            {isAdmin &&
                                <button className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(project)}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            }
                        </Col>
                    </Row>
                    <ProgressBar striped now={calculateProgress(project.startDate, project.endDate)} variant={"info"}/>
                </Card.Body>
            </Card>
        </Col>
    ))

    // Filters
    const clearFilters = () => {
        setSelectedStatus([])
        setStartDate(new Date())
        setEndDate(new Date())
        setSearchTerm('')
    }

    const handleStatusChange = (status) => {
        if (selectedStatus.includes(status))
            setSelectedStatus(selectedStatus.filter(cat => cat !== status)) // If the status is already selected, delete it
        else
            setSelectedStatus([...selectedStatus, status])
    }

    const statusCheckboxes = statuses.map((status, index) => (
        <Form.Check key={`status_${index}`}
                    label={status}
                    checked={selectedStatus.includes(status)}
                    onChange={() => handleStatusChange(status)}
        />
    ))

    // Delete project
    const handleDelete = (project) => {
        setSelectedProject(project)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = () => {
        setShowDeleteModal(false)
    }

    return(
        <Container fluid className={"m-header p-3"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <ModalComponent
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => handleDeleteConfirmed()}
                show={showDeleteModal}
                title={"Confirm Project Delete"}
                message={`Are you sure you want to delete the project ${selectedProject.name}?`}
                confirmButtonText={"Delete"}
                confirmButtonVariant={"danger"}
            />
            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} className={"m-header custom-scrollbar"}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filters</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Date range</Form.Label>
                            <Row md={2}>
                                <Col>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={date => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        className="form-control"
                                    />
                                </Col>
                                <Col>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        className="form-control"
                                    />
                                </Col>
                            </Row>
                            <Form.Check
                                type="switch"
                                checked={dateRangeActive}
                                onChange={() => setDateRangeActive(!dateRangeActive)}
                                label="Active search by date range"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            {statusCheckboxes}
                        </Form.Group>
                        <Button className={"btn btn-primary btn-sm"} onClick={clearFilters}>
                            <FontAwesomeIcon icon={faTrash} className={"me-2"}/>
                            Clear filters
                        </Button>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            <Row className={"mb-3"}>
                <Col className={"text-start flex-grow-1"}>
                    <h1 className={"h1"}>Projects</h1>
                    <span className={"text-muted"}>{resultsAmount} results</span>
                </Col>
                {isAdmin &&
                    <Col className={"text-end col-auto mt-1"}>
                        <Link to={"/projects/add"} className={"btn btn-primary justify-content-center"}>
                            <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                            Add Project
                        </Link>
                    </Col>
                }
            </Row>
            <Row className={"mb-3"}>
                <Col className={"col-auto"}>
                    <Button className={"btn btn-primary"} onClick={() => setShowOffcanvas(true)}>
                        <FontAwesomeIcon icon={faFilter} className={"me-2"}/>
                        Filters
                    </Button>
                </Col>
                <Col className={"flex-grow-1"}>
                    <Form>
                        <InputGroup>
                            <InputGroup.Text className={"bg-secondary"}>
                                <FontAwesomeIcon icon={faSearch}/>
                            </InputGroup.Text>
                            <Form.Control
                                className={"bg-secondary"}
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxLength="100"
                            />
                        </InputGroup>
                    </Form>
                </Col>
            </Row>
            <Row md={3} xs={1} className={"g-3"}>
                {projectCards}
            </Row>
        </Container>
    )
}

export default Projects