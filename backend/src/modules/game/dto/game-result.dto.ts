import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GameResultDto {
  @ApiProperty({
    example: 1,
    description: 'Id of player1',
  })
  @IsNotEmpty({ message: 'ERR_GAME_PLAYER_ID_INVALID' })
  @IsNumber({}, { message: 'ERR_GAME_PLAYER_ID_INVALID' })
  @IsPositive({ message: 'ERR_GAME_PLAYER_ID_INVALID' })
  player1Id: number;

  @ApiProperty({
    example: 2,
    description: 'Id of player2',
  })
  @IsNotEmpty({ message: 'ERR_GAME_PLAYER_ID_INVALID' })
  @IsNumber({}, { message: 'ERR_GAME_PLAYER_ID_INVALID' })
  @IsPositive({ message: 'ERR_GAME_PLAYER_ID_INVALID' })
  player2Id: number;

  @ApiProperty({
    example: 12,
    description: 'score of player1',
  })
  @IsNotEmpty({ message: 'ERR_GAME_SCORE_INVALID' })
  @IsNumber({}, { message: 'ERR_GAME_SCORE_INVALID' })
  @Min(0, { message: 'ERR_GAME_SCORE_INVALID' })
  scoresP1: number;

  @ApiProperty({
    example: 8,
    description: 'Score of player2',
  })
  @IsNotEmpty({ message: 'ERR_GAME_SCORE_INVALID' })
  @IsNumber({}, { message: 'ERR_GAME_SCORE_INVALID' })
  @Min(0, { message: 'ERR_GAME_SCORE_INVALID' })
  scoresP2: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'User ID of the winner, null if draw',
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ERR_GAME_PLAYER_ID_INVALID' })
  winnerId?: number;

  @ApiPropertyOptional({
    example: 'win',
    description: 'Reason the game ended',
    enum: ['win', 'draw', 'timeout', 'forfeit'],
    nullable: true,
  })
  @IsString({ message: 'ERR_GAME_END_REASON_REQUIRED' })
  @IsNotEmpty({ message: 'ERR_GAME_END_REASON_REQUIRED' })
  endReason?: string | null;
}
