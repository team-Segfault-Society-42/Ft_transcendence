import { IsOptional, IsInt, Min, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersQueryDto {
	@ApiPropertyOptional({
		example: 20,
		description: 'Maximum number of users to return. Defaults to 20 and is capped to 100.',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'ERR_QUERY_LIMIT_INVALID' })
    @Min(0, { message: 'ERR_QUERY_LIMIT_INVALID' })
	limit?: number;

	@ApiPropertyOptional({
		example: 0,
		description: 'Number of users to skip before returning results. Defaults to 0.',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'ERR_QUERY_LIMIT_INVALID' })
    @Min(0, { message: 'ERR_QUERY_LIMIT_INVALID' })
	offset?: number;

	@ApiPropertyOptional({
		example: 'nico',
		description: 'Optional case-insensitive username search.',
		minLength: 1,
		maxLength: 50,
	})
	@IsOptional()
	@IsString({ message: 'ERR_QUERY_SEARCH_INVALID' })
    @MinLength(1, { message: 'ERR_QUERY_SEARCH_INVALID' })
    @MaxLength(50, { message: 'ERR_QUERY_SEARCH_INVALID' })
	search?: string;
}
