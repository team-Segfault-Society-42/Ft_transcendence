import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum FriendRequestAction {
	ACCEPT = 'ACCEPT',
	DECLINE = 'DECLINE',
}

export class RespondFriendRequestDto {
	@ApiProperty({
		enum: FriendRequestAction,
		example: FriendRequestAction.ACCEPT,
	})
	@IsEnum(FriendRequestAction)
	action: FriendRequestAction;
}
