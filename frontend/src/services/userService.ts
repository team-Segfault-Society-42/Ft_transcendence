import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:1024/api/",
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function createUser(data) {
    const response = await api.post('auth/register', data)
    return response.data;
}

export async function getUser(id) {
    const response = await api.get('users/' + id)
    return response.data
}

export async function updateUser(id, data) {
    const response = await api.patch('users/' + id, data)
    return response.data
}

export const userService = {
    getUser,
    updateUser,
    createUser
}
