import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faEdit, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
import Row from "react-bootstrap/Row";
import {useState} from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import {Table} from "react-bootstrap";

const Projects = () => {
    const [resultsAmount, setResultsAmount] = useState(4)
    const [filteredProjects, setFilteredProjects] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const handleDelete = (project) => {}

    return(
        <Container fluid className={"m-header p-3"}>
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
                <Col>
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
            <Row>
                <Col className={"table-responsive"}>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Coordinator</th>
                            <th>Start date</th>
                            <th>End date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProjects.map((project, index) => (
                            <tr key={index}>
                                <td>{project.name}</td>
                                <td>{project.coordinator}</td>
                                <td>{project.start_date}</td>
                                <td>{project.end_date}</td>
                                <td>{project.status}</td>
                                <td>
                                    <Link to={{pathname: "/projects/info", state: {project}}} className="btn btn-sm btn-primary me-1">
                                        <FontAwesomeIcon icon={faEdit}/>
                                    </Link>
                                    <button className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(project)}>
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

export default Projects