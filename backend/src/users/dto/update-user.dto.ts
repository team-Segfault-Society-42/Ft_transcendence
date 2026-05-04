import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(20)
	username?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180)
	bio?: string;

	@IsOptional()
	@IsString()
	avatar?: string;
}
