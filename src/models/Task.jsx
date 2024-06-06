class Task {
    constructor(id, name, responsible, description, storyPoints, status) {
        this.id = id
        this.name = name
        this.responsible = responsible
        this.status = status
        this.description = description
        this.storyPoints = storyPoints
    }
}

export default Task