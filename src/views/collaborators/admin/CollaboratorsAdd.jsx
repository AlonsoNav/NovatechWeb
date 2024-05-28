import '../../../styles/Style.css'
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {validateEmail, validatePhone} from "../../../controllers/InputValidation.jsx";
import {useState} from "react";

const CollaboratorsAdd = () => {
    const [email, setEmail] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [id, setId] = useState('')

    return (
        <Container fluid className={"m-header min-vw-100 min-vh-100"}>
            <Row className={"text-start p-3"}>
                <Col>
                    <h1 className={"h1 mb-3"}>Add collaborator</h1>
                    <Form noValidate>
                        <Row md={2} xs={1}>
                            <Col md={{order:1}} xs={{order: 1}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Id</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter id..."
                                        maxLength={9}
                                        value={id}
                                        onChange={(e) => {if (!isNaN(e.target.value)) setId(e.target.value)}}
                                        required
                                        isInvalid={id.length !== 9}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid id.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:1}} xs={{order: 1}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name..."
                                        maxLength={30}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        isInvalid={name.length <= 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid name.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:2}} xs={{order: 2}}>
                                <Form.Group className={"mb-3"} >
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email..."
                                        maxLength={100}
                                        value={email}
                                        onChange={(e) => {setEmail(e.target.value)}}
                                        required
                                        isInvalid={!validateEmail(email)}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid email (@estudiantec.cr).
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:3}} xs={{order: 3}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter phone..."
                                        maxLength={8}
                                        value={phone}
                                        onChange={(e) => {if (!isNaN(e.target.value)) setPhone(e.target.value)}}
                                        required
                                        isInvalid={!validatePhone(phone)}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid phone number.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:3}} xs={{order: 3}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter the password..."
                                        maxLength={16}
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        isInvalid={password.length === 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid password.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{order:3}} xs={{order: 3}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Confirm password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm the password..."
                                        maxLength={16}
                                        value={confirmedPassword}
                                        required
                                        onChange={(e) => setConfirmedPassword(e.target.value)}
                                        isInvalid={confirmedPassword !== password}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        The password must be the same.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={{span:6, order:4}} xs={{order:4}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Department name</Form.Label>
                                    <Form.Select>
                                        <option>Default option</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={{span:6, order:4}} xs={{order:4}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Project name</Form.Label>
                                    <Form.Select>
                                        <option>Default option</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-lg btn-primary mt-5"}>Add collaborator</button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default CollaboratorsAdd