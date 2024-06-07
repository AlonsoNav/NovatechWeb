class Collaborator {
    constructor(id, name, email, phone, department, project, status = true) {
        this.id = id
        this.name = name
        this.email = email
        this.phone = phone
        this.department = department
        this.project = project
        this.status = status
    }
}

export default Collaborator