import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
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
}
