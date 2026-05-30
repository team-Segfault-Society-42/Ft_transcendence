import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Email update payload for the authenticated user's account.
 *
 * @remarks currentPassword is required by the service only when the account
 * already has a local password.
 */
export class UpdateEmailDto {
	@ApiProperty({
		description: 'New email address for the authenticated account.',
		example: 'new.email@example.com',
	})
	@IsEmail({}, { message: 'ERR_AUTH_EMAIL_INVALID' })
	newEmail: string;

	@ApiPropertyOptional({
		description: 'Current password. Required if the account already has a password.',
		example: 'CurrentPassword123',
	})
	@IsOptional()
	@IsString({ message: 'ERR_AUTH_CURRENT_PWD_STRING' })
	currentPassword?: string;
}
