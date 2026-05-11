import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class PlayMoveDto {
  @ApiProperty({
    example: 'c384eb42-8126-4ae9-9649-eacf67cff9dd',
    description: 'ID of the game',
  })
  @IsString()
  @IsNotEmpty()
  gameId!: string;

  @ApiProperty({
    example: 1,
    description: 'Row index (0 to 2)',
    minimum: 0,
    maximum: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  r!: number;

  @ApiProperty({
    example: 2,
    description: 'Column index (0 to 2)',
    minimum: 0,
    maximum: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  c!: number;
}
