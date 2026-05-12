import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';

@Module({
	imports: [AuthModule],
	providers: [PresenceGateway, PresenceService],
	exports: [PresenceService],
})
export class PresenceModule {}
