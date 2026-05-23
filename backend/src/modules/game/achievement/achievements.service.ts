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
	 * Uses 'upsert' to prevent duplicate entries if the achievement is already unlocked.
	 * Supports database transactions (tx) to guarantee data consistency.
	 */

	async unlockAchievement(
		userId: number,
		key: string,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = tx || this.prismaService;

		const achievement = ACHIEVEMENTS[key as AchievementKey];

		// If the achievement key doesn't exist in the official list, abort the operation
		if (!achievement) return;

		await prisma.userAchievement.upsert({
			where: { userId_key: { userId, key: achievement.key } },
			update: {},
			create: { userId, key: achievement.key },
		});
	}

	/**
	 * Retrieves the full list of all existing achievements in the game
	 * (the raw metadata containing display names and descriptions).
	 */
	async getAllAchievements() {
		return Object.values(ACHIEVEMENTS);
	}

	/**
	 * Retrieves all achievements unlocked by a specific user.
	 * Maps the database records with the static localized titles and descriptions.
	 */
	async getAchievements(userId: number) {
		const userAchievement = await this.prismaService.userAchievement.findMany({
			where: { userId: userId },
			orderBy: {
				unlockedAt: 'desc',
			},
		});

		// For each unlocked achievement, attach its localized display name and description
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
	 * Checks if a user has unlocked every single achievement in the game.
	 * If they have, automatically grants them the ultimate milestone achievement ('GET_ALL').
	 */
	async checkAllAchievementsUnlocked(
		userId: number,
		tx?: Prisma.TransactionClient,
	) {
		const prisma = tx || this.prismaService;

		// Count how many achievements the user has unlocked (excluding the ultimate one itself)
		const userAchievement = await prisma.userAchievement.count({
			where: {
				userId,
				key: {
					not: 'GET_ALL',
				},
			},
		});
		// If the count matches the total number of achievements minus one, unlock the ultimate achievement
		if (userAchievement >= Object.keys(ACHIEVEMENTS).length - 1) {
			await this.unlockAchievement(userId, 'GET_ALL', tx);
		}
	}

	/**
	 * Processes the outcome of a finished match.
	 * Automatically evaluates and awards corresponding achievements (first game, total wins milestones, draws, or timeouts).
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
