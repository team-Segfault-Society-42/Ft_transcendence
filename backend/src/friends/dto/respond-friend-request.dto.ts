import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum FriendRequestAction {
	ACCEPT = 'ACCEPT',
	DECLINE = 'DECLINE',
}

/**
 * Request body used by the receiver of a pending friend request.
 */
export class RespondFriendRequestDto {
	@ApiProperty({
		enum: FriendRequestAction,
		example: FriendRequestAction.ACCEPT,
		description: 'Action to apply to the incoming friend request.',
	})
	@IsEnum(FriendRequestAction, { message: 'ERR_FRIEND_ACTION_INVALID' })
	action: FriendRequestAction;
}
