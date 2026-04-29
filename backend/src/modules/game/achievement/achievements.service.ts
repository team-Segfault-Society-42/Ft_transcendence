import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AchievementKey, ACHIEVEMENTS } from './achievements.lists';
import { GameResultDto } from '../dto/game-result.dto';

@Injectable()
export class AchievementsService {
  constructor(private readonly prismaService: PrismaService) {}

  async unlockAchievement(
    userId: number,
    key: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prismaService;

    const achievement = ACHIEVEMENTS[key as AchievementKey];

    if (!achievement) return;

    const alreadyHasIt = await prisma.userAchievement.findUnique({
      where: {
        userId_key: { userId, key: achievement.key },
      },
    });

    if (!alreadyHasIt) {
      await prisma.userAchievement.create({
        data: { userId, key: achievement.key },
      });
    }
  }

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
          displayName: metaData?.displayName || 'Unknown success',
          description: metaData?.description || 'Description not available',
        },
      };
    });
    return getInfoFromAchievements;
  }

  async handleMatchAchievements(result: GameResultDto , tx?: Prisma.TransactionClient) {

        await this.unlockAchievement( result.player1Id, 'FIRST_GAME',tx )
        await this.unlockAchievement( result.player2Id, 'FIRST_GAME',tx )

        if (result.winnerId) {
          await this.unlockAchievement( result.winnerId,'FIRST_WIN', tx )
        }

        if (!result.winnerId) {
          await this.unlockAchievement( result.player1Id, 'DRAW_GAME', tx )
          await this.unlockAchievement( result.player2Id, 'DRAW_GAME', tx )
        }

        if (result.endReason === 'timeout') {
          const loserId = result.winnerId === result.player1Id ? result.player2Id : result.player1Id;
          await this.unlockAchievement( loserId, 'LOSE_BY_TIME', tx )
        }
  }

}


