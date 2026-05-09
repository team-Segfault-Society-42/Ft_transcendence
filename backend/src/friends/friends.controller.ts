import {
	Controller,
	Post,
	Get,
	Param,
	ParseIntPipe,
	Req,
	Patch,
	Body,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import { FriendsService } from './friends.service';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

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

	@ApiOperation({ summary: 'List outgoing friend requests' })
	@Get('requests/outgoing')
	getOutgoingRequests(@Req() req: AuthRequest) {
		return this.friendsService.getOutgoingRequests(req.user.sub);
	}

	@ApiOperation({ summary: 'Accept or decline incoming friend request' })
	@ApiParam({
		name: 'requestId',
		description: 'Friend request ID',
		example: 1,
	})
	@Patch('requests/:requestId')
	respondToFriendRequest(
		@Param('requestId', ParseIntPipe) requestId: number,
		@Body() body: RespondFriendRequestDto,
		@Req() req: AuthRequest,
	) {
		return this.friendsService.respondToFriendRequest(
			req.user.sub,
			requestId,
			body.action,
		);
	}
}
