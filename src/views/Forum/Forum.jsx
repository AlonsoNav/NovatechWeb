// Imports
const API_URL = import.meta.env.VITE_APP_API_URL
import { Button, Container, Row, Form, Col, InputGroup, Toast, ToastContainer } from 'react-bootstrap'
import { useEffect, useState } from 'react';
// Local Imports
import { postRequest } from '../../controllers/Database';
// Styles
import styles from "./Forum.module.css";

const formatDate = date => {
    const localeDate = new Date(date).toLocaleDateString();
    const localeTime = new Date(date).toLocaleTimeString();
    const res = localeDate + " " + localeTime;
    return res;
}

const Forum = () => {
    // Forum States
    const [forumOptions, setForumOptions] = useState([{ value: "general", label: "General"}]);
    const [currentForum, setCurrentForum] = useState("general");
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [comment, setComment] = useState("");
    const [replies, setReplies] = useState([])

    // Toasts states
    const [showSendComment, setShowSendComment] = useState(false);
    const [showSendReply, setShowSendReply] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [toastErrorMessage, setToastErrorMessage] = useState("");

    // Change forum
    const handleForumSelectChange = e => {
        e.preventDefault();
        setCurrentForum(e.target.value);
    };

    // Change searchTerm
    const handleSearch = e => {
        e.preventDefault();
        setSearchTerm(e.target.value);
    }

    // Write comment
    const handleWriteComment = e => {
        e.preventDefault();
        setComment(e.target.value);
    }

    // Post Comment
    const handlePostComment = async e => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));
        const payload = {
            nombreColaborador: user.nombre, 
            mensaje: comment
        };

        try {
            const res = await postRequest(payload, `foros/mensajes/${currentForum}`);
            if (!res) {
                setToastErrorMessage("There was a problem connecting to the server!")
                setShowErrorToast(true);
                return;
            }
            const body = await res.json();

            if (!res.ok) {
                setToastErrorMessage(body.message);
                setShowErrorToast(true);
                return;
            }
            setComments(body.mensajes);
            setShowSendComment(true);
            setComment("");

        } catch (error) {
            setToastErrorMessage(error.message);
            setShowErrorToast(true);
        }
    };

    // Write reply wrapper and handler
    const handleWriteReplyWrapper = i => {
        const handleWriteReply = e => {
            e.preventDefault();
            const newReplies = [...replies];
            newReplies[i] = e.target.value;
            setReplies(newReplies);
        };
        return handleWriteReply;
    };

    const handlePostReplyWrapper = (i, _id) => {
        const handlePostReply = async e => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem("user"));

            const payload = {
                nombreColaborador: user.nombre, 
                mensaje: replies[i],
                _id
            };
    
            try {
                const res = await postRequest(payload, `foros/mensajes/${currentForum}/respuesta/${_id}`);
                if (!res) {
                    setToastErrorMessage("There was a problem connecting to the server!")
                    setShowErrorToast(true);
                    return;
                }
                const body = await res.json();
    
                if (!res.ok) {
                    setToastErrorMessage(body.message);
                    setShowErrorToast(true);
                    return;
                }
                setComments(body.mensajes);
                setShowSendReply(true);
    
            } catch (error) {
                setToastErrorMessage(error.message);
                setShowErrorToast(true);
            }
            
        };
        return handlePostReply;
    }

    // Get and set forum options
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user.admin) {
            async function getRequest(endpoint) {
                const requestOptions = {
                    method: "GET",
                    mode: "cors",
                    headers: {"Content-Type": "application/json"}
                }
    
                try {
                    const JSONres = await fetch(`${API_URL}${endpoint}`, requestOptions)
                    const res = await JSONres.json();
                    return res;
                } catch (error) {
                    console.log(error)
                }
            }
            getRequest("proyectos")
                .then(projects => {
                    const options = projects
                        .filter(project => project.tieneForo)
                        .map(project => {return { value: project.nombre, tag: project.nombre};});
                    options.push({ value: "general", tag: "General"});
                    setForumOptions(options);
                })
                .catch(err => console.log(err))
        } else {
            const options = [
                { value: "general", tag: "General"}
            ]
            if (user.proyecto.tieneForo) { options.push({ value: user.proyecto.nombre, tag: user.proyecto.nombre}); }
            setForumOptions(options)
        }
    }, [])

    // Init, changeForum or postMessage
    useEffect(() => {
        async function getRequest(endpoint) {
            const requestOptions = {
                method: "GET",
                mode: "cors",
                headers: {"Content-Type": "application/json"}
            }

            try {
                const JSONres = await fetch(`${API_URL}${endpoint}`, requestOptions)
                const res = await JSONres.json();
                return res;
            } catch (error) {
                console.log(error.message)
            }
        }
        getRequest(`foros/${currentForum}`)
            .then(res => setComments(res.mensajes))
            .catch(err => console.log(err));
    }, [currentForum]);
    
    // Search for word, final setComments
    useEffect(() => {
        if (!searchTerm) {
            setReplies(Array(comments.length).fill(""));
            setFilteredComments(comments);
        } else {
            setFilteredComments(comments.filter( comment => 
                comment.mensaje.includes(searchTerm)
                ||
                comment.respuestas.reduce((
                    accumulator, current) => accumulator || current.mensaje.includes(searchTerm),
                    false
                )
            ));
            setReplies(Array(filteredComments.length).fill(""));
        }
    }, [comments, searchTerm])


    return (
        <Container fluid className={"vw-100 m-header bg-secondary container-fluid px-5 " + styles.forumContainer}>
            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 4 }}>
                <Toast bg="danger" show={showErrorToast} onClose={() => setShowErrorToast(false)} delay={3000} autohide >
                    <Toast.Header>
                        <strong className='me-auto'>Error!</strong>
                    </Toast.Header>
                    <Toast.Body>
                        {toastErrorMessage}
                    </Toast.Body>
                </Toast>
                <Toast bg="primary" show={showSendComment} onClose={() => setShowSendComment(false)} delay={3000} autohide>
                    <Toast.Header>
                        <strong className='me-auto'>Comment sent!</strong>
                    </Toast.Header>
                    <Toast.Body className='text-light'>
                        The comment was posted to the forum!
                    </Toast.Body>
                </Toast>
                <Toast bg="primary" show={showSendReply} onClose={() => setShowSendReply(false)} delay={3000} autohide>
                    <Toast.Header>
                        <strong className='me-auto'>Reply sent!</strong>
                    </Toast.Header>
                    <Toast.Body className='text-light'>
                        The comment in the forum has been replied!
                    </Toast.Body>
                </Toast>
                </ToastContainer>
            
            <Row className={"p-2"}>
                <h2>Forum</h2>
            </Row>
            <Row className={"p-1"}>
                <Col>
                    <Form.Select className={"w-1"} size="lg" onChange={handleForumSelectChange} >
                        {forumOptions.map(forum => (<option key={forum.value} value={forum.value}>{forum.tag}</option>))}
                    </Form.Select>
                    
                </Col>
                <Col className={styles.subLabel}>
                    <Form.Control value={searchTerm} onChange={handleSearch} placeholder={"Comment to be searched..."} />
                    <Form.Text  muted>
                        Search for a comment
                    </Form.Text>
                </Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup>
                        <Form.Control value={comment} onChange={handleWriteComment} placeholder={"Comment"} />
                        <Button className={styles.sendBtn} onClick={handlePostComment} >Enviar</Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    {filteredComments.toReversed().map(
                        (comment, i) => {
                            return (
                                <Row key={comment._id} className={"mx-1 my-3 p-1 bg-white border border-dark-subtle rounded ".concat(styles.commentCard)}>
                                    <Col>
                                        <Row>
                                            <h5 className={"pt-2"}>{comment.colaborador.nombre}</h5>
                                            <p className={"fs-4 text-break"}>{comment.mensaje}</p>
                                            <small className={"mb-1 text-secondary"}>{formatDate(comment.tiempo)}</small>
                                        </Row>
                                        {(comment.respuestas.length !== 0) ? comment.respuestas.toReversed().map(
                                            reply => {
                                                return (
                                                    <Row key={reply._id} className={"m-1 mb-3 p-1 bg-secondary border border-dark-subtle rounded"}>
                                                        <p><b>{reply.colaborador.nombre}</b><br />
                                                            {reply.mensaje}
                                                            <br />
                                                        </p>
                                                        <small className={"text-secondary"}>{formatDate(reply.tiempo)}</small>
                                                    </Row>
                                                )
                                            }
                                        ) : ""}
                                        <InputGroup className="my-1">
                                            <Form.Control value={replies[i]} onChange={handleWriteReplyWrapper(i)}  placeholder={"Comment"} />
                                            <Button onClick={handlePostReplyWrapper(i, comment._id)} className={styles.sendBtn}>Enviar</Button>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            )
                        }
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default Forum