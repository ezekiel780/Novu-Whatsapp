import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    messageId?: string,
  ) {
    this.validateFile(file);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `novu/${userId}`,
          public_id: uuidv4(),
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      ).end(file.buffer);
    });

    const media = await this.prisma.media.create({
      data: {
        uploadedBy: userId,
        fileUrl: result.secure_url,
        fileType: file.mimetype,
        fileSize: file.size,
        fileName: file.originalname,
        messageId: messageId ?? null,
      },
    });

    return media;
  }

  async getSignedUrl(userId: string, fileName: string, fileType: string) {
    const publicId = `novu/${userId}/${uuidv4()}-${fileName}`;
    const signedUrl = cloudinary.utils.private_download_url(publicId, fileType, {
      expires_at: Math.floor(Date.now() / 1000) + 300,
    });
    return { signedUrl, fileUrl: signedUrl };
  }

  async getMediaByMessage(messageId: string) {
    return this.prisma.media.findMany({
      where: { messageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyMedia(userId: string) {
    return this.prisma.media.findMany({
      where: { uploadedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteMedia(userId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) throw new NotFoundException('Media not found');
    if (media.uploadedBy !== userId)
      throw new BadRequestException('You can only delete your own media');

    const publicId = media.fileUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
    await this.prisma.media.delete({ where: { id: mediaId } });

    return { message: 'Media deleted successfully' };
  }

  private validateFile(file: Express.Multer.File) {
    const maxSize = 100 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize)
      throw new BadRequestException('File size exceeds 100MB limit');

    if (!allowedTypes.includes(file.mimetype))
      throw new BadRequestException('File type not supported');
  }
}
