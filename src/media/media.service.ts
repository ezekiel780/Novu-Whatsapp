import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.get('AWS_S3_BUCKET');
  }

  // ── Upload File ───────────────────────────
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    messageId?: string,
  ) {
    this.validateFile(file);

    const key = `uploads/${userId}/${uuidv4()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const fileUrl = `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}`;

    const media = await this.prisma.media.create({
      data: {
        uploadedBy: userId,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        fileName: file.originalname,
        messageId: messageId ?? null,
      },
    });

    return media;
  }

  // ── Get Signed URL ────────────────────────
  async getSignedUrl(userId: string, fileName: string, fileType: string) {
    const key = `uploads/${userId}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return { signedUrl, key, fileUrl: `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}` };
  }

  // ── Get Media By Message ──────────────────
  async getMediaByMessage(messageId: string) {
    return this.prisma.media.findMany({
      where: { messageId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Get My Media ──────────────────────────
  async getMyMedia(userId: string) {
    return this.prisma.media.findMany({
      where: { uploadedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Delete Media ──────────────────────────
  async deleteMedia(userId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) throw new NotFoundException('Media not found');
    if (media.uploadedBy !== userId)
      throw new BadRequestException('You can only delete your own media');

    const key = media.fileUrl.split('.amazonaws.com/')[1];

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    await this.prisma.media.delete({ where: { id: mediaId } });

    return { message: 'Media deleted successfully' };
  }

  // ── Validate File ─────────────────────────
  private validateFile(file: Express.Multer.File) {
    const maxSize = 100 * 1024 * 1024; // 100MB
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
