import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Payload received from the chat socket when a user sends a message.
 * The content is trimmed before validation and broadcast.
 */
export class SendChatMessageDto {
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString({ message: 'ERR_CHAT_MSG_STRING' })
	@IsNotEmpty({ message: 'ERR_CHAT_MSG_EMPTY' })
	@MaxLength(500, { message: 'ERR_CHAT_MSG_TOO_LONG' })
	content!: string;
}
