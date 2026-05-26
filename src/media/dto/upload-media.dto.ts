import { IsString, IsOptional } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  messageId?: string;
}
