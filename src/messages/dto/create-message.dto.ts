import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsOptional()
  @IsString()
  replyToId?: string;

  @IsOptional()
  @IsString()
  mediaId?: string;
}
