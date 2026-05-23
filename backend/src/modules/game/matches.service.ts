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
   * Records a completed match and all its metrics into the database.
   * This operation runs inside a database transaction ($transaction) to ensure that
   * game registration, move history tracking, player XP/stats updates, and achievement unlocks
   * either succeed completely together or fail together without leaving corrupt or partial data.
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
        // 1. Create the primary match record in the Game table
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

        // 2. Map out the sequence of player moves for history mapping
        const movesToCreate = history.map((n, i) => ({
          gameId: newGame.id,
          position: n,
          moveOrder: i,
          playerId: i % 2 === 0 ? newGame.player1Id : newGame.player2Id,
        }));

        // Bulk insert the compiled move entries into the Move table
        const newHistory = await tx.move.createMany({
          data: movesToCreate,
        });

        // 3. Update player profiles based on the match outcome
        if (result.winnerId === result.player1Id) {
          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              wins: { increment: 1 },
              xp: { increment: 100 },
              totalGames: { increment: 1 },
            },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              losses: { increment: 1 },
              xp: { increment: 25 },
              totalGames: { increment: 1 },
            },
          });
        } else if (result.winnerId === result.player2Id) {
          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              wins: { increment: 1 },
              xp: { increment: 100 },
              totalGames: { increment: 1 },
            },
          });

          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              losses: { increment: 1 },
              xp: { increment: 25 },
              totalGames: { increment: 1 },
            },
          });
        } else {
          await tx.user.update({
            where: { id: result.player1Id },
            data: {
              draws: { increment: 1 },
              xp: { increment: 50 },
              totalGames: { increment: 1 },
            },
          });

          await tx.user.update({
            where: { id: result.player2Id },
            data: {
              draws: { increment: 1 },
              xp: { increment: 50 },
              totalGames: { increment: 1 },
            },
          });
        }

        // 4. Delegate to the Achievement system to process potential award triggers using the same transaction
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
   * Retrieves the historical list of completed games for a given user.
   * Formats the data so the frontend can easily recognize the user's specific performance 
   * (win/loss/draw outcome, local player scores vs opponent scores) relative to their perspective.
   */
	async getFinishedGamesHistory(userId: number) {
    // Find all games where the user was either player 1 or player 2, including basic opponent profiles
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

    // Map database structures to an intuitive, relative layout for frontend rendering
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

      // Assign scores matching the user's slot
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
   * Fetches the top 10 players to build the competitive game leaderboard.
   * Dynamically handles sorting criteria based on the selected metric ('wins', 'xp', or 'totalGames').
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

    // Query the database for the top 10 profiles matching the sorting configuration
    const user = await this.prismaService.user.findMany({
      orderBy: orderBy,
      take: 10,
    });

    // Filter public properties out to avoid exposing sensitive credentials on the ranking board
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
