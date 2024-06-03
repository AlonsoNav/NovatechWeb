import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Form from "react-bootstrap/Form";
import {useState} from "react";
import { useNavigate } from 'react-router-dom';
// Local Imports
import '../../styles/Style.css';
import Logo from '../../assets/logo.svg';
import {useAuth} from '../../contexts/AuthContext.jsx';
import {validateEmail} from "../../controllers/InputValidation.jsx";
import {postRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget;
        if(form.checkValidity() === false || !validateEmail(email))
            return

        let payload = {
            correo: email,
            contrasena: password
        }
        try{
            let response = await postRequest(payload, "colaboradores/login")

            if (!response){
                setToastMessage("Could not connect to the server.")
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok) {
                    setToastMessage(body.message)
                    setShowToast(true)
                }else{
                    login(body.colaboradorFinal)
                    navigate("/profile")
                }
            }
        }catch (error){
            console.log(error)
        }
    }

    return (
        <Container fluid className={"p-2rem bg-secondary"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
            <Row>
                <Col md={7} className={"bg-primary px-5"}>
                    <Image src={Logo} alt={"Novatech's logo"} fluid/>
                </Col>
                <Col className={"bg-white p-5 text-start"}>
                    <h1 className={"mt-5"}>Login</h1>
                    <p className={"lead"}>Please sign in to continue</p>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className={"mb-3"} controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email..."
                                maxLength={100}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isInvalid={!validateEmail(email)}
                            />
                            <Form.Control.Feedback type='invalid'>
                                Please enter a valid email.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className={"mb-5"} controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password..."
                                required
                                maxLength={16}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                isInvalid={password.length === 0}
                            />
                            <Form.Control.Feedback type='invalid'>
                                Please enter your password.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <div className={"d-grid gap-2 mt-5"}>
                            <button type="submit" className={"btn btn-lg btn-primary"}>Login</button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default Login