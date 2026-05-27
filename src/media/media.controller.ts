import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        messageId: { type: 'string', nullable: true },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  uploadFile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('messageId') messageId?: string,
  ) {
    return this.mediaService.uploadFile(req.user.id, file, messageId);
  }

  @Post('signed-url')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fileName', 'fileType'],
      properties: {
        fileName: { type: 'string', example: 'photo.jpg' },
        fileType: { type: 'string', example: 'image/jpeg' },
      },
    },
  })
  getSignedUrl(
    @Req() req: any,
    @Body('fileName') fileName: string,
    @Body('fileType') fileType: string,
  ) {
    return this.mediaService.getSignedUrl(req.user.id, fileName, fileType);
  }

  @Get('me')
  getMyMedia(@Req() req: any) {
    return this.mediaService.getMyMedia(req.user.id);
  }

  @Get('message/:messageId')
  getMediaByMessage(@Param('messageId') messageId: string) {
    return this.mediaService.getMediaByMessage(messageId);
  }

  @Delete(':id')
  deleteMedia(@Req() req: any, @Param('id') id: string) {
    return this.mediaService.deleteMedia(req.user.id, id);
  }
}
