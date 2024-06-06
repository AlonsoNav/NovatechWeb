// Styles imports
import '../../styles/Style.css'
// Local imports
import TaskCard from "../../components/TaskCard.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import ToggleButton from "react-bootstrap/ToggleButton";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faSearch} from "@fortawesome/free-solid-svg-icons";
// React imports
import {useState} from "react";


const ProjectTasks = () => {
    // Data
    const [tasks, setTask] = useState([{name: "Task 1", responsible: "User 1", description: "Description 1", storyPoints: 1, state:'Todo'},
        {name: "Task 2", responsible: "User 2", description: "Description 2", storyPoints: 2, state:'Doing'},
        {name: "Task 3", responsible: "User 3", description: "Description 3", storyPoints: 3, state:'Done'},
        {name: "Task 1", responsible: "User 1", description: "Description 1", storyPoints: 1, state:'Todo'},
        {name: "Task 2", responsible: "User 2", description: "Description 2", storyPoints: 2, state:'Doing'},
        {name: "Task 3", responsible: "User 3", description: "Description 3", storyPoints: 3, state:'Done'},
        {name: "Task 1", responsible: "User 1", description: "Description 1", storyPoints: 1, state:'Todo'},
        {name: "Task 2", responsible: "User 2", description: "Description 2", storyPoints: 2, state:'Doing'},
        {name: "Task 3", responsible: "User 3", description: "Description 3", storyPoints: 3, state:'Done'}])
    // Filters
    const [myTasks, setMyTasks] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Tasks card
    const TodoCards = tasks.filter(task => task.state === 'Todo').map((task, index) => (
        <Col key={`task_todo_card_${index}`}>
            <TaskCard task={task}/>
        </Col>
    ))

    const DoingCards = tasks.filter(task => task.state === 'Doing').map((task, index) => (
        <Col key={`task_doing_card_${index}`}>
            <TaskCard task={task}/>
        </Col>
    ))

    const DoneCards = tasks.filter(task => task.state === 'Done').map((task, index) => (
        <Col key={`task_done_card_${index}`}>
            <TaskCard task={task}/>
        </Col>
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <Row className={"pt-3 px-3"}>
                <Col className={"text-start flex-grow-1"}>
                    <h2 className={"h2"}>Tasks</h2>
                </Col>
                <Col className={"text-end col-auto mt-1"}>
                    <Button className={"btn btn-primary justify-content-center"}>
                        <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                        Add Task
                    </Button>
                </Col>
            </Row>
            <Row className={"pt-3 px-3"}>
                <Col className={"col-auto"}>
                    <ToggleButton
                        id={"myTasksToggleButton"}
                        value={"1"}
                        checked={myTasks}
                        type={"checkbox"}
                        className={myTasks ? "btn-primary active" : "btn-primary"}
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