import { IsEnum } from 'class-validator';
import { CallStatus } from '@prisma/client';

export class UpdateCallDto {
  @IsEnum(CallStatus)
  status: CallStatus;
}
