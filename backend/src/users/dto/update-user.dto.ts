import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(3, { message: 'ERR_USER_USERNAME_MIN_LENGTH' })
	@MaxLength(20, { message: 'ERR_USER_USERNAME_MAX_LENGTH' })
	@Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'ERR_USER_USERNAME_NO_SPACES'
    })
	username?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180, { message: 'ERR_USER_BIO_MAX_LENGTH' })
	bio?: string;

}
