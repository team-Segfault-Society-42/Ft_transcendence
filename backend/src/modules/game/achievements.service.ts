import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class AchievementsService {
  constructor(private readonly prismaService: PrismaService) {}

  async unlockAchievement(
    userId: number,
    key: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prismaService;

    const achievement = await prisma.achievement.findUnique({
      where: { key },
    });

    if (!achievement) return;

    const alreadyHasIt = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
    });

    if (!alreadyHasIt) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
    }
  }

  async getAchievements(userId: number) {
    const userAchievement = await this.prismaService.userchievement.findMany({
      where: { userId: userId },
      orderBy: {
        unlockedAt: "desc"
      },
      include: {
        achievement: true
      }
    })

    const getInfoFromAchievements = userAchievement.map((m) => {
      return {
        id: m.userId,
        achievementId: m.achievementId,
        unlockedAt: m.unlockedAt,
        achievement: {
          id: m.achievement.id,
          key: m.achievement.key,
          displayName: m.achievement.displayName,
          description: m.achievement.description,
        }
      }
    })
    return getInfoFromAchievements
  }
}
