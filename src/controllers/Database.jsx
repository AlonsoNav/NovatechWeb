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

export async function getRequest(endpoint) {
    const requestOptions = {
        method: 'GET',
        mode: "cors",
        headers: {'Content-Type': 'application/json'}
    }

    try {
        return await fetch(`${API_URL}${endpoint}`, requestOptions)
    } catch (error) {
        console.log(error)
    }
}

export async function deleteRequest(endpoint) {
    const requestOptions = {
        method: 'DELETE',
        mode: "cors",
        headers: {'Content-Type': 'application/json'}
    }

    try {
        return await fetch(`${API_URL}${endpoint}`, requestOptions)
    } catch (error) {
        console.log(error)
    }
}

export async function putRequest(payload, endpoint) {
    const requestOptions = {
        method: 'PUT',
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

export async function getRequest(endpoint) {
    const requestOptions = {
        method: 'GET',
        mode: "cors",
        headers: {'Content-Type': 'application/json'}
    };

    try {
        return await fetch(`${API_URL}${endpoint}`, requestOptions);
    } catch (error) {
        console.log(error);
    }
}

export async function getRequestParams(endpoint, params = {}) {
    const requestOptions = {
        method: 'GET',
        mode: "cors",
        headers: {'Content-Type': 'application/json'}
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, requestOptions);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}