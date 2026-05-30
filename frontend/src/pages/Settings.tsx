import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { Input } from "@/components/ui/Input";

import { userService } from "@/services/userService";
import { getBackendErrorMessage } from "../utils/getBackendErrorMessage";

interface User {
	id: number;
	username: string;
	email: string;
	wins: number;
	losses: number;
	draws: number;
	bio: string;
	avatar: string;
	xp: number;
	isTwoFactorEnabled: boolean;
	hasPassword: boolean;
}

export default function Settings() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [user, setUser] =
		useOutletContext<
			[User | null, React.Dispatch<React.SetStateAction<User | null>>]
		>();

	/* -------------------------------------------------------------------------- */
	/* Profile state                                                              */
	/* -------------------------------------------------------------------------- */

	const [username, setUsername] = useState(user?.username || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [isSaving, setIsSaving] = useState(false);

	/* -------------------------------------------------------------------------- */
	/* Avatar state                                                               */
	/* -------------------------------------------------------------------------- */

	const [isAvatarUploading, setIsAvatarUploading] = useState(false);

	const avatarInputRef = useRef<HTMLInputElement | null>(null);

	/* -------------------------------------------------------------------------- */
	/* 2FA state                                                                  */
	/* -------------------------------------------------------------------------- */

	const [twoFactorCode, setTwoFactorCode] = useState("");
	const [disableTwoFactorCode, setDisableTwoFactorCode] = useState("");
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
	const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

	/* -------------------------------------------------------------------------- */
	/* Password state                                                             */
	/* -------------------------------------------------------------------------- */

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [isPasswordSaving, setIsPasswordSaving] = useState(false);

	/* -------------------------------------------------------------------------- */
	/* Email state                                                                */
	/* -------------------------------------------------------------------------- */

	const [newEmail, setNewEmail] = useState(user?.email ?? "");

	const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

	const [isEmailSaving, setIsEmailSaving] = useState(false);

	/**
	 * Synchronizes local editable form state with the authenticated user.
	 */
	useEffect(() => {
		if (!user) return;

		setUsername(user.username);
		setBio(user.bio);
		setNewEmail(user.email);
	}, [user]);

	/**
	 * Refreshes the authenticated user from the backend.
	 *
	 * @returns Updated authenticated user.
	 * @remarks Keeps frontend account state synchronized after mutations.
	 */
	async function refreshAuthenticatedUser(): Promise<void> {
		const refreshedUser = await userService.getMe();

		setUser(refreshedUser);
	}

	/**
	 * Displays a translated backend error toast from an unknown error.
	 *
	 * @param error - Unknown async error.
	 */
	function showBackendError(error: unknown): void {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t(`backend.${finalMessage}`, {
				defaultValue: finalMessage,
			}),
		);
	}

	/* -------------------------------------------------------------------------- */
	/* Avatar handlers                                                            */
	/* -------------------------------------------------------------------------- */

	async function handleAvatarUpload(
		event: React.ChangeEvent<HTMLInputElement>,
	) {
		if (!user) return;

		const file = event.target.files?.[0];

		if (!file) return;

		try {
			setIsAvatarUploading(true);

			await userService.uploadAvatar(file);

			await refreshAuthenticatedUser();

			toast.success(t("profile.avatarUpdated"));
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsAvatarUploading(false);

			event.target.value = "";
		}
	}

	/* -------------------------------------------------------------------------- */
	/* 2FA handlers                                                               */
	/* -------------------------------------------------------------------------- */

	async function handleEnableTwoFactor() {
		if (!user) return;

		try {
			setIsTwoFactorLoading(true);

			const result = await userService.enableTwoFactor();

			setQrCodeDataUrl(result.qrCodeDataUrl);

			toast.success(t("auth.twofa.setupStarted"));
		} catch (error: unknown) {
			showBackendError(error);
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

			toast.success(
				t(`backend.${result.message}`, {
					defaultValue: result.message,
				}),
			);

			await refreshAuthenticatedUser();

			setTwoFactorCode("");
			setQrCodeDataUrl("");
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsTwoFactorLoading(false);
		}
	}

	async function handleDisableTwoFactor() {
		if (!user) return;

		try {
			setIsTwoFactorLoading(true);

			const result = await userService.disableTwoFactor(
				disableTwoFactorCode,
			);

			toast.success(
				t(`backend.${result.message}`, {
					defaultValue: result.message,
				}),
			);

			await refreshAuthenticatedUser();

			setDisableTwoFactorCode("");
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsTwoFactorLoading(false);
		}
	}

	/* -------------------------------------------------------------------------- */
	/* Password handlers                                                          */
	/* -------------------------------------------------------------------------- */

	async function handleUpdatePassword() {
		if (!user) return;

		try {
			setIsPasswordSaving(true);

			const result = await userService.updatePassword({
				currentPassword: user.hasPassword
					? currentPassword
					: undefined,
				newPassword,
			});

			toast.success(
				t(`backend.${result.message}`, {
					defaultValue: result.message,
				}),
			);

			await refreshAuthenticatedUser();

			setCurrentPassword("");
			setNewPassword("");
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsPasswordSaving(false);
		}
	}

	/* -------------------------------------------------------------------------- */
	/* Email handlers                                                             */
	/* -------------------------------------------------------------------------- */

	async function handleUpdateEmail() {
		if (!user) return;

		try {
			setIsEmailSaving(true);

			const result = await userService.updateEmail({
				currentPassword: user.hasPassword
					? emailCurrentPassword
					: undefined,
				newEmail,
			});

			toast.success(
				t(`backend.${result.message}`, {
					defaultValue: result.message,
				}),
			);

			await refreshAuthenticatedUser();

			setEmailCurrentPassword("");
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsEmailSaving(false);
		}
	}

	/* -------------------------------------------------------------------------- */
	/* Profile handlers                                                           */
	/* -------------------------------------------------------------------------- */

	async function handleSaveProfile() {
		if (!user) return;

		try {
			setIsSaving(true);

			await userService.updateUser(user.id, {
				username,
				bio,
			});

			await refreshAuthenticatedUser();

			toast.success(t("settings.profile.updated"));
		} catch (error: unknown) {
			showBackendError(error);
		} finally {
			setIsSaving(false);
		}
	}

	/* -------------------------------------------------------------------------- */
	/* Empty state                                                                */
	/* -------------------------------------------------------------------------- */

	if (!user) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t("settings.title")}
					icon={<SettingsIcon size={24} />}
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

	return (
		<section className="w-full max-w-6xl mx-auto px-6 py-10 text-white">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
					{t("settings.title")}
				</h1>

				<p className="text-white/50 mt-2">
					{t("settings.description")}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				{/* Profile settings */}
				<Card className="h-full relative bg-slate-900 space-y-6 p-6">
					<CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
						{t("settings.profile.title")}
					</CardTitle>

					<CardDescription className="text-white/50">
						{t("settings.profile.description")}
					</CardDescription>

					<div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
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
								onClick={() =>
									avatarInputRef.current?.click()
								}
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
								onChange={(e) =>
									setUsername(e.target.value)
								}
								autoComplete="username"
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

				{/* Two-factor authentication */}
				<Card className="h-full relative bg-slate-900 space-y-6 p-6">
					<CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
						{t("settings.security.title")}
					</CardTitle>

					<CardDescription className="text-white/50">
						{t("settings.security.description")}
					</CardDescription>

					<div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
						<div>
							<p className="text-sm font-semibold text-white">
								{t("auth.twofa.title")}
							</p>

							<p className="text-xs text-white/40 mt-1">
								{t("auth.twofa.description")}
							</p>
						</div>

						{user.isTwoFactorEnabled ? (
							<>
								<p className="text-sm text-green-400 font-medium">
									{t("auth.twofa.enabled")}
								</p>

								<Input
									value={disableTwoFactorCode}
									onChange={(e) =>
										setDisableTwoFactorCode(
											e.target.value,
										)
									}
									placeholder={t(
										"auth.twofa.enterCode",
									)}
									maxLength={6}
									autoComplete="one-time-code"
								/>

								<Button
									type="button"
									variant="danger"
									onClick={handleDisableTwoFactor}
									disabled={
										isTwoFactorLoading ||
										disableTwoFactorCode.length !==
											6
									}
									className="w-full"
								>
									{isTwoFactorLoading
										? t("auth.twofa.verifying")
										: t(
												"settings.security.disableTitle",
											)}
								</Button>
							</>
						) : (
							<>
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
									<div className="bg-white/5 border border-cyan-500/20 rounded-xl p-6 space-y-4">
										<div className="flex justify-center">
											<img
												src={qrCodeDataUrl}
												alt="2FA QR code"
												className="rounded-lg bg-white p-2"
											/>
										</div>

										<Input
											value={twoFactorCode}
											onChange={(e) =>
												setTwoFactorCode(
													e.target.value,
												)
											}
											placeholder={t(
												"auth.twofa.enterCode",
											)}
											maxLength={6}
											autoComplete="one-time-code"
										/>

										<Button
											type="button"
											onClick={
												handleVerifyTwoFactor
											}
											disabled={
												isTwoFactorLoading ||
												twoFactorCode.length !==
													6
											}
											className="w-full"
										>
											{isTwoFactorLoading
												? t(
														"auth.twofa.verifying",
													)
												: t(
														"auth.twofa.verify",
													)}
										</Button>

										<Button
											type="button"
											variant="secondary"
											onClick={
												handleEnableTwoFactor
											}
											disabled={
												isTwoFactorLoading
											}
											className="w-full"
										>
											{t(
												"auth.twofa.regenerate",
											)}
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				</Card>

				{/* Email settings */}
				<Card className="h-full relative bg-slate-900 space-y-6 p-6">
					<CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
						{t("settings.security.emailTitle")}
					</CardTitle>

					<CardDescription className="text-white/50">
						{t("settings.security.emailDescription")}
					</CardDescription>

					<div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
						<Input
							type="email"
							value={newEmail}
							onChange={(e) =>
								setNewEmail(e.target.value)
							}
							placeholder={t(
								"settings.security.email",
							)}
							autoComplete="off"
							name="settings-email"
						/>

						{user.hasPassword && (
							<Input
								type="password"
								value={emailCurrentPassword}
								onChange={(e) =>
									setEmailCurrentPassword(
										e.target.value,
									)
								}
								placeholder={t(
									"settings.security.currentPassword",
								)}
								autoComplete="new-password"
								name="settings-email-current-password"
							/>
						)}

						<Button
							type="button"
							onClick={handleUpdateEmail}
							disabled={
								isEmailSaving ||
								newEmail.trim().length === 0 ||
								(user.hasPassword &&
									emailCurrentPassword.length ===
										0)
							}
							className="w-full"
						>
							{isEmailSaving
								? t("settings.profile.saving")
								: t(
										"settings.security.updateEmail",
									)}
						</Button>
					</div>
				</Card>

				{/* Password settings */}
				<Card className="h-full relative bg-slate-900 space-y-6 p-6">
					<CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
						{user.hasPassword
							? t(
									"settings.security.passwordTitle",
								)
							: t(
									"settings.security.setPasswordTitle",
								)}
					</CardTitle>

					<CardDescription className="text-white/50">
						{user.hasPassword
							? t(
									"settings.security.passwordDescription",
								)
							: t(
									"settings.security.setPasswordDescription",
								)}
					</CardDescription>

					<div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
						{user.hasPassword && (
							<Input
								type="password"
								value={currentPassword}
								onChange={(e) =>
									setCurrentPassword(
										e.target.value,
									)
								}
								placeholder={t(
									"settings.security.currentPassword",
								)}
								autoComplete="current-password"
								name="settings-current-password"
							/>
						)}

						<Input
							type="password"
							value={newPassword}
							onChange={(e) =>
								setNewPassword(e.target.value)
							}
							placeholder={t(
								"settings.security.newPassword",
							)}
							autoComplete="new-password"
							name="settings-new-password"
						/>

						<Button
							type="button"
							onClick={handleUpdatePassword}
							disabled={
								isPasswordSaving ||
								newPassword.length < 8 ||
								(user.hasPassword &&
									currentPassword.length === 0)
							}
							className="w-full"
						>
							{isPasswordSaving
								? t("settings.profile.saving")
								: user.hasPassword
									? t(
											"settings.security.updatePassword",
										)
									: t(
											"settings.security.setPassword",
										)}
						</Button>
					</div>
				</Card>
			</div>
		</section>
	);
}
