import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/modules/game/game.module';


// @Module({
//   imports: [PrismaModule],
//   providers: [UsersService],
//   controllers: [UsersController],
//   exports: [UsersService],
// })
// export class UsersModule {}
@Module({
  imports: [
    PrismaModule, 
    AuthModule, // <--- ON IMPORTE AuthModule ICI
    forwardRef(() => GameModule)
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
