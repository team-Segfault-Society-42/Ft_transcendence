import { Injectable } from '@nestjs/common';

export interface HelloResponse {
	message: string;
}

@Injectable()
export class AppService {
	/**
	 * @description Returns a simple backend health/demo message.
	 * @returns Static hello response used to verify frontend-backend communication.
	 */
	getHello(): HelloResponse {
		return {
			message: 'Hello from backend Nico!',
		};
	}
}
