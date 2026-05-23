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

  /**
   * Records a completed match into the database.
   * Runs inside a transaction to guarantee that game data, move history,
   * player stats, and achievement unlocks all succeed or fail together.
   *
   * @param result - Game result DTO containing player IDs, scores, and outcome.
   * @param history - Ordered sequence of move positions for replay history.
   */
  async recordMatch(result: GameResultDto, history: MovesGameHistory) {
    if (result.player1Id === result.player2Id) {
      throw new BadRequestException('ERR_MATCH_SELF_PLAY');
    }

    if (
      result.winnerId &&
      result.winnerId !== result.player1Id &&
      result.winnerId !== result.player2Id
    ) {
      throw new BadRequestException(
        'ERR_MATCH_INVALID_WINNER',
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
            data: { wins: { increment: 1 }, xp: { increment: 100 }, totalGames: { increment: 1 } },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: { losses: { increment: 1 }, xp: { increment: 25 }, totalGames: { increment: 1 } },
          });
        } else if (result.winnerId === result.player2Id) {
          await tx.user.update({
            where: { id: result.player2Id },
            data: { wins: { increment: 1 }, xp: { increment: 100 }, totalGames: { increment: 1 } },
          });

          await tx.user.update({
            where: { id: result.player1Id },
            data: { losses: { increment: 1 }, xp: { increment: 25 }, totalGames: { increment: 1 } },
          });
        } else {
          await tx.user.update({
            where: { id: result.player1Id },
            data: { draws: { increment: 1 }, xp: { increment: 50 }, totalGames: { increment: 1 } },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: { draws: { increment: 1 }, xp: { increment: 50 }, totalGames: { increment: 1 } },
          });
        }

        await this.achievementService.handleMatchAchievements(result, tx)

      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error saving match: ${error.message}`);
      } else {
        console.error('Error saving match: An unknown error occurred');
      }
      throw new InternalServerErrorException('ERR_MATCH_SAVE_FAILED');
    }
  }

  /**
   * Retrieves the match history for a given user.
   * Formats results from the user's perspective — win/loss/draw and their
   * own score vs the opponent's score, regardless of which player slot they occupied.
   *
   * @param userId - ID of the user requesting their history.
   * @returns List of formatted match results from the user's perspective.
   */
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
        resultStatus = 'draw';
      } else if (m.winnerId === userId) {
        resultStatus = 'win';
      } else {
        resultStatus = 'loss';
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

  /**
   * Fetches the top 10 players for the leaderboard.
   * Sorting is applied server-side for performance.
   *
   * @param sortBy - Metric to rank players by ('wins', 'xp', or 'totalGames').
   * @returns Top 10 players sorted by the selected metric.
   */
  async getGameLeaderboard(sortBy: 'wins' | 'xp' | 'totalGames') {
    let orderBy;
    if (sortBy === 'wins') {
      orderBy = { wins: 'desc' };
    } else if (sortBy === 'xp') {
      orderBy = { xp: 'desc' };
    } else if (sortBy === 'totalGames') {
      orderBy = { totalGames: 'desc' };
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
        totalGames: m.totalGames,
      };
    });
    return getUserInfo;
  }
}
