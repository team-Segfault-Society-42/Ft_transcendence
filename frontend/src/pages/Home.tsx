import { useState } from 'react'

export default function Home() {
	const [data, setData] = useState("");
	const url = "/api/hello";

	async function getResponse() {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Nothing to see !")
			}
			const res = await response.text();
			setData(res);
			console.log("Succes:", res);
		} 
		catch (error: any) {
			setData("Error : " + error.message)
		}
	}

	function redir() {
		window.location.href = url;
	}

	return <main>
		<h1>ft_transcendence</h1>
		<p>Hello Nassiiiiim from frontend</p>
		<button type="button" onClick={getResponse}> Call BE </button>
		<button type="button" onClick={redir} > Redir BE </button>
		<p> Response back : {data} </p>
	</main>
}