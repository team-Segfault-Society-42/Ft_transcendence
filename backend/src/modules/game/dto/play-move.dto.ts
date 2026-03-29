import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class PlayMoveDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  r: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  c: number;
}
