// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faFilter, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// Local imports
import {useAuth} from "../../contexts/AuthContext.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Offcanvas from "react-bootstrap/Offcanvas";
import CollaboratorsTable from "../../components/CollaboratorsTable.jsx";

const ProjectCollaborators = ({projectName, responsible}) => {
    ProjectCollaborators.propTypes = {
        projectName: PropTypes.string.isRequired,
        responsible: PropTypes.string.isRequired
    }
    // Data
    const user = JSON.parse(localStorage.getItem('user'))
    const [resultsAmount, setResultsAmount] = useState(0)
    const { isAdmin } = useAuth();
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    const departments = ["Accountability", "Administration", "HR", "IT"]
    // Filters
    const [showOffcanvas, setShowOffcanvas] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartments, setSelectedDepartments] = useState([])
    const [filteredCollaborators, setFilteredCollaborators] = useState([])
    // Components
    const [showAddModal, setShowAddModal] = useState(false)

    // Fetch data
    useEffect(() => {
        if (isAdmin || responsible === user.correo)
            setIsAdminOrResponsible(true)
    }, [responsible]);

    // Delete collaborator
    const handleDelete = () => {

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

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
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
                    <CollaboratorsTable  collaborators={filteredCollaborators} handleDelete={handleDelete} showProjectColumn={false} showEditButton={false}/>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectCollaborators