import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendChatMessageDto {
  @IsString({ message: 'ERR_CHAT_MSG_STRING' })
  @MinLength(1, { message: 'ERR_CHAT_MSG_EMPTY' })
  @MaxLength(500, { message: 'ERR_CHAT_MSG_TOO_LONG' })
  content!: string;
}
