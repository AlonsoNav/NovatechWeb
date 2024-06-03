const API_URL = import.meta.env.VITE_APP_API_URL

export async function postRequest(payload, endpoint) {
    const requestOptions = {
        method: 'POST',
        mode: "cors",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    }

    try {
        return await fetch(`${API_URL}${endpoint}`, requestOptions)
    } catch (error) {
        console.log(error)
    }
}