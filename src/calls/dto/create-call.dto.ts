import { IsString, IsEnum } from 'class-validator';
import { CallType } from '@prisma/client';

export class CreateCallDto {
  @IsString()
  receiverId: string;

  @IsEnum(CallType)
  type: CallType;
}
