import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class PlayMoveDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @Min(0)
  @Max(2)
  r: string;

  @IsString()
  @Min(0)
  @Max(2)
  c: string;
}
