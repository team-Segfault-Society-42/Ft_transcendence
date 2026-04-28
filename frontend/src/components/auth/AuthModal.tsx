import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AuthForm } from "./AuthForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { userService } from "@/services/userService";
import { OAuth42Button } from "./OAuth42Button";
import { Divider } from "@/components/ui/Divider";

type AuthMode = "login" | "signup";

interface AuthModalProps {
	mode: AuthMode;
	isOpen: boolean;
	onClose: () => void;
	onSwitchMode: () => void;
	onSuccess?: () => void;
}

export function AuthModal({
	mode,
	isOpen,
	onClose,
	onSwitchMode,
	onSuccess,
}: AuthModalProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState<"auth" | "twofa">("auth");
	const [code, setCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	if (!isOpen) return null;

	function handleClose() {
		setStep("auth");
		setCode("");
		onClose();
	}

	async function handleTwoFactorSubmit(e: React.FormEvent) {
		e.preventDefault();

		try {
			setIsVerifying(true);
			await userService.completeTwoFactorLogin(code);
			toast.success("Two-factor login successful");
			setCode("");
			setStep("auth");
			onSuccess?.();
		} catch (error: any) {
			const serverMessage = error.response?.data?.message || error.message;
			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;
			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsVerifying(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur"
				onClick={handleClose}
			/>

			<div className="relative z-10 w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-white/10">
				{step === "auth" ? (
					<>
						<h2 className="text-2xl mb-2 bg-linear-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
							{mode === "signup"
								? t("auth.description")
								: t("auth.description_login")}
						</h2>

						<AuthForm
							mode={mode}
							onSuccess={() => {
								handleClose();
								onSuccess?.();
							}}
							onTwoFactorRequired={() => {
								setStep("twofa");
							}}
						/>

						<Divider/>

						<OAuth42Button/>

						<Button
							type="button"
							variant="secondary"
							className="w-full mt-4"
							onClick={onSwitchMode}
						>
							{mode === "signup"
								? t("auth.buttons.already_account")
								: t("auth.buttons.no_account")}
						</Button>
					</>
				) : (
					<>
						<h2 className="text-2xl mb-2 bg-linear-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
							Two-factor authentication
						</h2>

						<p className="text-white/70 mb-4">
							Enter the 6-digit code from your authenticator app.
						</p>

						<form onSubmit={handleTwoFactorSubmit} className="space-y-4">
							<Input
								value={code}
								onChange={(e) => setCode(e.target.value)}
								placeholder="123456"
								maxLength={6}
							/>

							<Button className="w-full" disabled={isVerifying}>
								{isVerifying ? "Verifying..." : "Verify code"}
							</Button>
						</form>

						<Button
							type="button"
							variant="secondary"
							className="w-full mt-4"
							onClick={() => {
								setStep("auth");
								setCode("");
							}}
						>
							Back to login
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
