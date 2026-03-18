import { useState } from 'react'

export default function SignupModal() {

    const [userName, setUserName] = useState("")
    const [bio, setBio] = useState("")

    return (
    <main>
        <div style={{ border: '2px solid black', padding: '20px', margin: '10px' }}>
            <h2> Signup </h2>
            <p> Username : </p>
            <input style={{ border: '2px solid black', padding: '3px', margin: '10px' }}
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <p> Bio : </p>
            <input style={{ border: '2px solid black', padding: '3px', margin: '10px' }}
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}

            />
            <br /><br />
            <button style={{ border: '2px solid black', padding: '3px', margin: '10px' }} onClick={() => alert("Congratulations " + userName + ", you are register")} > Register </button>

        </div>
    </main>
    )
}