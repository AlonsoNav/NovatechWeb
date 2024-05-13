import '../styles/Style.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Form from "react-bootstrap/Form";
import Logo from '../assets/logo.svg';
import {useState} from "react";

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(estudiantec\.cr)$/
        return re.test(email)
    }

    return (
        <Container fluid>
            <Row>
                <Col md={7} className={"bg-primary px-5"}>
                    <Image src={Logo} alt={"Novatech's logo"} fluid/>
                </Col>
                <Col className={"bg-white p-5 text-start"}>
                    <h1 className={"mt-5"}>Login</h1>
                    <p className={"lead"}>Please sign in to continue</p>
                    <Form>
                        <Form.Group className={"mb-3"} controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email..."
                                required
                                maxLength={100}
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
                            />
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