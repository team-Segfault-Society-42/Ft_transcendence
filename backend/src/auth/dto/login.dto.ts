import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
		@ApiProperty({
				example: 'nico@example.com',
				description: 'User email address',
		})
		@IsEmail({}, { message: 'ERR_AUTH_EMAIL_INVALID' } )
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
}
