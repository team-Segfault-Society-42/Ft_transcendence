const url = "http://localhost:3000/"

export async function getUser(id) {

    try {
        const response = await fetch(url + "users/" + id)
        if (!response.ok) {
            throw new Error("User not found")
        }
        const res = await response.json()
        console.log(res) // debug
        return (res)

    } catch (error: any) {
        console.log("Error : " + error.message)
        throw new Error("User not found")
    }
}

export async function updateUser(id, data) {
    try {
        const response = await fetch(url + "users/" + id, 
        {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
        if (!response.ok) {
            throw new Error("Edit not permited")
        }
        const res = await response.json()
        console.log(res) // debug
        return (res)
    } catch (error: any) {
        console.log("Error : " + error.message)
        throw new Error("Edit not permited")
    }
}

export const userService = {
    getUser,
    updateUser
}
