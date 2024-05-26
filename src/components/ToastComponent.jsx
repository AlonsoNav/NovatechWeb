import Toast from 'react-bootstrap/Toast';
import ToastContainer from "react-bootstrap/ToastContainer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";

const ToastComponent = ({message, show, onClose}) => {
    ToastComponent.propTypes = {
        message: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    return (
        <ToastContainer className={"position-fixed p-3"} position={"bottom-end"} style={{ zIndex: 1 }}>
            <Toast bg={"danger"} onClose={onClose} show={show} delay={3000} autohide>
                <Toast.Header className={"text-start"}>
                    <FontAwesomeIcon icon={faExclamationCircle} className={"me-2"}/>
                    <small className={"me-auto fs-6"}>{message}</small></Toast.Header>
            </Toast>
        </ToastContainer>
    )
}

export default ToastComponent