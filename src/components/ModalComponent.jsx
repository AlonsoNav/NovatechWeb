import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PropTypes from "prop-types";

const ModalComponent = ({ show, onClose, title, message, confirmButtonText, confirmButtonVariant, onConfirm }) => {
    ModalComponent.propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        confirmButtonText: PropTypes.string.isRequired,
        confirmButtonVariant : PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
    }
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant={confirmButtonVariant} onClick={onConfirm}>
                    {confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalComponent;