// Local Imports
import './Header.css'
import '../styles/Style.css'
import { useAuth } from '../contexts/AuthContext';
// Imports
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUser, faProjectDiagram, faComments, faSignOut, faBarChart} from '@fortawesome/free-solid-svg-icons'

const Header = () => {
    const { isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (event) => {
        event.preventDefault();
        logout();
        navigate("/");
    }

    return(
        <Navbar expand="md" className="bg-primary position-fixed top-0 start-0 w-100 fixed-top">
            <Container fluid>
                <Navbar.Brand className="custom-nav-brand fs-3">
                    <span className="color-primary">Nova</span><span className="color-quinary">tech</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto text-start">
                        <Nav.Link className="custom-nav-link" onClick={e => {e.preventDefault(); navigate("/projects")}}>
                            <FontAwesomeIcon icon={faProjectDiagram} className="me-1" />Projects
                        </Nav.Link>
                        <Nav.Link className="custom-nav-link" onClick={e => {e.preventDefault(); navigate("/forum")}}>
                            <FontAwesomeIcon icon={faComments} className="me-1" />Forum
                        </Nav.Link>
                        <Nav.Link className="custom-nav-link" onClick={e => {e.preventDefault(); navigate("/statistics")}}>
                            <FontAwesomeIcon icon={faBarChart} className="me-1" />Statistics
                        </Nav.Link>
                        {isAdmin &&
                            <Nav.Link className="custom-nav-link" onClick={e => {e.preventDefault(); navigate("/collaborators")}}>
                                <FontAwesomeIcon icon={faUser} className="me-1" />Collaborators
                            </Nav.Link>
                        }
                    </Nav>
                    <Nav className="me-0 text-start">
                        {!isAdmin &&
                            <Nav.Link className="custom-nav-link" onClick={e => {e.preventDefault(); navigate("/profile")}}>
                                <FontAwesomeIcon icon={faUser} className="me-1" />User
                            </Nav.Link>
                        }
                        <Nav.Link className="custom-nav-link" onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOut} className="me-1" />Log out
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;