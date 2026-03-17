import { useState } from 'react'

const MOCK_USER: infoUsers = {
    username: "John",
    wins: 42,
    losses: 21,
    draws: 4,
    bio: "The Best !",
    avatar: "placeholder.png",
}

interface infoUsers {
    username: string,
    wins: number,
    losses: number,
    draws: number,
    bio: string,
    avatar: string
    totalGames : number
}

export default function Profile() {


    const [data, setData] = useState<infoUsers>(MOCK_USER)
    const totalGames = data.wins + data.losses + data.draws
 
  

    return (
    <main>
        <div align="center" > Profile </div>
        <h1> Username : {data.username} </h1>
        <h1> Wins :  {data.wins} </h1>
        <h1> Losses : {data.losses} </h1>
        <h1> Draws : {data.draws} </h1>
        <h1> Bio : {data.bio} </h1>
        <h1> Winrate : {((data.wins / totalGames) * 100).toFixed(2)} % </h1>
        <h1> Total Games : {totalGames} </h1>
        <img src={data.avatar} alt="Avatar" />
        <button type="button">Modifier</button>
    </main>
    )
}