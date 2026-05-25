import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/**
 * TOTP verification payload used before disabling 2FA.
 *
 * @remarks The code must be exactly 6 digits. This prevents non-numeric
 * 6-character strings from reaching the 2FA service.
 */
export class DisableTwoFactorDto {
	@ApiProperty({
		example: '123456',
		description: '6-digit TOTP code required to disable 2FA.',
	})
	@IsString({ message: 'ERR_AUTH_2FA_CODE_STRING' })
	@Length(6, 6, { message: 'ERR_AUTH_2FA_CODE_LENGTH' })
	@Matches(/^\d{6}$/, { message: 'ERR_AUTH_2FA_CODE_DIGITS' })
	code: string;
}
