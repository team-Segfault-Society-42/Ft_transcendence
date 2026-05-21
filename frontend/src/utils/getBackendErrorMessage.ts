import { AxiosError } from "axios";

export function getBackendErrorMessage(error: unknown): string {
	if (error instanceof AxiosError) {
		const serverMessage = error.response?.data?.message;

		if (Array.isArray(serverMessage)) {
			return serverMessage[0];
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
