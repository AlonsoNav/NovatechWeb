// Styles imports
import "../../styles/Style.css"
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faFilter, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// Local imports
import {useAuth} from "../../contexts/AuthContext.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import {getRequest} from "../../controllers/Database.jsx";
import Resource from "../../models/Resource.jsx";
import {filterByCheckbox, filterBySearchTerm} from "../../controllers/Filters.jsx";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Offcanvas from "react-bootstrap/Offcanvas";

const ProjectResources = ({projectName, responsible}) => {
    ProjectResources.propTypes = {
        projectName: PropTypes.string.isRequired,
        responsible: PropTypes.string.isRequired
    }
    // Data
    const user = JSON.parse(localStorage.getItem("user"))
    const {isAdmin} = useAuth()
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    const [resultsAmount, setResultsAmount] = useState(0)
    const [resources, setResources] = useState([])
    // Filters
    const types = ["Human", "Material", "Financial", "Time"]
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredResources, setFilteredResources] = useState([])
    const [selectedTypes, setSelectedTypes] = useState([])
    // Components
    const [isAddForm, setIsAddForm] = useState(true) // If it's false, it's an edit form
    const [showFormModal, setShowFormModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("danger")
    const [showOffcanvas, setShowOffcanvas] = useState(false)

    // Fetch data
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}/recursos`)

                if (!response){
                    setToastMessage("Could not connect to the server.")
                    setShowToast(true)
                }
                else {
                    const body = await response.json()
                    if (!response.ok) {
                        setToastMessage(body.message)
                        setShowToast(true)
                    } else{
                        const resourcesMap = body.map(resource => {
                            return new Resource(
                                resource.nombre,
                                resource.descripcion,
                                resource.tipo
                            )
                        })
                        setResources(resourcesMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchResources()
    }, [projectName]);

    useEffect(() => {
        if (isAdmin || responsible === user.correo)
            setIsAdminOrResponsible(true)
    }, [responsible]);

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredResources.length)
    }, [filteredResources])

    // Set filters
    useEffect(() => {
        const filteredResources = resources.filter(resource => {
            return filterByCheckbox(resource.type, selectedTypes)
                && filterBySearchTerm(resource.name, searchTerm)
        })

        setFilteredResources(filteredResources)
    }, [resources, selectedTypes, searchTerm])

    // Resource cards
    const resourceCards = filteredResources.map((resource, index) => (
        <Col key={`meeting_card_${index}`} >
            <Card className={"text-start"}>
                <Card.Body>
                    <Row className={"mb-2"}>
                        <Col className={"flex-grow-1"}>
                            <Card.Title>{resource.name}</Card.Title>
                            <Card.Subtitle>{resource.type}</Card.Subtitle>
                        </Col>
                        {isAdminOrResponsible &&
                            <Col className={"col-auto"}>
                                <button className="btn btn-sm btn-danger">
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Col>
                            <Card.Text>{resource.description}</Card.Text>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    ))

    // Checkboxes filters
    const clearFilters = () => {
        setSelectedTypes([])
        setSearchTerm('')
    }

    const handleDepartmentChange = (type) => {
        if (selectedTypes.includes(type))
            setSelectedTypes(selectedTypes.filter(cat => cat !== type)) // If the department is already selected, delete it
        else
            setSelectedTypes([...selectedTypes, type])
    }

    const typeCheckboxes = types.map((type, index) => (
        <Form.Check key={`type_${index}`}
                    label={type}
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleDepartmentChange(type)}
        />
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} className={"m-header custom-scrollbar"}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filters</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            {typeCheckboxes}
                        </Form.Group>
                        <Button className={"btn btn-primary btn-sm"} onClick={clearFilters}>
                            <FontAwesomeIcon icon={faTrash} className={"me-2"}/>
                            Clear filters
                        </Button>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            <Row className={"pt-3 px-3"}>
                <Col className={"text-start flex-grow-1"}>
                    <h2 className={"h2"}>Resources</h2>
                    <span className={"text-muted"}>{resultsAmount} results</span>
                </Col>
                {isAdminOrResponsible &&
                    <Col className={"text-end col-auto mt-1"}>
                        <Button className={"btn btn-primary justify-content-center"}
                                onClick={() => {
                                    setShowFormModal(true)
                                    setIsAddForm(true)
                                }}>
                            <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                            Add Resources
                        </Button>
                    </Col>
                }
            </Row>
            <Row className={"pt-3 px-3"}>
                <Col className={"col-auto"}>
                    <Button className={"btn btn-primary"} onClick={() => setShowOffcanvas(true)}>
                        <FontAwesomeIcon icon={faFilter} className={"me-2"}/>
                        Filters
                    </Button>
                </Col>
                <Col className={"flex-grow-1"}>
                    <Form>
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch}/>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxLength="30"
                            />
                        </InputGroup>
                    </Form>
                </Col>
            </Row>
            <Row md={3} xs={1} className={"px-3 pt-3 g-3"}>
                {resourceCards}
            </Row>
        </Container>
    )
}
export default ProjectResources