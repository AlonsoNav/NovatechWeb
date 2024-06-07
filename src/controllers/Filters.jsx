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

export const filterTitleBySearchTerm = (item, searchTerm) => {
    if (searchTerm === "")
        return true
    else {
        const searchTermLowerCase = searchTerm.toLowerCase()
        const titleLowerCase = item.title.toLowerCase()

        return titleLowerCase.includes(searchTermLowerCase)
    }
}

export const filterByDateRange = (item, startDate, endDate) => {
    // Convert dates to milliseconds to compare them easily
    const date = item.date.getTime();
    const selectedStartDate = new Date(startDate).getTime();
    const selectedEndDate = new Date(endDate).getTime();

    return date >= selectedStartDate && date <= selectedEndDate;
}

export const filterByCheckbox = (item, selectedItems) => {
    if (selectedItems.length === 0)
        return true
    else
        return selectedItems.includes(item)
}

export const filterBySearchTerm = (item, searchTerm) => {
    if (searchTerm === "")
        return true
    else {
        const searchTermLowerCase = searchTerm.toLowerCase()
        const itemLowerCase = item.toLowerCase()

        return itemLowerCase.includes(searchTermLowerCase)
    }
}
