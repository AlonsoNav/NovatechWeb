// Local imports
import '../../styles/Style.css'
import ToastComponent from "../../components/ToastComponent.jsx";
import ModalComponent from "../../components/ModalComponent.jsx";
import {validateEmail, validatePhone} from "../../controllers/InputValidation.jsx";
// Bootstrap imports
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from "react-bootstrap/Form";
// Fontawesome imports
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUserCircle} from '@fortawesome/free-solid-svg-icons'
// React imports
import {useState, useEffect} from "react";
import {putRequest} from "../../controllers/Database.jsx";

const Profile = () => {
    // Data
    const user = JSON.parse(localStorage.getItem("user"))
    const [name, setName] = useState('')
    const [id, setId] = useState('')
    const [project, setProject] = useState('')
    const [department, setDepartment] = useState('')
    // Form data
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [phone, setPhone] = useState('')
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastBg, setToastBg] = useState('danger')
    const [showModal, setShowModal] = useState(false)

    // Edit profile
    const handleConfirm = async () => {
        setShowModal(false)
        let payload = {
            correo: email,
            departamento: department,
            telefono: phone,
            contrasena: currentPassword,
            nuevaContrasena: newPassword
        }
        try{
            let response = await putRequest(payload, `colaboradores/${id}`)

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
                    user.correo = email
                    user.telefono = phone
                    localStorage.setItem("user", JSON.stringify(user))
                    setToastBg("info")
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget
        if (form.checkValidity() === false ||
            (email.length !== 0 && !validateEmail(email)) ||
            (phone.length !== 0 && !validatePhone(phone)))
            return
        setShowModal(true)
    }

    // Fetch data
    useEffect(() => {
        setEmail(user.correo)
        setPhone(user.telefono)
        setName(user.nombre)
        setId(user.cedula)
        setProject(user.proyecto ? user.proyecto.nombre : "Free")
        setDepartment(user.departamento)
    }, [])

    return (
        <Container fluid className={"m-header"} >
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <ModalComponent
                onClose={() => setShowModal(false)}
                onConfirm={() => handleConfirm()}
                show={showModal}
                title={"Confirm Profile Update"}
                message={"Are you sure you want to save these changes to this profile?"}
                confirmButtonText={"Save changes"}
                confirmButtonVariant={"primary"}
            />
            <Row className={"bg-secondary p-3 color-secondary"}>
                <Col md={2}>
                    <FontAwesomeIcon icon={faUserCircle} className={"color-secondary img-fluid"}/>
                </Col>
                <Col className={"text-start"}>
                    <h1>Profile</h1>
                    <div className={"fs-4 text-nowrap mt-3"}>
                        <Row md={2} xs={1}>
                            <Col>
                                <span><strong>Name:</strong> {name}</span>
                            </Col>
                            <Col>
                                <span><strong>Id:</strong> {id}</span>
                            </Col>
                            <Col>
                                <span><strong>Project:</strong> {project}</span>
                            </Col>
                            <Col>
                                <span><strong>Department:</strong> {department}</span>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            <Row className={"bg-white p-3 text-start"}>
                <Col>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row md={2} xs={1}>
                            <Col md={{order:2}} xs={{order: 2}}>
                                <Form.Group className={"mb-3"} controlId="formBasicEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email..."
                                        maxLength={100}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        isInvalid={!validateEmail(email)}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:2}} xs={{order: 3}}>
                                <Form.Group className={"mb-3"} controlId="formBasicNewPassword">
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter the new password..."
                                        maxLength={16}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                            <Col md={{order:4}} xs={{order: 4}}>
                                <Form.Group className={"mb-3"} controlId="formBasicCurrentPassword">
                                    <Form.Label>Current password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter the current password..."
                                        maxLength={16}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-lg btn-primary mt-5"}>Edit information</button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default Profile
