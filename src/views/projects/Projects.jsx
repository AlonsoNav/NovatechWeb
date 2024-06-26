// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ModalComponent from "../../components/ModalComponent.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import {deleteRequest, getRequest} from "../../controllers/Database.jsx";
import Project from "../../models/Project.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {determineProjectStatus} from "../../controllers/BusinessLogic.jsx";
import { DownloadReport, sendEmail } from '../../controllers/ReportsController.jsx';
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
// FontAwesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faFilter, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// React imports
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import DatePicker from 'react-datepicker';

const Projects = () => {
    //
    const today = new Date();
    const navigate = useNavigate();
    const [resultsAmount, setResultsAmount] = useState(0)
    const [selectedProject, setSelectedProject] = useState({})
    const [projects, setProjects] = useState([])
    const { isAdmin } = useAuth();
    const [selectedFormat, setSelectedFormat] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
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
    const [showModal, setShowModal] = useState(false);

    // Fetch data
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

        const fetchProjectForCollaborator = async () => {
            const user = JSON.parse(localStorage.getItem("user"))
            if(user.proyecto){
                try {
                    const response = await getRequest(`proyectos/${user.proyecto.nombre}`)

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
                            setProjects([project])
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        if(isAdmin)
            fetchProjectsForAdmin()
        else
            fetchProjectForCollaborator()
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
        <Col key={`project_card_${index}`} onClick={() => navigate(`/projects/${project.name}`)}>
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
                                        onClick={(event) => handleDelete(event, project)}>
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
    const handleDelete = (event, project) => {
        event.stopPropagation()
        setSelectedProject(project)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = async () => {
        setShowDeleteModal(false)
        try{
            let response = await deleteRequest(`proyectos/${selectedProject.name}`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg('danger')
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok) {
                    setToastBg('danger')
                }else{
                    setProjects(projects.filter(project => project.name !== selectedProject.name))
                    setToastBg('info')
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    const handleFormatChange = (e) => {
        const format = e.target.value;
        setSelectedFormat(format);
    };
    
    const handleLanguageChange = (e) => {
        const language = e.target.value;
        setSelectedLanguage(language);
    };
    
    const handleDownload = async () => {
        if (selectedFormat != '' && selectedLanguage != '') {
            const msg = await DownloadReport('projects', selectedFormat, selectedLanguage, filteredProjects);
            setToastMessage(msg)
            setShowToast(true)
        }
    };
    
    const handleSend = async () => {
        if (selectedFormat != '' && selectedLanguage != '') {
            const user = JSON.parse(localStorage.getItem("user")).correo;
            const msg = await sendEmail(user, filteredProjects, selectedFormat, selectedLanguage, 'projects')
            setToastMessage(msg)
            setShowToast(true)
        }
    };
    
    const handleModalShow = () => setShowModal(true);
    const handleModalClose = () => setShowModal(false);

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
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="color-secondary mb-3">
                    <Col><p>Choose the the format and the language</p></Col>
                    </Row>
                    <Row className="color-secondary mb-3">
                    <Col className="d-flex justify-content-center">
                        <Form.Group>
                            <Form.Label>Format</Form.Label>
                            <Form.Select onChange={handleFormatChange} isInvalid={selectedFormat === ''}>
                            <option value="">Select a format</option>
                            <option value="PDF">PDF</option>
                            <option value="CSV">CSV</option>
                            <option value="XML">XML</option>
                        </Form.Select>
                        <Form.Control.Feedback type='invalid'>
                            Please enter a format to continue.
                        </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <Form.Group>
                        <Form.Label>Language</Form.Label>
                        <Form.Select onChange={handleLanguageChange} isInvalid={selectedLanguage === ''}>
                            <option value="">Select a language</option>
                            <option value="Spanish">Spanish</option>
                            <option value="English">English</option>
                        </Form.Select>
                        <Form.Control.Feedback type='invalid'>
                            Please enter a language to continue.
                        </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleDownload}>Download</Button>
                    <Button variant="primary" onClick={handleSend}>Send</Button>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                </Modal.Footer>
            </Modal>
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
                <Col>
                    <div className={"text-end"}>
                        <Button onClick={handleModalShow} className="btn btn-primary justify-content-center my-1">Generate report</Button>
                    </div>
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