import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameResultDto } from './dto/game-result.dto';
import { MovesGameHistory } from './game.types';
import { AchievementsService } from './achievement/achievements.service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly achievementService: AchievementsService,
  ) {}

  async recordMatch(result: GameResultDto, history: MovesGameHistory) {
    if (result.player1Id === result.player2Id) {
      throw new BadRequestException('A player cannot play against himself.');
    }

    if (
      result.winnerId &&
      result.winnerId !== result.player1Id &&
      result.winnerId !== result.player2Id
    ) {
      throw new BadRequestException(
        'The winner must be one of the two players.',
      );
    }

    try {
      await this.prismaService.$transaction(async (tx) => {
        const newGame = await tx.game.create({
          data: {
            player1Id: result.player1Id,
            player2Id: result.player2Id,
            scoresP1: result.scoresP1,
            scoresP2: result.scoresP2,
            winnerId: result.winnerId,
            endReason: result.endReason,
          },
        });

        const movesToCreate = history.map((n, i) => ({
          gameId: newGame.id,
          position: n,
          moveOrder: i,
          playerId: i % 2 === 0 ? newGame.player1Id : newGame.player2Id,
        }));

        const newHistory = await tx.move.createMany({
          data: movesToCreate,
        });

        if (result.winnerId === result.player1Id) {
          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              wins: { increment: 1 },
              xp: { increment: 20 },
            },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              losses: { increment: 1 },
              xp: { increment: 5 },
            },
          });
        } else if (result.winnerId === result.player2Id) {
          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              wins: { increment: 1 },
              xp: { increment: 20 },
            },
          });

          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              losses: { increment: 1 },
              xp: { increment: 5 },
            },
          });
        } else {
          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              draws: { increment: 1 },
              xp: { increment: 10 },
            },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              draws: { increment: 1 },
              xp: { increment: 10 },
            },
          });
        }

        // ── Handle Match Achievements ────────────────────────────────────────────────────────
        await this.achievementService.handleMatchAchievements(result, tx)

      });
    } catch (error) {
      console.error(`Error saving match: ${error.message}`);
      throw new InternalServerErrorException('Unable to save match result.');
    }
  }

	async getFinishedGamesHistory(userId: number) {
		const game = await this.prismaService.game.findMany({
		where: {
			OR: [{ player1Id: userId }, { player2Id: userId }],
		},
		include: {
				player1: {
					select: {
						username: true,
						avatar: true,
					},
				},
				player2: {
					select: {
						username: true,
						avatar: true,
					},
				},
			},
		orderBy: {
			date: 'desc',
		},
		});

    const getUserInfoFromGame = game.map((m) => {
      const isPLayer1 = m.player1Id === userId;
      const opponent = isPLayer1 ? m.player2 : m.player1;

      const hasWinner = m.winnerId === userId;
      let resultStatus: string;

      if (m.winnerId === null) {
        resultStatus = 'DRAW';
      } else if (m.winnerId === userId) {
        resultStatus = 'WIN';
      } else {
        resultStatus = 'LOSS';
      }

      const myScore = isPLayer1 ? m.scoresP1 : m.scoresP2;
      const oppScore = isPLayer1 ? m.scoresP2 : m.scoresP1;

      return {
        id: m.id,
        date: m.date,
        result: resultStatus,
        myScore: myScore,
        oppScore: oppScore,
        opponent: {
          username: opponent.username,
          avatar: opponent.avatar,
        },
      };
    });

    return getUserInfoFromGame;
  }

  async getGameLeaderboard(sortBy: 'wins' | 'xp') {
    let orderBy;
    if (sortBy === 'wins') {
      orderBy = { wins: 'desc' };
    } else if (sortBy === 'xp') {
      orderBy = { xp: 'desc' };
    } else {
      orderBy = { wins: 'desc' };
    }

    const user = await this.prismaService.user.findMany({
      orderBy: orderBy,
      take: 10,
    });

    const getUserInfo = user.map((m) => {
      return {
        id: m.id,
        username: m.username,
        xp: m.xp,
        wins: m.wins,
      };
    });
    return getUserInfo;
  }
}
