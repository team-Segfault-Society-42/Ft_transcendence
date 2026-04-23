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
    const userAchievement = await this.prismaService.userachievement.findMany({
      where: { userId: userId },
      orderBy: {
        unlockedAt: "desc"
      },
      include: {
        achievement: true
      }
    })

  }

}
