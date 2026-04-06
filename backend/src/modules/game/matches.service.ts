import { Injectable } from '@nestjs/common';
import { PrismaService, $transaction } from 'src/prisma/prisma.service';
import { GameResultDto } from './dto/game-result.dto';
import { MovesGameHistory } from './game.types';


@Injectable()
export class MatchesService {
    constructor(private readonly prismaService: PrismaService ) {}

    async recordMatch(result: GameResultDto, history: MovesGameHistory) {
        await this.prismaService.$transaction(async (tx)=> {
            const newGame = await tx.game.create({ 
                data : { 
                    player1Id: result.player1Id,
                    player2Id: result.player2Id,
                    scoresP1: result.scoresP1,
                    scoresP2: result.scoresP2,
                    winnerId: result.winnerId, 
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

        })

    }

}

