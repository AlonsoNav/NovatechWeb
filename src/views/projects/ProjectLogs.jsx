// Styles imports
import '../../styles/Style.css'
import 'react-datepicker/dist/react-datepicker.css';
// Local imports
import ToastComponent from "../../components/ToastComponent.jsx";
import {getRequest} from "../../controllers/Database.jsx";
import Log from "../../models/Log.jsx";
import {filterByDateRange, filterTitleBySearchTerm} from "../../controllers/Filters.jsx";
// Bootstrap imports
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";
// React imports
import {useEffect, useState} from "react";
import DatePicker from 'react-datepicker';
import PropTypes from "prop-types";
// Fontawesome imports
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

const ProjectLogs = ({projectName}) => {
    ProjectLogs.propTypes = {
        projectName: PropTypes.string.isRequired
    }

    // Data
    const [resultsAmount, setResultsAmount] = useState(0)
    const [logs, setLogs] = useState([])
    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [filteredLogs, setFilteredLogs] = useState([])
    // Sort
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
    const [sortedLogs, setSortedLogs] = useState([])
    // Components
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")

    // Fetch data
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await getRequest(`proyectos/${projectName}/cambios`)

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
                        const logsMap = body.map(log => {
                            return new Log(
                                log.titulo,
                                log.descripcion,
                                new Date(log.tiempo)
                            )
                        })
                        setLogs(logsMap)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchLogs()
    }, [projectName]);

    // Set results amount
    useEffect(() => {
        setResultsAmount(filteredLogs.length)
    }, [filteredLogs])

    // Set filters
    useEffect(() => {
        const filteredLogs = logs.filter(log => {
            return filterTitleBySearchTerm(log, searchTerm) && filterByDateRange(log, startDate, endDate)
        })

        setFilteredLogs(filteredLogs)
    }, [logs, startDate, endDate, searchTerm])

    // Sort table
    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    useEffect(() => {
        let sortedLogs = [...filteredLogs];
        sortedLogs.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setSortedLogs(sortedLogs);
    }, [sortConfig, filteredLogs]);

    // Table items
    const logItems = sortedLogs.map((log, index) => (
        <tr key={index}>
            <td>{log.title}</td>
            <td>{log.description}</td>
            <td>{log.date.toLocaleDateString()}</td>
        </tr>
    ))

    return(
        <Container fluid className={"bg-secondary color-secondary custom-min-vh-100"}>
            <ToastComponent
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
            <Row className={"pt-3 px-3"}>
                <Col className={"text-start"}>
                    <h2 className={"h2"}>Logs</h2>
                    <span className={"text-muted"}>{resultsAmount} results</span>
                </Col>
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
            <Row className={"pt-3 px-3"}>
                <Col className={"table-responsive text-start"}>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('title')}>Title</th>
                            <th>Description</th>
                            <th onClick={() => requestSort('date')}>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logItems}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}
export default ProjectLogs