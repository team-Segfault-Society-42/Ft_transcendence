import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	Matches,
	MinLength,
} from 'class-validator';

/**
 * Password update payload for the authenticated user's account.
 *
 * @remarks currentPassword is required by the service only when the account
 * already has a local password. OAuth-only accounts may set their first password
 * without a current password.
 */
export class UpdatePasswordDto {
	@ApiPropertyOptional({
		description: 'Current password. Required if the account already has a password.',
		example: 'OldPassword123',
	})
	@IsOptional()
	@IsString({ message: 'ERR_AUTH_CURRENT_PWD_STRING' })
	currentPassword?: string;

	@ApiProperty({
		description: 'New password with at least 8 characters, 1 lowercase letter, 1 uppercase letter, and 1 number.',
		example: 'NewPassword123',
	})
	@IsString({ message: 'ERR_AUTH_PWD_STRING' })
	@MinLength(8, { message: 'ERR_AUTH_PWD_MIN_LENGTH' })
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
		message: 'ERR_AUTH_PWD_COMPLEXITY',
	})
	newPassword: string;
}
