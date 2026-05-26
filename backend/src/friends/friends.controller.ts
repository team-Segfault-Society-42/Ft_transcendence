import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Req,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { FriendsService } from './friends.service';

@ApiTags('Friends')
@ApiCookieAuth()
@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	/**
	 * @description Sends a friend request from the authenticated user to another user.
	 * @param userId - Target user ID from the route parameter.
	 * @param req - Authenticated request containing the sender ID.
	 * @returns Created friend request summary.
	 */
	@Post('requests/:userId')
	@ApiOperation({ summary: 'Send friend request' })
	@ApiParam({
		name: 'userId',
		description: 'Target user ID.',
		example: 2,
	})
	@ApiOkResponse({ description: 'Friend request sent successfully' })
	@ApiBadRequestResponse({ description: 'Cannot send request to self or too many pending requests' })
	@ApiConflictResponse({ description: 'Friend request already exists or users are already friends' })
	@ApiNotFoundResponse({ description: 'Target user not found' })
	sendFriendRequest(
		@Param('userId', ParseIntPipe) userId: number,
		@Req() req: AuthRequest,
	) {
		return this.friendsService.sendFriendRequest(req.user.sub, userId);
	}

	/**
	 * @description Lists pending friend requests received by the authenticated user.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Incoming friend requests with safe public sender data.
	 */
	@Get('requests/incoming')
	@ApiOperation({ summary: 'List incoming friend requests' })
	@ApiOkResponse({ description: 'Incoming friend requests returned successfully' })
	getIncomingRequests(@Req() req: AuthRequest) {
		return this.friendsService.getIncomingRequests(req.user.sub);
	}

	/**
	 * @description Lists pending friend requests sent by the authenticated user.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Outgoing friend requests with safe public receiver data.
	 */
	@Get('requests/outgoing')
	@ApiOperation({ summary: 'List outgoing friend requests' })
	@ApiOkResponse({ description: 'Outgoing friend requests returned successfully' })
	getOutgoingRequests(@Req() req: AuthRequest) {
		return this.friendsService.getOutgoingRequests(req.user.sub);
	}

	/**
	 * @description Accepts or declines an incoming friend request.
	 * @param requestId - Friend request ID from the route parameter.
	 * @param body - Validated action payload.
	 * @param req - Authenticated request containing the receiver ID.
	 * @returns Accepted friendship summary or decline message.
	 * @remarks Only the receiver of the pending request may respond.
	 */
	@Patch('requests/:requestId')
	@ApiOperation({ summary: 'Accept or decline incoming friend request' })
	@ApiParam({
		name: 'requestId',
		description: 'Friend request ID.',
		example: 1,
	})
	@ApiBody({ type: RespondFriendRequestDto })
	@ApiOkResponse({ description: 'Friend request response handled successfully' })
	@ApiBadRequestResponse({ description: 'Invalid request action' })
	@ApiForbiddenResponse({ description: 'Authenticated user is not allowed to respond to this request' })
	@ApiConflictResponse({ description: 'Friend request is no longer pending' })
	@ApiNotFoundResponse({ description: 'Friend request not found' })
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

	/**
	 * @description Lists accepted friends for the authenticated user.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Accepted friendships with safe public friend data.
	 */
	@Get()
	@ApiOperation({ summary: 'List accepted friends' })
	@ApiOkResponse({ description: 'Accepted friends returned successfully' })
	getFriends(@Req() req: AuthRequest) {
		return this.friendsService.getFriends(req.user.sub);
	}

	/**
	 * @description Lists realtime status information for accepted friends.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Online, in-game, and activity state for accepted friends.
	 */
	@Get('status')
	@ApiOperation({ summary: 'List accepted friends statuses' })
	@ApiOkResponse({ description: 'Accepted friend statuses returned successfully' })
	getFriendsStatus(@Req() req: AuthRequest) {
		return this.friendsService.getFriendsStatus(req.user.sub);
	}

	/**
	 * @description Removes an accepted friendship involving the authenticated user.
	 * @param friendshipId - Accepted friendship ID from the route parameter.
	 * @param req - Authenticated request containing the current user ID.
	 * @returns Frontend translation message key.
	 * @remarks A user may only remove friendships they are part of.
	 */
	@Delete(':friendshipId')
	@ApiOperation({ summary: 'Remove accepted friend' })
	@ApiParam({
		name: 'friendshipId',
		description: 'Accepted friendship ID.',
		example: 1,
	})
	@ApiOkResponse({ description: 'Friend removed successfully' })
	@ApiBadRequestResponse({ description: 'Friendship is not accepted' })
	@ApiForbiddenResponse({ description: 'Authenticated user is not part of this friendship' })
	@ApiNotFoundResponse({ description: 'Friendship not found' })
	removeFriend(
		@Param('friendshipId', ParseIntPipe) friendshipId: number,
		@Req() req: AuthRequest,
	) {
		return this.friendsService.removeFriend(req.user.sub, friendshipId);
	}
}
