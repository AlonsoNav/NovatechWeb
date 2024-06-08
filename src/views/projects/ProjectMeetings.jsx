// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import DatePicker from 'react-datepicker';
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// Local imports
import {useAuth} from "../../contexts/AuthContext.jsx";
import {deleteRequest, getRequest, postRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import Meeting from "../../models/Meeting.jsx";
import {filterByDateRange, filterTitleBySearchTerm} from "../../controllers/Filters.jsx";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import ModalComponent from "../../components/ModalComponent.jsx";

const ProjectMeetings = ({projectName, responsible}) => {
    ProjectMeetings.propTypes = {
        projectName: PropTypes.string.isRequired,
        responsible: PropTypes.string.isRequired
    }

    // Data
    const user = JSON.parse(localStorage.getItem("user"))
    const {isAdmin} = useAuth()
    const [resultsAmount, setResultsAmount] = useState(0)
    const [isAdminOrResponsible, setIsAdminOrResponsible] = useState(isAdmin)
    const [meetings, setMeetings] = useState([])
    const platforms = ["Zoom", "Meets", "Teams", "Discord"]
    const today = new Date()
    const [selectedMeeting, setSelectedMeeting] = useState({})
    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState(today)
    const [filteredMeetings, setFilteredMeetings] = useState([])
    // Form data
    const [title, setTitle] = useState("")
    const [platform, setPlatform] = useState(platforms[0])
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(today)
    // Components
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastBg, setToastBg] = useState("danger")

    // Fetch data
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await getRequest(`reuniones/${projectName}`)

                if (!response){
                    setToastMessage("Could not connect to the server.")
                    setShowToast(true)
                }
                else {
                    const body = await response.json()
                    if (!response.ok) {
                        setToastMessage(body.message)
                        setShowToast(true)
                    } else{
                        const meetingsMap = body.map(meeting => {
                            return new Meeting(
                                meeting._id,
                                meeting.temaReunion,
                                meeting.descripcion,
                                new Date(meeting.fecha),
                                meeting.medioReunion
                            )
                        })
                        setMeetings(meetingsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchMeetings()
    }, [projectName]);

    useEffect(() => {
        if (isAdmin || responsible === user.correo){
            setIsAdminOrResponsible(true)
        }
    }, [responsible]);

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredMeetings.length)
    }, [filteredMeetings])

    // Set filters
    useEffect(() => {
        const filteredMeetings = meetings.filter(meeting => {
            return filterTitleBySearchTerm(meeting, searchTerm) && filterByDateRange(meeting, startDate, endDate)
        })

        setFilteredMeetings(filteredMeetings)
    }, [meetings, startDate, endDate, searchTerm])

    // Add meeting
    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const form = e.currentTarget
        if (form.checkValidity() === false)
            return
        let payload = {
            temaReunion: title,
            descripcion: description,
            fecha: date,
            medioReunion: platform,
        }
        try{
            let response = await postRequest(payload, `reuniones/${projectName}`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg("danger")
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok)
                    setToastBg("danger")
                else{
                    setToastBg("info")
                    const newMeeting = new Meeting(
                        body._id,
                        title,
                        description,
                        date,
                        platform,
                    )
                    setMeetings(prevMeetings => [...prevMeetings, newMeeting])
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    // Delete meeting
    const handleDelete = (meeting) => {
        setSelectedMeeting(meeting)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirmed = async () => {
        setShowDeleteModal(false)
        try{
            let response = await deleteRequest(`reuniones/${projectName}/${selectedMeeting.id}`)

            if (!response){
                setToastMessage("Could not connect to the server.")
                setToastBg('danger')
                setShowToast(true)
            }
            else{
                const body = await response.json()
                if (!response.ok) {
                    setToastBg('danger')
                }else{
                    setMeetings(meetings.filter(meeting => meeting.id !== selectedMeeting.id))
                    setToastBg('info')
                }
                setToastMessage(body.message)
                setShowToast(true)
            }
        }catch (error){
            console.log(error)
        }
    }

    // Meeting cards
    const meetingCards = filteredMeetings.map((meeting, index) => (
        <Col key={`meeting_card_${index}`} >
            <Card className={"text-start"}>
                <Card.Body>
                    <Row className={"mb-2"}>
                        <Col className={"flex-grow-1"}>
                            <Card.Title>{meeting.title}</Card.Title>
                            <Card.Subtitle>{meeting.platform}</Card.Subtitle>
                        </Col>
                        {isAdminOrResponsible &&
                            <Col className={"col-auto"}>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(meeting)}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Col className={"flex-grow-1"}>
                            <Card.Text>{meeting.description}</Card.Text>
                        </Col>
                        <Col className={"col-auto bg-secondary rounded-pill me-2 color-secondary align-self-end"}>
                            {meeting.date.toLocaleDateString()}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    ))

    // Platform selector
    const platformOptions = platforms.map((platform, index) => (
        <option key={`platform_${index}`} value={platform}>{platform}</option>
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
            <ModalComponent
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => handleDeleteConfirmed()}
                show={showDeleteModal}
                title={"Confirm Meeting Delete"}
                message={`Are you sure you want to delete the meeting ${selectedMeeting.title}?`}
                confirmButtonText={"Delete"}
                confirmButtonVariant={"danger"}
            />
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Meeting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row md={2} xs={1}>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter the title of the meeting..."
                                        maxLength={50}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        isInvalid={title.length === 0}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        Please enter a valid title.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className={"mb-3"}>
                                    <Form.Label>Platform</Form.Label>
                                    <Form.Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                                        {platformOptions}
                                    </Form.Select>
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
                                        placeholder="Enter the description of the task..."
                                        value={description}
                                        onChange={(e) => {setDescription(e.target.value)}}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row md={2} xs={1}>
                            <Col>
                                <DatePicker
                                    selected={date}
                                    onChange={date => setDate(date)}
                                    minDate={today}
                                    className="form-control mb-3"
                                />
                            </Col>
                        </Row>
                        <div className={"text-end"}>
                            <button type="submit" className={"btn btn-primary mt-5"}>Add meeting</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            <Row className={"pt-3 px-3"}>
                <Col className={"text-start flex-grow-1"}>
                    <h2 className={"h2"}>Meetings</h2>
                    <span className={"text-muted"}>{resultsAmount} results</span>
                </Col>
                {isAdminOrResponsible &&
                    <Col className={"text-end col-auto mt-1"}>
                        <Button className={"btn btn-primary justify-content-center"}
                                onClick={() => {setShowAddModal(true)}}>
                            <FontAwesomeIcon icon={faAdd} className={"me-2"}/>
                            Add Meeting
                        </Button>
                    </Col>
                }
            </Row>
            <Form>
                <Row className={"pt-3 px-3"}>
                    <Col className={"col-auto"}>
                        <Form.Group>
                            <Row>
                                <Col>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={date => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        className="form-control"
                                    />
                                </Col>
                                <Col>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        className="form-control"
                                    />
                                </Col>
                            </Row>
                        </Form.Group>
                    </Col>
                    <Col className={"flex-grow-1"}>
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch}/>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                maxLength="30"
                            />
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
            <Row md={3} xs={1} className={"px-3 pt-3 g-3"}>
                {meetingCards}
            </Row>
        </Container>
    )
}
export default ProjectMeetings