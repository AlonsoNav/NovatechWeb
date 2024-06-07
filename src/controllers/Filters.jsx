export const filterCollaboratorsByProjects = (collaborator, selectedProjects) => {
    if (selectedProjects.length === 0)
        return true
    else
        return selectedProjects.includes(collaborator.project != null ? collaborator.project : "Free")
}

export const filterCollaboratorsByDepartment = (collaborator, selectedDepartments) => {
    if (selectedDepartments.length === 0)
        return true
    else
        return selectedDepartments.includes(collaborator.department)
}

export const filterCollaboratorsByStatus = (collaborator, selectedStatuses) => {
    if (selectedStatuses.length === 0)
        return true
    else
        return selectedStatuses.includes(collaborator.status ? "Active" : "Inactive")
}

export const filterCollaboratorsBySearchTerm = (collaborator, searchTerm) => {
    if (searchTerm === "")
        return true
    else {
        const searchTermLowerCase = searchTerm.toLowerCase()
        const collaboratorNameLowerCase = collaborator.name.toLowerCase()
        const collaboratorEmailLowerCase = collaborator.email.split('@')[0].toLowerCase() // Only the email name is compared

        return collaboratorNameLowerCase.includes(searchTermLowerCase) || collaboratorEmailLowerCase.includes(searchTermLowerCase)
    }
}
