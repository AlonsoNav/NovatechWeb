export const determineProjectStatus = (startDate, endDate) => {
    const today = new Date()
    if (today < startDate)
        return "Not started"
    else if (today < endDate)
        return "Started"
    else
        return "Finished"
}