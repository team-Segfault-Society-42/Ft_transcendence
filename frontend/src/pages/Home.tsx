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

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
			<section className="text-center">
				<h1 className="text-5xl font-bold text-white">
					ft_transcendence
				</h1>

				<p className="mt-4 text-2xl text-white">
					Hello Nassiiiiim from frontend
				</p>

				<div className="mt-6 flex justify-center gap-4">
					<button
						type="button"
						onClick={getResponse}
						className="rounded-xl bg-white px-5 py-3 font-semibold text-purple-700"
					>
						Call BE
					</button>

					<button
						type="button"
						onClick={redir}
						className="rounded-xl border border-white/40 bg-white/20 px-5 py-3 font-semibold text-white"
					>
						Redir BE
					</button>
				</div>

				<p className="mt-6 text-xl text-white">
					Response back: {data}
				</p>
			</section>
		</main>
	)
}