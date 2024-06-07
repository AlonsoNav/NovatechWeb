// Local imports
import '../../../styles/Style.css'
import ModalComponent from "../../../components/ModalComponent.jsx"
import {deleteRequest, getRequest, putRequest} from "../../../controllers/Database.jsx";
import ToastComponent from "../../../components/ToastComponent.jsx";
import Collaborator from "../../../models/Collaborator.jsx";
import {validateEmail, validatePhone} from "../../../controllers/InputValidation.jsx";
import CollaboratorsTable from "../../../components/CollaboratorsTable.jsx";
import {
    filterCollaboratorsByDepartment,
    filterCollaboratorsByProjects,
    filterCollaboratorsBySearchTerm
} from "../../../controllers/Filters.jsx";
// React imports
import {useEffect, useState} from "react";
import { Link } from 'react-router-dom'
// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faSearch, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons'
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form"
import InputGroup from "react-bootstrap/InputGroup"
import Offcanvas from "react-bootstrap/Offcanvas"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal";

const Collaborators = () => {
    //
    const [resultsAmount, setResultsAmount] = useState(0)
    const [selectedCollaborator, setSelectedCollaborator] = useState({})
    const [collaborators, setCollaborators] = useState([])
    // Filters
    const departments = ["Accountability", "Administration", "HR", "IT"]
    const [projects, setProjects] = useState([])
    const [selectedDepartments, setSelectedDepartments] = useState([])
    const [selectedProjects, setSelectedProjects] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredCollaborators, setFilteredCollaborators] = useState([])

    // Components
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmEditModal, setShowConfirmEditModal] = useState(false)
    const [showOffcanvas, setShowOffcanvas] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastBg, setToastBg] = useState('danger')
    // Edit form
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [department, setDepartment] = useState('')
    const [project, setProject] = useState('')

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
        setSelectedCollaborator(collaborator)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = async () => {
        try{
            let response = await deleteRequest(`colaboradores/${selectedCollaborator.id}`)

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
                    setCollaborators(collaborators.filter(collaborator => collaborator.id !== selectedCollaborator.id))
                    setToastBg('info')
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
        setShowDeleteModal(false)
    }

    // Edit collaborator
    const handleEdit = (collaborator) => {
        setSelectedCollaborator(collaborator)
        setEmail(collaborator.email)
        setPhone(collaborator.phone)
        setDepartment(collaborator.department)
        setProject(collaborator.project ? collaborator.project : "Free")
        setShowEditModal(true)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget
        if (form.checkValidity() === false ||
            (email.length !== 0 && !validateEmail(email)) ||
            (phone.length !== 0 && !validatePhone(phone)))
            return
        setShowEditModal(false)
        setShowConfirmEditModal(true)
    }

    const handleEditConfirmed = async () => {
        setShowConfirmEditModal(false)
        let payload = {
            correo: email,
            departamento: department,
            telefono: phone,
            contrasena: password,
            nombreProyecto: project
        }
        try{
            let response = await putRequest(payload, `colaboradores/${selectedCollaborator.id}/admin`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg('danger')
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok)
                    setToastBg("danger")
                else {
                    let updatedCollaborators = collaborators.map(collaborator => {
                        if (collaborator.id === selectedCollaborator.id) {
                            return {
                                ...collaborator,
                                email: email,
                                department: department,
                                phone: phone,
                                project: project === "Free" ? null : project
                            }
                        }
                        return collaborator
                    })
                    setCollaborators(updatedCollaborators)
                    setToastBg("info")
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredCollaborators.length)
    }, [filteredCollaborators])

    // Set filters
    useEffect(() => {
        const filteredCollaborators = collaborators.filter(collaborator => {
            return filterCollaboratorsByProjects(collaborator, selectedProjects)
                && filterCollaboratorsByDepartment(collaborator, selectedDepartments)
                && filterCollaboratorsBySearchTerm(collaborator, searchTerm)
        })

        setFilteredCollaborators(filteredCollaborators)
    }, [collaborators, selectedProjects, selectedDepartments, searchTerm])


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

    // Selector options
    const departmentOptions = departments.map((department, index) => (
        <option key={`department_${index}`} label={department} value={department}></option>
    ))

    const projectOptions = projects.map((project, index) => (
        <option key={`project_${index}`} label={project} value={project}></option>
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
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => handleDeleteConfirmed()}
              show={showDeleteModal}
              title={"Confirm Collaborator Delete"}
              message={`Are you sure you want to delete the collaborator ${selectedCollaborator.email}?`}
              confirmButtonText={"Delete"}
              confirmButtonVariant={"danger"}
          />
          <ModalComponent
              onClose={() => {
                  setShowConfirmEditModal(false)
                  setShowEditModal(true)
              }}
              onConfirm={() => handleEditConfirmed()}
              show={showConfirmEditModal}
              title={"Save changes"}
              message={"Are you sure you want to keep these changes?"}
              confirmButtonText={"Save changes"}
              confirmButtonVariant={"primary"}
          />
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
              <Modal.Header closeButton>
                  <Modal.Title>Edit Collaborator</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <Form noValidate onSubmit={handleEditSubmit}>
                      <Row md={2} xs={1}>
                          <Col md={{span:6, order:1}} xs={{order:1}}>
                              <Form.Group className={"mb-3"}>
                                  <Form.Label>Project name</Form.Label>
                                  <Form.Select value={project} onChange={(e) => setProject(e.target.value)}>
                                      {projectOptions}
                                  </Form.Select>
                              </Form.Group>
                          </Col>
                          <Col md={{span:6, order:1}} xs={{order:1}}>
                              <Form.Group className={"mb-3"}>
                                  <Form.Label>Department name</Form.Label>
                                  <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                      {departmentOptions}
                                  </Form.Select>
                              </Form.Group>
                          </Col>
                          <Col md={{order:2}} xs={{order: 2}}>
                              <Form.Group className={"mb-3"} controlId="formBasicEmail">
                                  <Form.Label>Email</Form.Label>
                                  <Form.Control
                                      type="email"
                                      placeholder="Enter email..."
                                      maxLength={100}
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      isInvalid={email.length !== 0 && !validateEmail(email)}
                                  />
                                  <Form.Control.Feedback type='invalid'>
                                      Please enter a valid email (@estudiantec.cr).
                                  </Form.Control.Feedback>
                              </Form.Group>
                          </Col>
                          <Col md={{order:2}} xs={{order: 3}}>
                              <Form.Group className={"mb-3"} controlId="formBasicPassword">
                                  <Form.Label>Password</Form.Label>
                                  <Form.Control
                                      type="password"
                                      placeholder="Enter the password..."
                                      maxLength={16}
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                  />
                              </Form.Group>
                          </Col>
                          <Col md={{order:3}} xs={{order: 2}}>
                              <Form.Group className={"mb-3"} controlId="formBasicPhone">
                                  <Form.Label>Phone</Form.Label>
                                  <Form.Control
                                      type="text"
                                      placeholder="Enter phone..."
                                      maxLength={8}
                                      value={phone}
                                      onChange={(e) => {if (!isNaN(e.target.value)) setPhone(e.target.value)}}
                                      isInvalid={phone.length !== 0 && !validatePhone(phone)}
                                  />
                                  <Form.Control.Feedback type='invalid'>
                                      Please enter a valid phone number.
                                  </Form.Control.Feedback>
                              </Form.Group>
                          </Col>
                      </Row>
                      <div className={"text-end"}>
                          <button type="submit" className={"btn btn-primary mt-5"}>Edit information</button>
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
                <CollaboratorsTable  collaborators={filteredCollaborators} handleDelete={handleDelete} handleEdit={handleEdit}/>
            </Col>
        </Row>
      </Container>
    )
}

export default Collaborators