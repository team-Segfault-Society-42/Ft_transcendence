import axios, { type AxiosError, type AxiosResponse } from "axios";
import i18n from "@/i18n/config";

interface ErrorResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export const api = axios.create({
  baseURL: "/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    if (data && typeof data.message === "string") {
      const translationKey = `backend.${data.message}`;
      const translated = i18n.t(translationKey);

      if (translated !== translationKey) {
        response.data.message = translated;
      }
    }

    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    const data = error.response?.data;

    if (data && data.message) {
      const rawKey = Array.isArray(data.message)
        ? data.message[0]
        : data.message;

      if (typeof rawKey === "string") {
        const translatedMessage = i18n.t(`backend.${rawKey}`);

        if (error.response?.data) {
          error.response.data.message = translatedMessage;
        }

        error.message = translatedMessage;
      }
    }
    return Promise.reject(error);
  },
);