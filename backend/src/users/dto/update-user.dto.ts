import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(3, { message: 'Username is too short' })
	@MaxLength(20, { message: 'Username is too long' })
	@Matches(/^[a-zA-Z0-9_]+$/, { 
        message: 'Username must not contain spaces' 
    })
	username?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180, { message: 'Bio is too long' })
	bio?: string;

	@IsOptional()
	@IsString()
	avatar?: string;
}
