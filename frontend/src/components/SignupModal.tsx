import { useState } from 'react'
import { userService } from '../services/userService'


export default function SignupModal(props) {

    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const id = 1;
    
    async function handleRegister() {
        const data = { username, bio }
        setIsLoading(true)
        try {
            await userService.updateUser(id, data)
            alert("Updated successfully!")
            setIsSuccess(true)
            setTimeout(() => {props.closed();}, 2000 )

        } catch (error: any) {
            alert("Error : " + error.message)
        } finally {
            setIsLoading(false)
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
                onChange={(e) => setUsername(e.target.value)}
            />
            <p> Bio : </p>
            <input style={{ border: '2px solid black', padding: '3px', margin: '10px' }}
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <br /><br />
            <button style={{ border: '2px solid black', padding: '3px', margin: '10px' }} disabled={isLoading} onClick={() => handleRegister()} > {isLoading ? "Loading.." : "Register"} </button>
            {isSuccess && (
                <p style={{ color: 'green',}} > Profile updated successfully! </p>
            )}
        </div>
    </main>
    )
}