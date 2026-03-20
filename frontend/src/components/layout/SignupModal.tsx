import { useState } from 'react'

type Props = {
	isOpen: boolean
	onClose: () => void
}

export default function SignupModal({ isOpen, onClose }: Props) {

	const [userName, setUserName] = useState("")
	const [bio, setBio] = useState("")

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
			onClick={onClose}>
          

			<div
				className="bg-linear-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-8 w-87.5 shadow-2xl"
				onClick={(e) => e.stopPropagation()}>

				<h2 className="text-2xl font-bold mb-6 text-white text-center">
					Create Account
				</h2>

				<input
					className="w-full mb-4 p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
					placeholder="Username"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
                />

				<input
					className="w-full mb-6 p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
					placeholder="Bio"
					value={bio}
					onChange={(e) => setBio(e.target.value)}
				/>

				<div className="flex justify-between gap-4">

					<button
						className="w-full py-3 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition"
						onClick={onClose}
					>
						Cancel
					</button>

					<button
						className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-500 to-purple-500 font-bold text-white hover:scale-105 transition"
						onClick={() => {
							alert("Welcome " + userName)
							onClose()
						}}
					>
						Register
					</button>

				</div>

			</div>
		</div>
	)
}