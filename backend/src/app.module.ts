import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [UsersModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
