import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GameModule } from './modules/game/game.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
