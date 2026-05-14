import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TwoFactorCodeDto {
	@ApiProperty({
		example: '123456',
		description: '6-digit TOTP code from the authenticator app',
	})
	@IsString({ message: 'ERR_AUTH_2FA_CODE_STRING' })
	@Length(6, 6, { message: 'ERR_AUTH_2FA_CODE_LENGTH' })
	code: string;
}
