// Styles imports
import '../../styles/Style.css'
// Local imports
import TaskCard from "../../components/TaskCard.jsx";
import {getRequest, postRequest} from "../../controllers/Database.jsx";
import Task from "../../models/Task.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faSearch} from "@fortawesome/free-solid-svg-icons";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";

const ProjectTasks = ({projectName, responsible}) => {
    ProjectTasks.propTypes = {
        projectName: PropTypes.string.isRequired,
        responsible: PropTypes.string.isRequired
    }
    // Data
    const user = JSON.parse(localStorage.getItem('user'))
    const [tasks, setTasks] = useState([])
    const { isAdmin } = useAuth();
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    const statuses = ['Todo', 'Doing', 'Done']
    const [collaborators, setCollaborators] = useState([])
    // Filters
    const [myTasks, setMyTasks] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredTasks, setFilteredTasks] = useState([])
    // Components
    const [isAddForm, setIsAddForm] = useState(true) // If it's false, it's an edit form
    const [showFormModal, setShowFormModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastBg, setToastBg] = useState('danger')
    // Form data
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('')
    const [collaborator, setCollaborator] = useState('')
    const [storyPoints, setStoryPoints] = useState('')

    // Fetch data
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}/tareas`)

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
                        const tasksMap = body.map(task => {
                            return new Task(
                                task.nombre,
                                task.responsable,
                                task.descripcion,
                                task.storyPoints,
                                task.estado
                            )
                        })
                        setTasks(tasksMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

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
                    } else
                        setCollaborators(body.map(collaborator => collaborator.correo))
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchTasks()
        fetchCollaborators()
    }, [projectName]);

    useEffect(() => {
        if (isAdmin || responsible === user.correo)
            setIsAdminOrResponsible(true)
    }, [responsible]);

    // Setting the collaborator by default
    useEffect(() => {
        if(collaborators.length > 0)
            setCollaborator(collaborators[0])
    }, [collaborators]);

    // Set filters
    useEffect(() => {
        const filteredTasks = tasks.filter(task => {
            return filterTasksBySearchTerm(task) && filterTasksByMyTasks(task)
        })

        setFilteredTasks(filteredTasks)
    }, [tasks, myTasks, searchTerm])

    const filterTasksBySearchTerm = (task) => {
        if (searchTerm === "")
            return true
        else {
            const searchTermLowerCase = searchTerm.toLowerCase()
            const taskNameLowerCase = task.name.toLowerCase()

            return taskNameLowerCase.includes(searchTermLowerCase)
        }
    }

    const filterTasksByMyTasks = (task) => {
        if (myTasks)
            return task.responsible === user.correo
        else
            return true
    }

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget
        if(!form.checkValidity())
            return
        if (isAddForm)
            addTask()
        else
            editTask()
    }

    // Adding task
    const addTask = async () => {
        let payload = {
            nombre: name,
            correoResponsable: responsible,
            storyPoints: storyPoints,
            descripcion: description
        }
        try{
            let response = await postRequest(payload, `proyectos/${projectName}/tareas`)

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
                    const newTask = new Task(
                        name,
                        collaborator,
                        description,
                        storyPoints,
                        'Todo' // Default status for a new task
                    )
                    setTasks(prevTasks => [...prevTasks, newTask])
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    // Edit task
    const editTask = () => {

    }

    // Tasks card
    const TodoCards = filteredTasks.filter(task => task.status === 'Todo').map((task, index) => (
        <Col key={`task_todo_card_${index}`}>
            <TaskCard task={task} isAdminOrResponsible={isAdminOrResponsible}/>
        </Col>
    ))

    const DoingCards = filteredTasks.filter(task => task.status === 'Doing').map((task, index) => (
        <Col key={`task_doing_card_${index}`}>
            <TaskCard task={task} isAdminOrResponsible={isAdminOrResponsible}/>
        </Col>
    ))

    const DoneCards = filteredTasks.filter(task => task.status === 'Done').map((task, index) => (
        <Col key={`task_done_card_${index}`}>
            <TaskCard task={task} isAdminOrResponsible={isAdminOrResponsible}/>
        </Col>
    ))

    // Selector options
    const statusOptions = statuses.map((status, index) => (
        <option key={`status_${index}`} label={status} value={status}></option>
    ))

    const collaboratorOptions = collaborators.map((collaborator, index) => (
        <option key={`collaborator_${index}`} label={collaborator} value={collaborator}></option>
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <Modal show={showFormModal} onHide={() => setShowFormModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isAddForm ? "Add" : "Edit"} Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter the name of the task..."
                                        maxLength={50}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        isInvalid={name.length === 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid name.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Story points</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter the story points of the task..."
                                        maxLength={2}
                                        value={storyPoints}
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) setStoryPoints(e.target.value)
                                        }}
                                        required
                                        isInvalid={storyPoints.length <= 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid number for the story points.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        placeholder="Enter the description of the task..."
                                        value={description}
                                        onChange={(e) => {setDescription(e.target.value)}}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Collaborator</Form.Label>
                                    <Form.Select value={collaborator} onChange={(e) => setCollaborator(e.target.value)}>
                                        {collaboratorOptions}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            {!isAddForm &&
                                <Col>
                                    <Form.Group className={"mb-3"}>
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            {statusOptions}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            }
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-primary mt-5"}>{isAddForm ? "Add" : "Edit"} task</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            <Row className={"pt-3 px-3"}>
                <Col className={"text-start flex-grow-1"}>
                    <h2 className={"h2"}>Tasks</h2>
                </Col>
                {isAdminOrResponsible &&
                    <Col className={"text-end col-auto mt-1"}>
                        <Button className={"btn btn-primary justify-content-center"}
                                onClick={() => {
                                    setIsAddForm(true)
                                    setShowFormModal(true)
                                }}>
                            <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                            Add Task
                        </Button>
                    </Col>
                }
            </Row>
            <Row className={"pt-3 px-3"}>
                <Col className={"col-auto"}>
                    <ToggleButton
                        id={"myTasksToggleButton"}
                        value={"1"}
                        checked={myTasks}
                        type={"checkbox"}
                        className={myTasks ? "btn-primary" : "btn-primary unchecked"}
                        onChange={(e) => setMyTasks(e.currentTarget.checked)}>
                        MyTasks
                    </ToggleButton>
                </Col>
                <Col className={"flex-grow-1"}>
                    <Form>
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch}/>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxLength="50"
                            />
                        </InputGroup>
                    </Form>
                </Col>
            </Row>
            <Row className={"px-3 pt-3"} md={3} xs={1}>
                <Col className={"mb-3"}>
                    <Card className={"bg-white"}>
                        <Card.Header className={"h3"}>
                            To Do
                        </Card.Header>
                        <Card.Body>
                            <Row md={1} xs={1} className={"g-3"}>
                                {TodoCards}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={"mb-3"}>
                    <Card className={"bg-white"}>
                        <Card.Header className={"h3"}>
                            Doing
                        </Card.Header>
                        <Card.Body>
                            <Row md={1} xs={1} className={"g-3"}>
                                {DoingCards}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={"mb-3"}>
                    <Card className={"bg-white"}>
                        <Card.Header className={"h3"}>
                            Done
                        </Card.Header>
                        <Card.Body>
                            <Row md={1} xs={1} className={"g-3"}>
                                {DoneCards}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectTasks