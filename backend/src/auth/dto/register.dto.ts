import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
		@ApiProperty({
				example: 'nico@example.com',
				description: 'User email address',
		})
		@IsEmail()
		email: string;

		@ApiProperty({
				example: 'secret123',
				description: 'User password',
				minLength: 6,
		})
		@IsString()
		@MinLength(6)
		password: string;

		@ApiProperty({
				example: 'nico42',
				description: 'Unique username',
		})
		@IsString()
		@MinLength(1)
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
