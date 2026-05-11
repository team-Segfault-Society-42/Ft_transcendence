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
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  player1Id: number;

  @ApiProperty({
    example: 2,
    description: 'Id of player2',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  player2Id: number;

  @ApiProperty({
    example: 12,
    description: 'score of player1',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  scoresP1: number;

  @ApiProperty({
    example: 8,
    description: 'Score of player2',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  scoresP2: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'User ID of the winner, null if draw',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  winnerId?: number;

  @ApiPropertyOptional({
    example: 'win',
    description: 'Reason the game ended',
    enum: ['win', 'draw', 'timeout', 'forfeit'],
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  endReason?: string | null;
}
