import { IsOptional, IsNotEmpty, IsNumber, IsPositive, Min, IsString } from 'class-validator';

export class GameResultDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    player1Id: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    player2Id: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    scoresP1: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    scoresP2: number;

    @IsOptional()
    @IsNumber()
    winnerId?: number;

    @IsString()
    @IsNotEmpty()
    endReason?: string | null;

}