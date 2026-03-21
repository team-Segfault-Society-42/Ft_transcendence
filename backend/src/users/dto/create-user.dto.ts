import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MinLength(1)
	username: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsString()
	avatar?: string;
}
