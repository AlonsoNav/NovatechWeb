// Styles imports
import "../../../styles/Style.css"
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ToastComponent from "../../../components/ToastComponent.jsx";
import {getRequest} from "../../../controllers/Database.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
// React imports
import DatePicker from 'react-datepicker';
import {useEffect, useState} from "react";

const ProjectsAdd = () => {
    // Data
    const [collaboratorsAvailable, setCollaboratorsAvailable] = useState([]);
    // Form data
    const [name, setName] = useState("");
    const [budget, setBudget] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [responsible, setResponsible] = useState("");
    const [description, setDescription] = useState("");
    // Components
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastBg, setToastBg] = useState("danger");

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
                    } else
                        setCollaboratorsAvailable(body.map(collaborator => collaborator.correo))
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchCollaboratorsAvailable()
    }, []);

    // Form submit
    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    // Selector options
    const collaboratorOptions = collaboratorsAvailable.map((collaborator, index) => (
        <option key={`collaborator_${index}`} label={collaborator} value={collaborator}></option>
    ))

    return(
        <Container fluid className={"m-header"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <Row className={"text-start p-3"}>
                <Col>
                    <h1 className={"h1 mb-3"}>Add project</h1>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name..."
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
                                        isInvalid={budget.length <= 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid budget.
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
                                        rows={3}
                                        placeholder="Enter the description of the project..."
                                        value={description}
                                        onChange={(e) => {setDescription(e.target.value)}}
                                        maxLength={100}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"} >
                                    <Form.Label>Start date</Form.Label>
                                    <br/>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={date => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        className="form-control"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"} >
                                    <Form.Label>Expected deadline</Form.Label>
                                    <br/>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        className="form-control"
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
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-lg btn-primary mt-3"}>Add project</button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default ProjectsAdd