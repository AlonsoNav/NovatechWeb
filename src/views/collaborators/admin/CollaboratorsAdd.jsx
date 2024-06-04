// Local imports
import '../../../styles/Style.css'
import {validateEmail, validatePhone} from "../../../controllers/InputValidation.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
// React imports
import {useEffect, useState} from "react";
import {getRequest, postRequest} from "../../../controllers/Database.jsx";
import ToastComponent from "../../../components/ToastComponent.jsx";

const CollaboratorsAdd = () => {
    // Form values
    const [email, setEmail] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [id, setId] = useState('')
    const [department, setDepartment] = useState('Accountability')
    const [project, setProject] = useState('Free')
    // Selector values
    const [departments, setDepartments] = useState(["Accountability", "Administration", "HR", "IT"])
    const [projects, setProjects] = useState([])
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    // Fetch data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getRequest("proyectos/")

                if (!response){
                    setToastMessage("Could not connect to the server.")
                    setShowToast(true)
                }
                else {
                    const body = await response.json()
                    if (!response.ok) {
                        setToastMessage(body.message)
                        setShowToast(true)
                    }else{
                        let projectNames = body.map(project => project.nombre)
                        projectNames.unshift("Free") // Add free option at the beginning of the list
                        setProjects(projectNames)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchProjects()
    }, [])

    // Selector options
    const departmentOptions = departments.map((department, index) => (
        <option key={`department_${index}`} label={department} value={department}></option>
    ))

    const projectOptions = projects.map((project, index) => (
        <option key={`project_${index}`} label={project} value={project}></option>
    ))

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget;
        if(form.checkValidity() === false
            || !validateEmail(email)
            || !validatePhone(phone)
            || id.length !== 9
            || name.length <= 0
            || password.length <= 0
            || confirmedPassword !== password)
            return

        let payload = {
            cedula: id,
            nombre: name,
            correo: email,
            departamento: department,
            telefono: phone,
            contrasena: password,
            nombreProyecto: project
        }
        try{
            let response = await postRequest(payload, "colaboradores/")

            if (!response){
                setToastMessage("Could not connect to the server.")
                setShowToast(true)
            }
            else{
                const body = await response.json()
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    return (
        <Container fluid className={"m-header min-vw-100 min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
            <Row className={"text-start p-3"}>
                <Col>
                    <h1 className={"h1 mb-3"}>Add collaborator</h1>
                    <Form noValidate onSubmit={handleSubmit}>
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
                                    <Form.Select onChange={e => setDepartment(e.target.value)}>
                                        {departmentOptions}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={{span:6, order:4}} xs={{order:4}}>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Project name</Form.Label>
                                    <Form.Select onChange={e => setProject(e.target.value)}>
                                        {projectOptions}
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