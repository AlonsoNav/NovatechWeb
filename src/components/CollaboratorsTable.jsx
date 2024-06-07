// Styles imports
import "../styles/Style.css"
// Fontawesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
// Bootstrap imports
import Table from "react-bootstrap/Table"
// React imports
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
// Local imports
import {useAuth} from "../contexts/AuthContext.jsx";

const CollaboratorsTable = ({ collaborators, handleEdit, handleDelete, showProjectColumn = true,
                                showEditButton = true , isResponsible = false, responsible = ""}) => {
    CollaboratorsTable.propTypes = {
        collaborators: PropTypes.array.isRequired,
        handleEdit: PropTypes.func,
        handleDelete: PropTypes.func.isRequired,
        showProjectColumn: PropTypes.bool,
        showEditButton: PropTypes.bool,
        isResponsible: PropTypes.bool,
        responsible: PropTypes.string
    }

    // Data
    const { isAdmin } = useAuth();
    const isAdminOrResponsible = isAdmin || isResponsible;
    // Sort
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [sortedCollaborators, setSortedCollaborators] = useState([]);

    // Sort table
    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    useEffect(() => {
        let sortedCollaborators = [...collaborators];
        sortedCollaborators.sort((a, b) => {
            let aValue = a[sortConfig.key] == null ? "Free" : a[sortConfig.key]
            let bValue = b[sortConfig.key] == null ? "Free" : b[sortConfig.key]
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setSortedCollaborators(sortedCollaborators);
    }, [sortConfig, collaborators]);

    const collaboratorItems = sortedCollaborators.map((collaborator, index) => (
        <tr key={index}>
            <td>{collaborator.id}</td>
            <td>{collaborator.name}</td>
            <td>{collaborator.email}</td>
            <td>{collaborator.phone}</td>
            {showProjectColumn && <td>{collaborator.project != null ? collaborator.project : "Free"}</td>}
            <td>{collaborator.department}</td>
            {isAdminOrResponsible ?
                <td>
                    {showEditButton &&
                        <button className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEdit(collaborator)}>
                            <FontAwesomeIcon icon={faEdit}/>
                        </button>
                    }
                    {(isAdmin || (isResponsible && responsible !== collaborator.email)) &&
                        <button className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(collaborator)}>
                            <FontAwesomeIcon icon={faTrash}/>
                        </button>
                    }
                </td>
                :
                <td>

                </td>
            }
        </tr>
    ))

    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th onClick={() => requestSort('id')}>Id</th>
                <th onClick={() => requestSort('name')}>Name</th>
                <th onClick={() => requestSort('email')}>Email</th>
                <th onClick={() => requestSort('phone')}>Phone</th>
                {showProjectColumn && <th onClick={() => requestSort('project')}>Project</th>}
                <th onClick={() => requestSort('department')}>Department</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {collaboratorItems}
            </tbody>
        </Table>
    )
}

export default CollaboratorsTable;