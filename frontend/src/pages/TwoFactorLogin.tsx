import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { userService } from "@/services/userService";

export default function TwoFactorLogin() {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		try {
			setIsLoading(true);

			await userService.completeTwoFactorLogin(code);
			toast.success("Two-factor login successful");

			navigate("/");
			window.location.reload();
		} catch (error: any) {
			const serverMessage = error.response?.data?.message || error.message;
			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error("Authentication error: " + finalMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<section className="w-full flex justify-center">
			<div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
				<div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

				<div className="relative flex flex-col gap-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
							Two-Factor Authentication
						</h1>

						<p className="text-white/70 mt-3">
							Enter the 6-digit code from your authenticator app to finish login.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							value={code}
							onChange={(e) => setCode(e.target.value)}
							placeholder="123456"
							maxLength={6}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || code.length !== 6}
						>
							{isLoading ? "Verifying..." : "Verify code"}
						</Button>
					</form>

					<Button
						type="button"
						variant="secondary"
						className="w-full"
						onClick={() => navigate("/")}
					>
						Back to home
					</Button>
				</div>
			</div>
		</section>
	);
}
