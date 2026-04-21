import { api } from "@/services/api";

export async function userLogout() {
  const response = await api.post("auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get("auth/me");
  return response.data;
}

export async function userLogin(data: unknown) {
  const response = await api.post("auth/login", data);
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
  const response = await api.get("users/" + id + "/history");
  return response.data;
}

export const userService = {
  getUser,
  updateUser,
  createUser,
  userLogin,
  getMe,
  userLogout,
  getUserHistory,
};
