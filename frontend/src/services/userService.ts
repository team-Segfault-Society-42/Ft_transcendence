import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:1024/api/",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

export async function userLogout() {
    const response = await api.post('auth/logout')
    return response.data
}

export async function getMe() {
    const response = await api.get('auth/me')
    return response.data
}

export async function userLogin(data) {
    const response = await api.post('auth/login', data)
    return response.data
}

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
    createUser,
    userLogin,
    getMe,
    userLogout,
}
