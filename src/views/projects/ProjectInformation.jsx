// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ToastComponent from "../../components/ToastComponent.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
// React imports
import DatePicker from 'react-datepicker';
import {useEffect, useState} from "react";
import PropTypes from 'prop-types';

const ProjectInformation = ({project}) => {
    ProjectInformation.propTypes = {
        project: PropTypes.object.isRequired
    }

    // Data
    const today = new Date()
    const [collaboratorsAvailable, setCollaboratorsAvailable] = useState([]);
    const [startDate, setStartDate] = useState(today)
    // Form data
    const [budget, setBudget] = useState("");
    const [responsible, setResponsible] = useState("");
    const [endDate, setEndDate] = useState(today)
    const [description, setDescription] = useState("");
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("danger")

    useEffect(() => {
        const getProjectData = () => {
            setBudget(project.budget)
            setResponsible(project.responsible)
            setStartDate(project.startDate)
            setEndDate(project.endDate)
            setDescription(project.description)
        }

        getProjectData()
    }, [project]);


    // Selector options
    const collaboratorOptions = collaboratorsAvailable.map((collaborator, index) => (
        <option key={`collaborator_${index}`} label={collaborator} value={collaborator}></option>
    ))

    return(
        <Container fluid className={"bg-secondary"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <Row className={"pt-3 px-3 text-start"}>
                <Col>
                    <h2 className={"h2 mb-3"}>Information</h2>
                    <Form noValidate>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Budget</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter the budget of the project in dollars..."
                                        maxLength={12}
                                        value={budget}
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) setBudget(e.target.value)
                                        }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Responsible</Form.Label>
                                    <Form.Select value={responsible} onChange={e => setResponsible(e.target.value)}>
                                        {collaboratorOptions}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Deadline</Form.Label>
                                    <br/>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={today}
                                        className="form-control"
                                    />
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
                                        placeholder="Enter the description of the project..."
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value)
                                        }}
                                        maxLength={100}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-lg btn-primary my-3"}>Edit project</button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectInformation