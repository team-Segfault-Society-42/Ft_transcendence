import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
		@ApiProperty({
				example: 'nico@example.com',
				description: 'User email address',
		})
		@IsEmail({}, { message: 'ERR_AUTH_EMAIL_INVALID' })
		email: string;

		@ApiProperty({
			example: 'Secret123',
			description: 'User password',
			minLength: 8,
		})
		@IsString()
		@MinLength(8, { message: 'ERR_AUTH_PWD_MIN_LENGTH' })
		@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
			message: 'ERR_AUTH_PWD_COMPLEXITY',
		})
		password: string;

		@ApiProperty({
				example: 'nico42',
				description: 'Unique username',
		})
		@IsString()
		@MinLength(3, { message: 'ERR_USER_USERNAME_MIN_LENGTH' })
		@MaxLength(20, { message: 'ERR_USER_USERNAME_MAX_LENGTH' })
		@Matches(/^[a-zA-Z0-9_]+$/, {
			message: 'ERR_USER_USERNAME_NO_SPACES'
		})
		username: string;

		@ApiPropertyOptional({
				example: 'I like to play Tic-tac-toe and backend development.',
				description: 'Optional user biography',
		})
		@IsOptional()
		@IsString()
		@MaxLength(180, { message: 'ERR_USER_BIO_MAX_LENGTH' })
		bio?: string;
}
