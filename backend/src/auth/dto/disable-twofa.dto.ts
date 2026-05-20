import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class DisableTwoFactorDto {
	@ApiProperty({
		example: '123456',
		description: '6-digit TOTP code required to disable 2FA',
	})
	@IsString({ message: 'ERR_AUTH_2FA_CODE_STRING' })
	@Length(6, 6, { message: 'ERR_AUTH_2FA_CODE_LENGTH' })
	code: string;
}
