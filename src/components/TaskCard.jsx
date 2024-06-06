// Style imports
import '../styles/Style.css'
// Bootstrap imports
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash, faEdit} from "@fortawesome/free-solid-svg-icons";
// React imports
import PropTypes from "prop-types";

const TaskCard = ({task, isAdminOrResponsible, onDelete}) => {
    TaskCard.propTypes = {
        task: PropTypes.object.isRequired,
        isAdminOrResponsible: PropTypes.bool.isRequired,
        onDelete: PropTypes.func.isRequired
    }
    return(
        <Card className={"bg-tertiary color-tertiary text-start"}>
            <Card.Body>
                <Row className={"mb-2"}>
                    <Col className={"flex-grow-1"}>
                        <Card.Title>{task.name}</Card.Title>
                        <Card.Subtitle>{task.responsible}</Card.Subtitle>
                    </Col>
                    {isAdminOrResponsible &&
                        <Col className={"col-auto"}>
                            <Button className="btn btn-sm me-2">
                                <FontAwesomeIcon icon={faEdit}/>
                            </Button>
                            <button className="btn btn-sm btn-danger" onClick={onDelete}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </button>
                        </Col>
                    }
                </Row>
                <Row>
                    <Col className={"flex-grow-1"}>
                        <Card.Text>{task.description}</Card.Text>
                    </Col>
                    <Col className={"col-auto bg-white rounded-pill me-2 color-quaternary align-self-end"}>
                        {task.storyPoints}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}

export default TaskCard