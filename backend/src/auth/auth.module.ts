import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtAuthGuard, 
    { provide: 'APP_GUARD', useClass: JwtAuthGuard }
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
