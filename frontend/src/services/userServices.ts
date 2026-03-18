const address = "http://localhost:5173/api/"

export async function getUser(id) { // here i will make a UUID

    try {
        const response = await fetch(address + "/user/" + id + "/")
        if (!response.ok) {
            throw new Error("User not found") // a definir
        }
        const res = await response.json()
        console.log(res)
        return(res)

    } catch (error: any {
        console.log("Error : " + error.message)
    }
}

export async function updateUser(id) {
    try {
        const response = await fetch(address + "/user/" + id + "/") {

        }
    }

}
