// Local imports
import '../../../styles/Style.css'
import ModalComponent from "../../../components/ModalComponent.jsx"
import {deleteRequest, getRequest} from "../../../controllers/Database.jsx";
import ToastComponent from "../../../components/ToastComponent.jsx";
import Collaborator from "../../../models/Collaborator.jsx";
// React imports
import {useEffect, useState} from "react";
import { Link } from 'react-router-dom'
// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faSearch, faEdit, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons'
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form"
import InputGroup from "react-bootstrap/InputGroup"
import Table from "react-bootstrap/Table"
import Offcanvas from "react-bootstrap/Offcanvas"
import Button from "react-bootstrap/Button"

const Collaborators = () => {
    //
    const [resultsAmount, setResultsAmount] = useState(0)
    const [collaboratorToDelete, setCollaboratorToDelete] = useState({})
    const [collaborators, setCollaborators] = useState([])
    // Filters
    const [departments, setDepartments] = useState(["Accountability", "Administration", "HR", "IT"])
    const [projects, setProjects] = useState([])
    const [selectedDepartments, setSelectedDepartments] = useState([])
    const [selectedProjects, setSelectedProjects] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredCollaborators, setFilteredCollaborators] = useState([])
    // Sort
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [sortedCollaborators, setSortedCollaborators] = useState([]);
    // Components
    const [showModal, setShowModal] = useState(false)
    const [showOffcanvas, setShowOffcanvas] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastBg, setToastBg] = useState('danger')

    // Fetch data
    useEffect(() => {
        const fetchProjects = async () => {
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
                        let projectNames = body.map(project => project.nombre)
                        projectNames.unshift("Free") // Add free option at the beginning of the list
                        setProjects(projectNames)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        const fetchCollaborators = async () => {
            try {
                const response = await getRequest("colaboradores/")

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
                                collaborator.departamento,
                                collaborator.proyecto != null ? collaborator.proyecto.nombre : null
                            )
                        })
                        setCollaborators(collaboratorsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchProjects()
        fetchCollaborators()
    }, [])
    
    // Delete collaborator
    const handleDelete = (collaborator) => {
        setCollaboratorToDelete(collaborator)
        setShowModal(true)
    }

    const handleDeleteConfirmed = async () => {
        try{
            let response = await deleteRequest(`colaboradores/${collaboratorToDelete.id}`)

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
                    setCollaborators(collaborators.filter(collaborator => collaborator.id !== collaboratorToDelete.id))
                    setToastBg('info')
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
        setShowModal(false)
    }

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredCollaborators.length)
    }, [filteredCollaborators])

    // Set filters
    useEffect(() => {
        const filteredCollaborators = collaborators.filter(collaborator => {
            return filterCollaboratorsByProjects(collaborator)
                && filterCollaboratorsByDepartment(collaborator)
                && filterCollaboratorsBySearchTerm(collaborator)
        })

        setFilteredCollaborators(filteredCollaborators)
    }, [collaborators, selectedProjects, selectedDepartments, searchTerm])

    const filterCollaboratorsByProjects = (collaborator) => {
        if (selectedProjects.length === 0)
            return true
        else
            return selectedProjects.includes(collaborator.project != null ? collaborator.project : "Free")
    }

    const filterCollaboratorsByDepartment = (collaborator) => {
        if (selectedDepartments.length === 0)
            return true
        else
            return selectedDepartments.includes(collaborator.department)
    }

    const filterCollaboratorsBySearchTerm = (collaborator) => {
        if (searchTerm === "")
            return true
        else {
            const searchTermLowerCase = searchTerm.toLowerCase()
            const collaboratorNameLowerCase = collaborator.name.toLowerCase()
            const collaboratorEmailLowerCase = collaborator.email.split('@')[0].toLowerCase() // Only the email name is compared

            return collaboratorNameLowerCase.includes(searchTermLowerCase) || collaboratorEmailLowerCase.includes(searchTermLowerCase)
        }
    }

    // Sort table
    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    useEffect(() => {
        let sortedCollaborators = [...filteredCollaborators];
        sortedCollaborators.sort((a, b) => {
            let aValue = a[sortConfig.key] == null ? "Free" : a[sortConfig.key]
            let bValue = b[sortConfig.key] == null ? "Free" : b[sortConfig.key]
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setSortedCollaborators(sortedCollaborators);
    }, [sortConfig, filteredCollaborators]);

    // Table items
    const collaboratorItems = sortedCollaborators.map((collaborator, index) => (
        <tr key={index}>
            <td>{collaborator.id}</td>
            <td>{collaborator.name}</td>
            <td>{collaborator.email}</td>
            <td>{collaborator.phone}</td>
            <td>{collaborator.project != null ? collaborator.project : "Free"}</td>
            <td>{collaborator.department}</td>
            <td>
                <Link to={{pathname: "/collaborators/update", state: {collaborator}}}
                      className="btn btn-sm btn-primary me-1">
                    <FontAwesomeIcon icon={faEdit}/>
                </Link>
                <button className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(collaborator)}>
                    <FontAwesomeIcon icon={faTrash}/>
                </button>
            </td>
        </tr>
    ))

    // Checkboxes filters
    const clearFilters = () => {
        setSelectedDepartments([])
        setSelectedProjects([])
        setSearchTerm('')
    }

    const handleDepartmentChange = (department) => {
        if (selectedDepartments.includes(department))
            setSelectedDepartments(selectedDepartments.filter(cat => cat !== department)) // If the department is already selected, delete it
        else
            setSelectedDepartments([...selectedDepartments, department])
    }

    const handleProjectChange = (project) => {
        if (selectedProjects.includes(project))
            setSelectedProjects(selectedProjects.filter(cat => cat !== project)) // If the project is already selected, delete it
        else
            setSelectedProjects([...selectedProjects, project])
    }

    const departmentCheckboxes = departments.map((department, index) => (
        <Form.Check key={`department_${index}`}
                    label={department}
                    checked={selectedDepartments.includes(department)}
                    onChange={() => handleDepartmentChange(department)}
        />
    ))

    const projectCheckboxes = projects.map((project, index) => (
        <Form.Check key={`project_${index}`}
                    label={project}
                    checked={selectedProjects.includes(project)}
                    onChange={() => handleProjectChange(project)}
        />
    ))

    return (
      <Container fluid className={"m-header p-3"}>
          <ToastComponent
              message={toastMessage}
              show={showToast}
              onClose={() => setShowToast(false)}
              bg={toastBg}
          />
          <ModalComponent
              onClose={() => setShowModal(false)}
              onConfirm={() => handleDeleteConfirmed()}
              show={showModal}
              title={"Confirm Collaborator Delete"}
              message={`Are you sure you want to delete the collaborator ${collaboratorToDelete.email}?`}
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
                          <Form.Label>Department</Form.Label>
                          {departmentCheckboxes}
                      </Form.Group>
                      <Form.Group className="mb-3">
                          <Form.Label>Project</Form.Label>
                          {projectCheckboxes}
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
                <h1 className={"h1"}>Collaborators</h1>
                <span className={"text-muted"}>{resultsAmount} results</span>
            </Col>
            <Col className={"text-end col-auto mt-1"}>
                <Link to={"/collaborators/add"} className={"btn btn-primary justify-content-center"}>
                    <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                    Add Collaborator
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
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            maxLength="30"
                        />
                    </InputGroup>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col className={"table-responsive text-start"}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th onClick={() => requestSort('id')}>Id</th>
                        <th onClick={() => requestSort('name')}>Name</th>
                        <th onClick={() => requestSort('email')}>Email</th>
                        <th onClick={() => requestSort('phone')}>Phone</th>
                        <th onClick={() => requestSort('project')}>Project</th>
                        <th onClick={() => requestSort('department')}>Department</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {collaboratorItems}
                    </tbody>
                </Table>
            </Col>
        </Row>
      </Container>
    )
}

export default Collaborators