import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AchievementKey, ACHIEVEMENTS } from './achievements.lists';
import { GameResultDto } from '../dto/game-result.dto';

@Injectable()
export class AchievementsService {
	constructor(private readonly prismaService: PrismaService) {}

  /**
   * Unlocks an achievement for a specific user.
   * Uses upsert to prevent duplicate entries if the achievement is already unlocked.
   *
   * @param userId - ID of the user receiving the achievement.
   * @param key - Achievement key to unlock.
   * @param tx - Optional Prisma transaction client for data consistency.
   */
	async unlockAchievement(
		userId: number,
		key: string,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = tx || this.prismaService;

		const achievement = ACHIEVEMENTS[key as AchievementKey];
		if (!achievement) return;

		await prisma.userAchievement.upsert({
			where: { userId_key: { userId, key: achievement.key } },
			update: {},
			create: { userId, key: achievement.key },
		});
	}

  /**
   * Retrieves the full list of all achievements available in the game.
   *
   * @returns All achievement metadata objects.
   */
	async getAllAchievements() {
		return Object.values(ACHIEVEMENTS);
	}

  /**
   * Retrieves all achievements unlocked by a specific user,
   * enriched with their localized display names and descriptions.
   *
   * @param userId - ID of the user to fetch achievements for.
   * @returns List of unlocked achievements with display metadata.
   */
	async getAchievements(userId: number) {
		const userAchievement = await this.prismaService.userAchievement.findMany({
			where: { userId: userId },
			orderBy: {
				unlockedAt: 'desc',
			},
		});

		const getInfoFromAchievements = userAchievement.map((m) => {
			const metaData = ACHIEVEMENTS[m.key as AchievementKey];

			return {
				id: m.userId,
				achievementId: m.key,
				unlockedAt: m.unlockedAt,
				achievement: {
					key: m.key,
					displayName: metaData?.displayName || 'ACH_UNKNOWN_NAME',
					description: metaData?.description || 'ACH_UNKNOWN_DESC',
				},
			};
		});
		return getInfoFromAchievements;
	}

  /**
   * Checks if a user has unlocked all achievements.
   * Automatically grants the GET_ALL milestone if every other achievement is unlocked.
   *
   * @param userId - ID of the user to check.
   * @param tx - Optional Prisma transaction client.
   */
	async checkAllAchievementsUnlocked(
		userId: number,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = tx || this.prismaService;

		const userAchievement = await prisma.userAchievement.count({
			where: {
				userId,
				key: {
					not: 'GET_ALL',
				},
			},
		});
		if (userAchievement >= Object.keys(ACHIEVEMENTS).length - 1) {
			await this.unlockAchievement(userId, 'GET_ALL', tx);
		}
	}

  /**
   * Evaluates and awards achievements after a match ends.
   * Handles first game, first win, win milestones, draws, and timeout losses.
   *
   * @param result - Match result containing player IDs and outcome details.
   * @param tx - Optional Prisma transaction client.
   */
	async handleMatchAchievements(
		result: GameResultDto,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = tx || this.prismaService;

		await this.unlockAchievement(result.player1Id, 'FIRST_GAME', tx);
		await this.unlockAchievement(result.player2Id, 'FIRST_GAME', tx);

		if (result.winnerId) {
			await this.unlockAchievement(result.winnerId, 'FIRST_WIN', tx);

			const winner = await prisma.user.findUnique({
				where: { id: result.winnerId },
			});

			if (winner) {
				if (winner.wins >= 5) {
					await this.unlockAchievement(winner.id, 'WIN_5', tx);
				}
				if (winner.wins >= 10) {
					await this.unlockAchievement(winner.id, 'WIN_10', tx);
				}
				if (winner.wins >= 50) {
					await this.unlockAchievement(winner.id, 'WIN_50', tx);
				}
			}
		}

		if (!result.winnerId) {
			await this.unlockAchievement(result.player1Id, 'DRAW_GAME', tx);
			await this.unlockAchievement(result.player2Id, 'DRAW_GAME', tx);
		}

		if (result.endReason === 'timeout') {
			const loserId =
				result.winnerId === result.player1Id
					? result.player2Id
					: result.player1Id;
			await this.unlockAchievement(loserId, 'LOSE_BY_TIME', tx);
		}

		await this.checkAllAchievementsUnlocked(result.player1Id, tx);
		await this.checkAllAchievementsUnlocked(result.player2Id, tx);
	}
}
