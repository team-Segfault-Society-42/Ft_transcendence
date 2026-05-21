import { api } from "@/services/api";

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
    getMe,
    userLogout,
    getUserHistory,
    getLeaderboard,
    getAchievements,
	uploadAvatar,
  getAllAchievements,
  getUserByUsername,
  getUserRank,
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

export async function userLogout() {
  const response = await api.post("auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get("auth/me");
  return response.data;
}

export async function userLogin(data: unknown): Promise<LoginResponse> {
  const response = await api.post("auth/login", data);
  return response.data;
}

export async function completeTwoFactorLogin(
	code: string,
): Promise<TwoFactorLoginResponse> {
	const response = await api.post("auth/2fa/login", { code });
	return response.data;
}

export async function enableTwoFactor(): Promise<TwoFactorSetupResponse> {
	const response = await api.post("auth/2fa/enable");
	return response.data;
}

export async function verifyTwoFactorSetup(
	code: string,
): Promise<TwoFactorVerifyResponse> {
	const response = await api.post("auth/2fa/verify", { code });
	return response.data;
}

export async function disableTwoFactor(
	code: string,
): Promise<TwoFactorDisableResponse> {
	const response = await api.post("auth/2fa/disable", { code });
	return response.data;
}

export async function updatePassword(
	data: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> {
	const response = await api.patch("auth/me/password", data);
	return response.data;
}

export async function updateEmail(
	data: UpdateEmailPayload,
): Promise<UpdateEmailResponse> {
	const response = await api.patch("auth/me/email", data);
	return response.data;
}

export async function createUser(data: unknown) {
  const response = await api.post("auth/register", data);
  return response.data;
}

export async function getUser(id: unknown) {
  const response = await api.get("users/" + id);
  return response.data;
}

export async function updateUser(id: unknown, data: unknown) {
  const response = await api.patch("users/" + id, data);
  return response.data;
}

export async function getUserHistory(id: number) {
    const response = await api.get('users/' + id + '/history')
    return response.data
}

export async function getLeaderboard(sortBy?: "xp" | "wins" |  "totalGames") {

    const response = await api.get("users/leaderboard", { params: sortBy ? { sortBy } : {} })
    return response.data
}

export async function getAchievements(id: number) {
  const response = await api.get('users/' + id + '/achievements')
  return response.data
}

export async function getAllAchievements() {
  const response = await api.get('users/allAchievements')
  return response.data
}

export async function getUserByUsername(username: string) {
  const response = await api.get('users/by-username/' + username)
  return response.data
}

export async function getUserRank(id: number) {
  const response = await api.get('users/' + id + '/rank')
  return response.data
}



export async function uploadAvatar(file: File) {
	const formData = new FormData();
	formData.append("avatar", file);

	const response = await api.post("users/me/avatar", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
}
