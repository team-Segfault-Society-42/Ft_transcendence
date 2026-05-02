import { api } from "@/services/api";

export interface LoginResponse {
	message: string;
	twoFactorRequired?: boolean;
}

export interface TwoFactorLoginResponse {
	message: string;
}

export interface TwoFactorSetupResponse {
	otpauthUrl: string;
	qrCodeDataUrl: string;
}

export interface TwoFactorVerifyResponse {
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

export const userService = {
    getUser,
    updateUser,
    createUser,
    userLogin,
	completeTwoFactorLogin,
	enableTwoFactor,
	verifyTwoFactorSetup,
    getMe,
    userLogout,
    getUserHistory,
    getLeaderboard,
    getAchievements,
}
