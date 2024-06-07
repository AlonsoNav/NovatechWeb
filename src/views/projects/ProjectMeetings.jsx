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
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
// Local imports
import {useAuth} from "../../contexts/AuthContext.jsx";
import {getRequest} from "../../controllers/Database.jsx";
import ToastComponent from "../../components/ToastComponent.jsx";
import Meeting from "../../models/Meeting.jsx";
import {filterByDateRange, filterTitleBySearchTerm} from "../../controllers/Filters.jsx";
// React imports
import {useEffect, useState} from "react";
import PropTypes from "prop-types";

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
    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [filteredMeetings, setFilteredMeetings] = useState([])
    // Components
    const [showAddModal, setShowAddModal] = useState(false)
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
                                <button className="btn btn-sm btn-danger">
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

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastBg}
            />
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