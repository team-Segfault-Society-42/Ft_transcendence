import { Injectable, logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameResultDto } from './dto/game-result.dto';
import { MovesGameHistory } from './game.types';


@Injectable()
export class MatchesService {
    constructor(private readonly prismaService: PrismaService ) {}

    async recordMatch(result: GameResultDto, history: MovesGameHistory) {

        if (result.player1Id === result.player2Id) {
            throw new BadRequestException("A player cannot play against himself.")
        }

        if (result.winnerId && result.winnerId !== result.player1Id && result.winnerId !== result.player2Id) {
            throw new BadRequestException("The winner must be one of the two players.");
        }

        try {
            await this.prismaService.$transaction(async (tx)=> {
                const newGame = await tx.game.create({ 
                    data : { 
                        player1Id: result.player1Id,
                        player2Id: result.player2Id,
                        scoresP1: result.scoresP1,
                        scoresP2: result.scoresP2,
                        winnerId: result.winnerId, 
                        endReason: result.endReason,
                    } 
                })

                const movesToCreate = history.map((n, i) => ({ 
                    gameId: newGame.id,
                    position: n,
                    moveOrder: i,
                    playerId: (i % 2 === 0) ? newGame.player1Id : newGame.player2Id
                })) 
                
                const newHistory = await tx.move.createMany({
                    data : movesToCreate 
                })

                if (result.winnerId === result.player1Id) {
                    await tx.user.update({
                        where: { id: result.player1Id },
                            data : {
                            wins: {increment: 1},
                            xp: {increment: 20},
                        }  
                    }) 

                    await tx.user.update({
                        where: { id: result.player2Id },
                            data : {
                            losses: {increment: 1},
                            xp: {increment: 5},
                        }  
                    })
                } 
                else if (result.winnerId === result.player2Id) {
                    await tx.user.update({
                        where: { id: result.player2Id },
                            data : {
                            wins: {increment: 1},
                            xp: {increment: 20},
                        }   
                    }) 

                    await tx.user.update({
                        where: { id: result.player1Id },
                            data : {
                            losses: {increment: 1},
                            xp: {increment: 5},
                        }  
                    }) 
                }
                else {

                    await tx.user.update({
                        where: { id: result.player1Id },
                            data : {
                            draws: {increment: 1},
                            xp: {increment: 10},
                        }   
                    }) 

                    await tx.user.update({
                        where: { id: result.player2Id },
                            data : {
                            draws: {increment: 1},
                            xp: {increment: 10},
                        }   
                    }) 
                }
            })
        }
        catch (error) {
            console.error(`Error saving match: ${error.message}`);
            throw new InternalServerErrorException("Unable to save match result.");
        }
    }
}

