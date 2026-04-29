import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AchievementKey, ACHIEVEMENTS } from './achievements.lists';

@Injectable()
export class AchievementsService {
  constructor(private readonly prismaService: PrismaService) {}

  async unlockAchievement(
    userId: number,
    key: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prismaService;

    const achievement =  ACHIEVEMENTS[key as AchievementKey]

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
        unlockedAt: "desc"
      }})
    
    const getInfoFromAchievements = userAchievement.map((m) => {

      const metaData = ACHIEVEMENTS[m.key as AchievementKey]

      return {
        id: m.userId,
        achievementId: m.key,
        unlockedAt: m.unlockedAt,
        achievement: {
          key: m.key,
          displayName: metaData?.displayName || 'Unknown success',
          description: metaData?.description || 'Description not available',
        }
      }
    })
    return getInfoFromAchievements
  }
}
