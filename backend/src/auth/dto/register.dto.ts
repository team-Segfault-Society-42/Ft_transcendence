import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
		@ApiProperty({
				example: 'nico@example.com',
				description: 'User email address',
		})
		@IsEmail()
		email: string;

		@ApiProperty({
			example: 'Secret123',
			description: 'User password',
			minLength: 8,
		})
		@IsString()
		@MinLength(8)
		@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
			message: 'password must contain at least one lowercase letter, one uppercase letter, and one number',
		})
		password: string;

		@ApiProperty({
				example: 'nico42',
				description: 'Unique username',
		})
		@IsString()
		@MinLength(3)
		username: string;

		@ApiPropertyOptional({
				example: 'I like to play Tic-tac-toe and backend development.',
				description: 'Optional user biography',
		})
		@IsOptional()
		@IsString()
		bio?: string;

		@ApiPropertyOptional({
				example: 'default.png',
				description: 'Optional avatar filename or URL',
		})
		@IsOptional()
		@IsString()
		avatar?: string;
}
