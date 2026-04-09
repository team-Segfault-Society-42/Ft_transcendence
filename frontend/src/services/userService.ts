import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:1024/api/",
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function userLogin(data: unknown) {
    const response = await api.post('auth/login', data)
    return response.data
}

export async function createUser(data: unknown) {
    const response = await api.post('auth/register', data)
    return response.data;
}

export async function getUser(id: unknown) {
    const response = await api.get('users/' + id)
    return response.data
}

export async function updateUser(id: unknown, data: unknown) {
    const response = await api.patch('users/' + id, data)
    return response.data
}

export const userService = {
    getUser,
    updateUser,
    createUser,
    userLogin,
}
