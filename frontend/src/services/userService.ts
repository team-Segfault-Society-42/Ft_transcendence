import { api } from "@/services/api";
import type { User } from "@/type/user.types";
import type { Match } from "@/lib/match";

export interface AuthenticatedUser extends Omit<User, "bio" | "avatar"> {
	email: string;
	bio: string;
	avatar: string;
	isTwoFactorEnabled: boolean;
	hasPassword: boolean;
}

export interface PublicUserProfile {
	id: number;
	username: string;
	bio: string;
	avatar: string;
	wins: number;
	losses: number;
	draws: number;
	xp: number;
	isTwoFactorEnabled: boolean;
}

export interface SessionResponse {
	authenticated: boolean;
	user: AuthenticatedUser | null;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	email: string;
	password: string;
	username: string;
	bio?: string;
}

export interface LoginResponse {
	message: string;
	twoFactorRequired?: boolean;
}

export interface TwoFactorLoginResponse {
	message: string;
}

export interface TwoFactorSetupResponse {
	qrCodeDataUrl: string;
}

export interface TwoFactorVerifyResponse {
	message: string;
}

export interface TwoFactorDisableResponse {
	message: string;
}

export interface UpdateUserPayload {
	username?: string;
	bio?: string;
}

export interface UpdatePasswordPayload {
	currentPassword?: string;
	newPassword: string;
}

export interface UpdatePasswordResponse {
	message: string;
}

export interface UpdateEmailPayload {
	currentPassword?: string;
	newEmail: string;
}

export interface UpdateEmailResponse {
	message: string;
}

export type LeaderboardSort = "xp" | "wins" | "totalGames";

export interface LeaderboardUser {
	id: number;
	username: string;
	avatar: string;
	wins: number;
	losses: number;
	draws: number;
	xp: number;
	totalGames: number;
	rank?: number;
}

export interface Achievement {
	key: string;
	displayName: string;
	description: string;
	iconName: string;
}

export interface UserAchievement {
	achievementId: string;
	key?: string;
	unlockedAt?: string;
	progress?: number | null;
}

/**
 * Logs out the current user.
 *
 * @returns Backend logout message response.
 */
export async function userLogout(): Promise<{ message: string }> {
	const response = await api.post<{ message: string }>("auth/logout");
	return response.data;
}

/**
 * Silently checks the current browser session.
 *
 * @returns Authentication state and user data when authenticated.
 */
export async function getSession(): Promise<SessionResponse> {
	const response = await api.get<SessionResponse>("auth/session");
	return response.data;
}

/**
 * Loads the authenticated user.
 *
 * @returns Current authenticated user, including private account settings needed by Settings.
 */
export async function getMe(): Promise<AuthenticatedUser> {
	const response = await api.get<AuthenticatedUser>("auth/me");
	return response.data;
}

/**
 * Logs in with email and password.
 *
 * @param data - Local login payload.
 * @returns Login result or 2FA-required result.
 */
export async function userLogin(data: LoginPayload): Promise<LoginResponse> {
	const response = await api.post<LoginResponse>("auth/login", data);
	return response.data;
}

/**
 * Completes 2FA login with a TOTP code.
 *
 * @param code - 6-digit TOTP code.
 * @returns Backend message response.
 */
export async function completeTwoFactorLogin(
	code: string,
): Promise<TwoFactorLoginResponse> {
	const response = await api.post<TwoFactorLoginResponse>("auth/2fa/login", {
		code,
	});

	return response.data;
}

/**
 * Starts 2FA setup for the authenticated user.
 *
 * @returns QR code data URL for authenticator setup.
 */
export async function enableTwoFactor(): Promise<TwoFactorSetupResponse> {
	const response = await api.post<TwoFactorSetupResponse>("auth/2fa/enable");
	return response.data;
}

/**
 * Verifies 2FA setup with a TOTP code.
 *
 * @param code - 6-digit TOTP code.
 * @returns Backend message response.
 */
export async function verifyTwoFactorSetup(
	code: string,
): Promise<TwoFactorVerifyResponse> {
	const response = await api.post<TwoFactorVerifyResponse>("auth/2fa/verify", {
		code,
	});

	return response.data;
}

/**
 * Disables 2FA after verifying a TOTP code.
 *
 * @param code - 6-digit TOTP code.
 * @returns Backend message response.
 */
export async function disableTwoFactor(
	code: string,
): Promise<TwoFactorDisableResponse> {
	const response = await api.post<TwoFactorDisableResponse>("auth/2fa/disable", {
		code,
	});

	return response.data;
}

/**
 * Updates the authenticated user's password.
 *
 * @param data - Current password when required and new password.
 * @returns Backend message response.
 */
export async function updatePassword(
	data: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> {
	const response = await api.patch<UpdatePasswordResponse>(
		"auth/me/password",
		data,
	);

	return response.data;
}

/**
 * Updates the authenticated user's email.
 *
 * @param data - Current password when required and new email.
 * @returns Backend message response.
 */
export async function updateEmail(
	data: UpdateEmailPayload,
): Promise<UpdateEmailResponse> {
	const response = await api.patch<UpdateEmailResponse>("auth/me/email", data);
	return response.data;
}

/**
 * Registers a local user.
 *
 * @param data - Registration payload.
 * @returns Created authenticated user.
 */
export async function createUser(data: RegisterPayload): Promise<AuthenticatedUser> {
	const response = await api.post<AuthenticatedUser>("auth/register", data);
	return response.data;
}

/**
 * Loads a public user by ID.
 *
 * @param id - User ID.
 * @returns Public user data.
 */
export async function getUser(id: number): Promise<PublicUserProfile> {
	const response = await api.get<PublicUserProfile>(`users/${id}`);
	return response.data;
}

/**
 * Updates the authenticated user's public profile.
 *
 * @param id - Authenticated user ID.
 * @param data - Editable public profile fields.
 * @returns Updated public user data.
 */
export async function updateUser(
	id: number,
	data: UpdateUserPayload,
): Promise<PublicUserProfile> {
	const response = await api.patch<PublicUserProfile>(`users/${id}`, data);
	return response.data;
}

/**
 * Loads finished game history for a user.
 *
 * @param id - User ID.
 * @returns User game history.
 */
export async function getUserHistory(id: number): Promise<Match[]> {
	const response = await api.get<Match[]>(`users/${id}/history`);
	return response.data;
}

/**
 * Loads the leaderboard.
 *
 * @param sortBy - Optional leaderboard sort key.
 * @returns Leaderboard data.
 */
export async function getLeaderboard(
	sortBy?: LeaderboardSort,
): Promise<LeaderboardUser[]> {
	const response = await api.get<LeaderboardUser[]>("users/leaderboard", {
		params: sortBy ? { sortBy } : {},
	});

	return response.data;
}

/**
 * Loads unlocked achievements for a user.
 *
 * @param id - User ID.
 * @returns User achievements.
 */
export async function getAchievements(id: number): Promise<UserAchievement[]> {
	const response = await api.get<UserAchievement[]>(`users/${id}/achievements`);
	return response.data;
}

/**
 * Loads all achievement definitions.
 *
 * @returns Achievement definitions.
 */
export async function getAllAchievements(): Promise<Achievement[]> {
	const response = await api.get<Achievement[]>("users/allAchievements");
	return response.data;
}

/**
 * Loads a public user by username.
 *
 * @param username - Exact username.
 * @returns Public user data.
 */
export async function getUserByUsername(
	username: string,
): Promise<PublicUserProfile> {
	const response = await api.get<PublicUserProfile>(
		`users/by-username/${username}`,
	);

	return response.data;
}

/**
 * Loads a user's XP rank.
 *
 * @param id - User ID.
 * @returns Rank and XP.
 */
export async function getUserRank(
	id: number,
): Promise<{ rank: number; xp: number }> {
	const response = await api.get<{ rank: number; xp: number }>(
		`users/${id}/rank`,
	);

	return response.data;
}

/**
 * Uploads a new avatar for the authenticated user.
 *
 * @param file - Avatar image file.
 * @returns Updated public user data.
 */
export async function uploadAvatar(file: File): Promise<PublicUserProfile> {
	const formData = new FormData();

	formData.append("avatar", file);

	const response = await api.post<PublicUserProfile>("users/me/avatar", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
}

export const userService = {
	getUser,
	updateUser,
	createUser,
	userLogin,
	completeTwoFactorLogin,
	enableTwoFactor,
	verifyTwoFactorSetup,
	disableTwoFactor,
	updatePassword,
	updateEmail,
	getSession,
	getMe,
	userLogout,
	getUserHistory,
	getLeaderboard,
	getAchievements,
	uploadAvatar,
	getAllAchievements,
	getUserByUsername,
	getUserRank,
};
