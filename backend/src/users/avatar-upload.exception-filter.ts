import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ExceptionFilter,
	PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError, PayloadTooLargeException)
export class AvatarUploadExceptionFilter implements ExceptionFilter {
	catch(error: MulterError | PayloadTooLargeException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		if (
			error instanceof PayloadTooLargeException ||
			(error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE')
		) {
			return response.status(413).json({
				message: 'Avatar must be smaller than 200 KB',
				error: 'Payload Too Large',
				statusCode: 413,
			});
		}

		const exception = new BadRequestException('Invalid avatar upload');

		return response.status(exception.getStatus()).json(exception.getResponse());
	}
}
