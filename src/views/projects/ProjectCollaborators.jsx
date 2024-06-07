// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faFilter, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// Local imports
import {useAuth} from "../../contexts/AuthContext.jsx";
import CollaboratorsTable from "../../components/CollaboratorsTable.jsx";
import {deleteRequest, getRequest, postRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import Collaborator from "../../models/Collaborator.jsx";
import {filterCollaboratorsByDepartment, filterCollaboratorsBySearchTerm} from "../../controllers/Filters.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import Offcanvas from "react-bootstrap/Offcanvas";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import ModalComponent from "../../components/ModalComponent.jsx";

const ProjectCollaborators = ({projectName, responsible}) => {
    ProjectCollaborators.propTypes = {
        projectName: PropTypes.string.isRequired,
        responsible: PropTypes.string.isRequired
    }
    // Data
    const user = JSON.parse(localStorage.getItem('user'))
    const [resultsAmount, setResultsAmount] = useState(0)
    const { isAdmin } = useAuth();
    const [isResponsible, setIsResponsible] = useState(false)
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    const departments = ["Accountability", "Administration", "HR", "IT"]
    const [collaborators, setCollaborators] = useState([])
    const [collaboratorsAvailable, setCollaboratorsAvailable] = useState([])
    const [selectedCollaborator, setSelectedCollaborator] = useState({})
    // Form data
    const [collaborator, setCollaborator] = useState("")
    // Filters
    const [showOffcanvas, setShowOffcanvas] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartments, setSelectedDepartments] = useState([])
    const [filteredCollaborators, setFilteredCollaborators] = useState([])
    // Components
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("danger")

    // Fetch data
    useEffect(() => {
        const fetchCollaboratorsAvailable = async () => {
            try {
                const response = await getRequest("colaboradores/disponibles")

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
                        const collaboratorsMap = body.map(collaborator => {
                            return new Collaborator(
                                collaborator.cedula,
                                collaborator.nombre,
                                collaborator.correo,
                                collaborator.telefono,
                                collaborator.departamento
                            )
                        })
                        setCollaboratorsAvailable(collaboratorsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchCollaboratorsAvailable()
    }, []);

    useEffect(() => {
        if (collaboratorsAvailable.length > 0)
            setCollaborator(collaboratorsAvailable[0].email);
    }, [collaboratorsAvailable]);

    useEffect(() => {
        const fetchCollaborators = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}/colab`)

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
                        const collaboratorsMap = body.map(collaborator => {
                            return new Collaborator(
                                collaborator.cedula,
                                collaborator.nombre,
                                collaborator.correo,
                                collaborator.telefono,
                                collaborator.departamento
                            )
                        })
                        setCollaborators(collaboratorsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchCollaborators()
    }, [projectName])

    useEffect(() => {
        if (isAdmin || responsible === user.correo){
            setIsResponsible(true)
            setIsAdminOrResponsible(true)
        }
    }, [responsible]);

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredCollaborators.length)
    }, [filteredCollaborators])

    // Set filters
    useEffect(() => {
        const filteredCollaborators = collaborators.filter(collaborator => {
            return filterCollaboratorsByDepartment(collaborator, selectedDepartments)
                && filterCollaboratorsBySearchTerm(collaborator, searchTerm)
        })

        setFilteredCollaborators(filteredCollaborators)
    }, [collaborators, selectedDepartments, searchTerm])

    // Delete collaborator
    const handleDelete = (collaborator) => {
        setSelectedCollaborator(collaborator)
        console.log(collaborator)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = async () => {
        setShowDeleteModal(false)
        try{
            let response = await deleteRequest( `proyectos/${projectName}/colab/${selectedCollaborator.email}`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg("danger")
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok)
                    setToastBg("danger")
                else{
                    setToastBg("info")
                    setCollaboratorsAvailable(prevCollaborators => [...prevCollaborators, selectedCollaborator])
                    setCollaborators(collaborators.filter(item => item.email !== selectedCollaborator.email))
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    // Add collaborator
    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        let payload = {
            correoColab: collaborator
        }
        try{
            let response = await postRequest(payload, `proyectos/${projectName}/colab`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg("danger")
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok)
                    setToastBg("danger")
                else{
                    setToastBg("info")
                    setCollaborators(prevCollaborators => [...prevCollaborators,
                        collaboratorsAvailable.find(item => item.email === collaborator)])
                    setCollaboratorsAvailable(collaboratorsAvailable.filter(item => item.email !== collaborator))
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        } catch (error){
            console.log(error)
        }
    }

    // Checkboxes filters
    const clearFilters = () => {
        setSelectedDepartments([])
        setSearchTerm('')
    }

    const handleDepartmentChange = (department) => {
        if (selectedDepartments.includes(department))
            setSelectedDepartments(selectedDepartments.filter(cat => cat !== department)) // If the department is already selected, delete it
        else
            setSelectedDepartments([...selectedDepartments, department])
    }

    const departmentCheckboxes = departments.map((department, index) => (
        <Form.Check key={`department_${index}`}
                    label={department}
                    checked={selectedDepartments.includes(department)}
                    onChange={() => handleDepartmentChange(department)}
        />
    ))

    // Selector options
    const collaboratorOptions = collaboratorsAvailable.map((collaborator, index) => (
        <option key={`collaborator_${index}`} label={collaborator.email} value={collaborator.email}></option>
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
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
                title={"Confirm Collaborator Delete"}
                message={`Are you sure you want to delete the collaborator ${selectedCollaborator.email} from the project?`}
                confirmButtonText={"Delete"}
                confirmButtonVariant={"danger"}
            />
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add collaborator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Collaborator</Form.Label>
                                    <Form.Select value={collaborator} onChange={(e) => setCollaborator(e.target.value)}>
                                        {collaboratorOptions}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-primary mt-5"}>Add collaborator</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} className={"m-header custom-scrollbar"}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filters</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            {departmentCheckboxes}
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
                    <h2 className={"h2"}>Collaborators</h2>
                    <span className={"text-muted"}>{resultsAmount} results</span>
                </Col>
                {isAdminOrResponsible &&
                    <Col className={"text-end col-auto mt-1"}>
                        <Button className={"btn btn-primary justify-content-center"}
                                onClick={() => {setShowAddModal(true)}}>
                            <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                            Add Collaborator
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
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxLength="30"
                            />
                        </InputGroup>
                    </Form>
                </Col>
            </Row>
            <Row className={"pt-3 px-3"}>
                <Col className={"table-responsive text-start"}>
                    <CollaboratorsTable
                        collaborators={filteredCollaborators}
                        handleDelete={handleDelete}
                        showProjectColumn={false}
                        showEditButton={false}
                        isResponsible={isResponsible}
                        responsible={responsible || ""}/>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectCollaborators