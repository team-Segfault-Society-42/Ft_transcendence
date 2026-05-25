import { AxiosError } from "axios";

type BackendErrorResponse = {
	message?: string | string[];
};

/**
 * Extracts a stable backend error message key from an unknown error.
 *
 * @param error - Unknown error caught from an API call.
 * @returns Backend translation key or a safe fallback key.
 */
export function getBackendErrorMessage(error: unknown): string {
	if (error instanceof AxiosError) {
		const data = error.response?.data as BackendErrorResponse | undefined;
		const serverMessage = data?.message;

		if (Array.isArray(serverMessage)) {
			return serverMessage[0] ?? "ERR_UNKNOWN";
		}

		if (typeof serverMessage === "string") {
			return serverMessage;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "ERR_UNKNOWN";
}
