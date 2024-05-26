export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(estudiantec\.cr)$/
    return re.test(email)
}

export const validatePhone = (phone) => {
    return phone.length === 8
}