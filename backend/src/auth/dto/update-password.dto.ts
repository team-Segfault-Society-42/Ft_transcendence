import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	Matches,
	MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
	@ApiPropertyOptional({
		description: 'Current password. Required if the account already has a password.',
		example: 'OldPassword123',
	})
	@IsOptional()
	@IsString({ message: 'ERR_AUTH_CURRENT_PWD_STRING' })
	currentPassword?: string;

	@ApiProperty({
		description: 'New password',
		example: 'NewPassword123',
	})
	@IsString({ message: 'ERR_AUTH_PWD_STRING' })
	@MinLength(8, { message: 'ERR_AUTH_PWD_MIN_LENGTH' })
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
		message: 'ERR_AUTH_PWD_COMPLEXITY',
	})
	newPassword: string;
}
