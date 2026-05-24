import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

/**
 * Public profile update payload for the authenticated user.
 *
 * @remarks This DTO must only contain public profile fields. Account/security fields
 * like email, password, 2FA state, or role must stay in dedicated auth/account flows.
 */
export class UpdateUserDto {
	@ApiPropertyOptional({
		example: 'nico42',
		description: 'Public username. Only letters, numbers, and underscores are allowed.',
		minLength: 3,
		maxLength: 20,
	})
	@IsOptional()
	@IsString({ message: 'ERR_USERNAME_STRING' })
	@MinLength(3, { message: 'ERR_USER_USERNAME_MIN_LENGTH' })
	@MaxLength(20, { message: 'ERR_USER_USERNAME_MAX_LENGTH' })
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message: 'ERR_USER_USERNAME_NO_SPACES',
	})
	username?: string;

	@ApiPropertyOptional({
		example: 'I like backend development and Tic-tac-toe.',
		description: 'Optional public biography.',
		maxLength: 180,
	})
	@IsOptional()
	@IsString({ message: 'ERR_USER_BIO_STRING' })
	@MaxLength(180, { message: 'ERR_USER_BIO_MAX_LENGTH' })
	bio?: string;
}
