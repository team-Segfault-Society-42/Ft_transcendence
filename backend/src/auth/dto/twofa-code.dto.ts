import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/**
 * TOTP verification payload used for 2FA setup and login.
 *
 * @remarks The code must be exactly 6 digits.
 */
export class TwoFactorCodeDto {
	@ApiProperty({
		example: '123456',
		description: '6-digit TOTP code from the authenticator app.',
	})
	@IsString({ message: 'ERR_AUTH_2FA_CODE_STRING' })
	@Length(6, 6, { message: 'ERR_AUTH_2FA_CODE_LENGTH' })
	@Matches(/^\d{6}$/, { message: 'ERR_AUTH_2FA_CODE_DIGITS' })
	code: string;
}
