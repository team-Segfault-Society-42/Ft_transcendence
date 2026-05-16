import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { Avatar } from "@/components/ui/Avatar";

interface User {
	id: number;
	username: string;
	wins: number;
	losses: number;
	draws: number;
	bio: string;
	avatar: string;
	xp: number;
	isTwoFactorEnabled: boolean;
}

export default function Settings() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [user, setUser] =
		useOutletContext<
			[User | null, React.Dispatch<React.SetStateAction<User | null>>]
		>();

	const [username, setUsername] = useState(user?.username || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isAvatarUploading, setIsAvatarUploading] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement | null>(null);
	const [twoFactorCode, setTwoFactorCode] = useState("");
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
	const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

	useEffect(() => {
		if (!user) return;

		setUsername(user.username);
		setBio(user.bio);
	}, [user]);

	if (!user) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t("settings.title")}
					icon={<span className="text-xl font-bold">?</span>}
					message={t("settings.notConnected")}
					description={t("settings.login")}
					actions={
						<Button onClick={() => navigate("/")}>
							{t("buttons.backHome")}
						</Button>
					}
				/>
			</section>
		);
	}

	async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
		if (!user) return;

		const file = event.target.files?.[0];

		if (!file) return;

		try {
			setIsAvatarUploading(true);

			const updatedUser = await userService.uploadAvatar(file);
			setUser(updatedUser);

			toast.success(t("profile.avatarUpdated"));
		} catch (error: any) {
			const serverMessage =
				error.response?.data?.message || error.message;

			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsAvatarUploading(false);
			event.target.value = "";
		}
	}

	async function handleEnableTwoFactor() {
		if (!user) return;

		try {
			setIsTwoFactorLoading(true);

			const result = await userService.enableTwoFactor();

			setQrCodeDataUrl(result.qrCodeDataUrl);

			toast.success(t("auth.twofa.setupStarted"));
		} catch (error: any) {
			const serverMessage =
				error.response?.data?.message || error.message;

			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsTwoFactorLoading(false);
		}
	}

	async function handleVerifyTwoFactor() {
		if (!user) return;

		try {
			setIsTwoFactorLoading(true);

			const result =
				await userService.verifyTwoFactorSetup(twoFactorCode);

			toast.success(result.message);

			const refreshedUser = await userService.getMe();

			setUser(refreshedUser);

			setTwoFactorCode("");
			setQrCodeDataUrl("");
		} catch (error: any) {
			const serverMessage =
				error.response?.data?.message || error.message;

			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsTwoFactorLoading(false);
		}
	}

	async function handleSaveProfile() {
		if (!user) return;

		try {
			setIsSaving(true);

			const updatedUser = await userService.updateUser(user.id, {
				username,
				bio,
			});

			setUser(updatedUser);

			toast.success(t("settings.profile.updated"));
		} catch (error: any) {
			const serverMessage =
				error.response?.data?.message || error.message;

			const finalMessage = Array.isArray(serverMessage)
				? serverMessage[0]
				: serverMessage;

			toast.error(t("auth.error") + finalMessage);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<section className="w-full max-w-4xl mx-auto px-6 py-10 text-white">
			<div className="mb-8">
				<h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
					{t("settings.title")}
				</h1>
				<p className="text-white/50 mt-2">
					{t("settings.description")}
				</p>
			</div>

			<div className="grid gap-8">
				<Card className="space-y-6">
					<div>
						<CardTitle>{t("settings.profile.title")}</CardTitle>

						<CardDescription className="text-white/50 mt-2">
							{t("settings.profile.description")}
						</CardDescription>
					</div>

					<div className="space-y-4">
						<div className="flex flex-col items-center gap-4">
							<Avatar
								src={user.avatar}
								alt={user.username}
								size="lg"
								className="border border-white/20"
							/>

							<input
								ref={avatarInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp"
								onChange={handleAvatarUpload}
								disabled={isAvatarUploading}
								className="hidden"
							/>

							<Button
								type="button"
								variant="secondary"
								onClick={() => avatarInputRef.current?.click()}
								disabled={isAvatarUploading}
							>
								{isAvatarUploading
									? t("profile.uploading")
									: t("profile.changeAvatar")}
							</Button>
						</div>
						<div>
							<p className="text-sm text-white/50 mb-2">
								{t("profile.username")}
							</p>

							<Input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>

						<div>
							<p className="text-sm text-white/50 mb-2">
								{t("profile.bio")}
							</p>

							<textarea
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className="w-full min-h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 resize-none text-sm text-white/80 focus:outline-none focus:border-cyan-400"
							/>
						</div>

						<Button
							onClick={handleSaveProfile}
							disabled={isSaving}
							className="w-full"
						>
							{isSaving
								? t("settings.profile.saving")
								: t("settings.profile.save")}
						</Button>
					</div>
				</Card>

				<Card className="space-y-6">
					<div>
						<CardTitle>
							{t("settings.security.title")}
						</CardTitle>

						<CardDescription className="text-white/50 mt-2">
							{t("settings.security.description")}
						</CardDescription>
					</div>

					<div>
						<p className="text-white/50 text-sm mb-2">
							{t("auth.twofa.title")}
						</p>

						{user.isTwoFactorEnabled ? (
							<div className="bg-white/5 rounded-lg py-4 px-4 border border-white/10">
								<p className="text-sm text-green-400 font-medium">
									{t("auth.twofa.enabled")}
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<Button
									type="button"
									onClick={handleEnableTwoFactor}
									disabled={isTwoFactorLoading}
									className="w-full"
								>
									{isTwoFactorLoading
										? t("auth.twofa.loading")
										: t("auth.twofa.enable")}
								</Button>

								{qrCodeDataUrl && (
									<div className="bg-white/5 rounded-lg py-4 px-4 border border-white/10 space-y-4">
										<img
											src={qrCodeDataUrl}
											alt="2FA QR code"
											className="mx-auto rounded-lg bg-white p-2"
										/>

										<Input
											value={twoFactorCode}
											onChange={(e) =>
												setTwoFactorCode(e.target.value)
											}
											placeholder={t("auth.twofa.enterCode")}
											maxLength={6}
										/>

										<Button
											type="button"
											onClick={handleVerifyTwoFactor}
											disabled={
												isTwoFactorLoading ||
												twoFactorCode.length !== 6
											}
											className="w-full"
										>
											{isTwoFactorLoading
												? t("auth.twofa.verifying")
												: t("auth.twofa.verify")}
										</Button>

										<Button
											type="button"
											variant="secondary"
											onClick={handleEnableTwoFactor}
											disabled={isTwoFactorLoading}
											className="w-full"
										>
											{t("auth.twofa.regenerate")}
										</Button>
									</div>
								)}
							</div>
						)}
					</div>
				</Card>


			</div>
		</section>
	);
}
