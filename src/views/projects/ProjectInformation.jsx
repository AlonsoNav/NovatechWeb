// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ToastComponent from "../../components/ToastComponent.jsx";
import {getRequest, putRequest} from "../../controllers/Database.jsx";
import ModalComponent from "../../components/ModalComponent.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
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
    const { isAdmin } = useAuth();
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    // Form data
    const [budget, setBudget] = useState("");
    const [responsible, setResponsible] = useState("");
    const [endDate, setEndDate] = useState(today)
    const [description, setDescription] = useState("");
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("danger")
    const [showEditModal, setShowEditModal] = useState(false)

    // Get project data
    useEffect(() => {
        const getProjectData = () => {
            setBudget(project.budget)
            setResponsible(project.responsible)
            setStartDate(project.startDate)
            setEndDate(project.endDate)
            setDescription(project.description)
        }

        const determinateIsAdminOrResponsible = () => {
            const user = JSON.parse(localStorage.getItem("user"))
            if (isAdmin || responsible === user.correo)
                setIsAdminOrResponsible(true)
        }

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
                    } else {
                        let collaboratorEmails = body.map(collaborator => collaborator.correo)
                        collaboratorEmails.unshift(responsible)
                        setCollaboratorsAvailable(collaboratorEmails)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        getProjectData()
        determinateIsAdminOrResponsible()
        if(isAdmin)
            fetchCollaboratorsAvailable()
    }, [project]);

    // Selector options
    const collaboratorOptions = collaboratorsAvailable.map((collaborator, index) => (
        <option key={`collaborator_${index}`} label={collaborator} value={collaborator}></option>
    ))

    // Submit edit
    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget
        if (form.checkValidity() === false)
            return
        setShowEditModal(true)
    }

    const handleEditConfirmed = async () => {
        setShowEditModal(false)
        let payload = {
            presupuesto: budget,
            descripcion: description,
            correoResponsable: responsible,
            fechaFinal: endDate
        }
        try{
            let response = await putRequest(payload, `proyectos/${project.name}`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg('danger')
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok)
                    setToastBg("danger")
                else
                    setToastBg("info")
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <ModalComponent
                onClose={() => {
                    setShowEditModal(false)
                }}
                onConfirm={() => handleEditConfirmed()}
                show={showEditModal}
                title={"Save changes"}
                message={"Are you sure you want to keep these changes?"}
                confirmButtonText={"Save changes"}
                confirmButtonVariant={"primary"}
            />
            <Row className={"pt-3 px-3 text-start"}>
                <Col>
                    <h2 className={"h2 mb-3"}>Information</h2>
                    <Form noValidate onSubmit={handleSubmit}>
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
                                        readOnly={!isAdminOrResponsible}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Responsible</Form.Label>
                                    {isAdmin ?
                                        <Form.Select
                                            value={responsible}
                                            onChange={e => setResponsible(e.target.value)}
                                        >
                                            {collaboratorOptions}
                                        </Form.Select>
                                        :
                                        <Form.Control
                                            type="text"
                                            value={responsible}
                                            readOnly/>
                                    }
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
                                        readOnly={!isAdminOrResponsible}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row md={2} xs={1}>
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
                                        readOnly={!isAdminOrResponsible}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {isAdminOrResponsible &&
                            <div className={"text-end"}>
                                <button type="submit" className={"btn btn-lg btn-primary my-2"}>Edit project</button>
                            </div>
                        }
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectInformation