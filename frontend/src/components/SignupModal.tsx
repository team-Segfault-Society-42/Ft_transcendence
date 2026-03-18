import { useState } from 'react'
import { userService } from '../services/userServices'


export default function SignupModal() {

    const [username, setUserName] = useState("")
    const [bio, setBio] = useState("")
    const id = 1; // for test, before add UUID

    async function handleRegister() {
        const data = { username, bio }
        try {
            await userService.updateUser(id, data)
            alert("Updated successfully!")
        

        } catch (error: any) {
            alert("Error : " + error.message)
        }

    }

    return (
    <main>
        <div style={{ border: '2px solid black', padding: '20px', margin: '10px' }}>
            <h2> Signup </h2>
            <p> Username : </p>
            <input style={{ border: '2px solid black', padding: '3px', margin: '10px' }}
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
            />
            <p> Bio : </p>
            <input style={{ border: '2px solid black', padding: '3px', margin: '10px' }}
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <br /><br />
            <button style={{ border: '2px solid black', padding: '3px', margin: '10px' }} onClick={() => handleRegister()} > Register </button>

        </div>
    </main>
    )
}