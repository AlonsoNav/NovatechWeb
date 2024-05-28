import '../styles/Style.css'
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useState} from "react";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import {Table} from "react-bootstrap";
import ModalComponent from "../components/ModalComponent.jsx";
import { Link } from 'react-router-dom';

const Collaborators = () => {
    const [resultsAmount, setResultsAmount] = useState(4)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredCollaborators, setFilteredCollaborators] = useState([{id: 303330333, name: "John Doe", email: "johndoe@gmail.com", phone: "555-555-5555", project: "Project 1", deparment: "Department 1"},])
    const [collaboratorToDelete, setCollaboratorToDelete] = useState({})
    const [showModal, setShowModal] = useState(false)

    const handleDelete = (collaborator) => {
        setCollaboratorToDelete(collaborator)
        setShowModal(true)
    }

    const handleDeleteConfirmed = () => {
        setShowModal(false)
    }

    return (
      <Container fluid className={"vw-100 m-header vh-100 p-3"}>
          <ModalComponent
              onClose={() => setShowModal(false)}
              onConfirm={() => handleDeleteConfirmed()}
              show={showModal}
              title={"Confirm Collaborator Delete"}
              message={`Are you sure you want to delete the collaborator ${collaboratorToDelete.name}?`}
              confirmButtonText={"Delete"}
              confirmButtonVariant={"danger"}
          />
        <Row className={"mb-3"}>
            <Col className={"text-start flex-grow-1"}>
                <h1 className={"h1"}>Collaborators</h1>
                <span className={"text-muted"}>{resultsAmount} results</span>
            </Col>
            <Col className={"text-end col-auto mt-1"}>
                <Button className={"btn btn-primary justify-content-center"}>
                    <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                    Add Collaborator
                </Button>
            </Col>
        </Row>
        <Row className={"mb-3"}>
            <Col>
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
            <Col className={"table-responsive"}>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Project</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredCollaborators.map((collaborator, index) => (
                        <tr key={index}>
                            <td>{collaborator.id}</td>
                            <td>{collaborator.name}</td>
                            <td>{collaborator.email}</td>
                            <td>{collaborator.phone}</td>
                            <td>{collaborator.project}</td>
                            <td>{collaborator.deparment}</td>
                            <td>
                                <Link to={{pathname: "/collaborators/update", state: {collaborator}}} className="btn btn-sm btn-primary me-1">
                                    <FontAwesomeIcon icon={faEdit}/>
                                </Link>
                                <button className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(collaborator)}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Col>
        </Row>
      </Container>
    )
}

export default Collaborators