import {
	Controller,
	Post,
	Get,
	Param,
	ParseIntPipe,
	Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import { FriendsService } from './friends.service';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@ApiOperation({ summary: 'Send friend request' })
	@ApiParam({
		name: 'userId',
		description: 'Target user ID',
		example: 2,
	})
	@Post('requests/:userId')
	sendFriendRequest(
		@Param('userId', ParseIntPipe) userId: number,
		@Req() req: AuthRequest,
	) {
		return this.friendsService.sendFriendRequest(
			req.user.sub,
			userId,
		);
	}

	@ApiOperation({ summary: 'List incoming friend requests' })
	@Get('requests/incoming')
	getIncomingRequests(@Req() req: AuthRequest) {
		return this.friendsService.getIncomingRequests(req.user.sub);
	}
}
