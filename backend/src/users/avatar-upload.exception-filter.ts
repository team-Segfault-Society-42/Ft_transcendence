import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ExceptionFilter,
	PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError, PayloadTooLargeException)
export class AvatarUploadExceptionFilter
	implements ExceptionFilter
{
	/**
	 * @description Converts Multer upload errors into frontend-safe API responses.
	 * @param error - Upload-related exception thrown during multipart handling.
	 * @param host - NestJS arguments host.
	 * @returns HTTP JSON error response.
	 * @remarks Avoids leaking internal Multer implementation details to the client.
	 */
	catch(
		error: MulterError | PayloadTooLargeException,
		host: ArgumentsHost,
	) {
		const ctx = host.switchToHttp();

		const response = ctx.getResponse<Response>();

		if (
			error instanceof PayloadTooLargeException ||
			(error instanceof MulterError &&
				error.code === 'LIMIT_FILE_SIZE')
		) {
			return response.status(413).json({
				message: 'ERR_USER_AVATAR_TOO_LARGE',
				error: 'Payload Too Large',
				statusCode: 413,
			});
		}

		const exception =
			new BadRequestException(
				'ERR_USER_AVATAR_INVALID',
			);

		return response
			.status(exception.getStatus())
			.json(exception.getResponse());
	}
}
