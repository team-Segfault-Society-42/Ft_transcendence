const url = "http://localhost:1024/api/"

export async function getUser(id) {

    try {
        const response = await fetch(url + "users/" + id)
        if (!response.ok) {
            throw new Error("User not found") // change here to backend message
        }
        const res = await response.json()
        console.log(res) // debug
        return (res)

    } catch (error: any) {
        console.log("Error : " + error.message)
        throw new Error("User not found") // change here to backend message
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
            throw new Error("Edit not permited") // change here to backend message
        }
        const res = await response.json()
        console.log(res) // debug
        return (res)
    } catch (error: any) {
        console.log("Error : " + error.message)
        throw new Error("Edit not permited") // change here to backend message
    }
}

export async function createUser(data) {
    try {
        const response = await fetch(url + "auth/register", 
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
        throw Error("User creation failed !") // change here to backend message
    }
    const res = await response.json()
    return res
    } catch (error: any) {
        throw Error("User creation failed !") // change here to backend message
    }
}

export const userService = {
    getUser,
    updateUser,
    createUser
}
