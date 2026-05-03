import { IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	limit?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	offset?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	search?: string;
}
