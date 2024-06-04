// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
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
import {useState} from "react";
import {Link} from "react-router-dom";
import DatePicker from 'react-datepicker';
import ModalComponent from "../../components/ModalComponent.jsx";

const Projects = () => {
    //
    const [resultsAmount, setResultsAmount] = useState(0)
    const [selectedProject, setSelectedProject] = useState({})
    const [filteredProjects, setFilteredProjects] = useState([{name: "Project 1", status: "Finished", responsible: "Responsible 1"}, {name: "Project 2", status: "Not started",  responsible: "Responsible 2"}, {name: "Project 3", status: "Started",  responsible: "Responsible 3"}])
    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [statuses, setStatuses] = useState(["Finished", "Not started", "Started"])
    const [selectedStatus, setSelectedStatus] = useState([])
    // Components
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showOffcanvas, setShowOffcanvas] = useState(false)

    // Project Card
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
                            <button className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(project)}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </button>
                        </Col>
                    </Row>
                    <ProgressBar striped now={60} variant={"info"}/>
                </Card.Body>
            </Card>
        </Col>
    ))

    // Filters
    const clearFilters = () => {
        setSelectedStatus([])
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

    const handleDelete = (project) => {
        setSelectedProject(project)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = () => {
        setShowDeleteModal(false)
    }

    return(
        <Container fluid className={"m-header p-3"}>
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
                <Col className={"text-end col-auto mt-1"}>
                    <Link to={"/collaborators/add"} className={"btn btn-primary justify-content-center"}>
                        <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                        Add Project
                    </Link>
                </Col>
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