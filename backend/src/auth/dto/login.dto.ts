import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
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
}
