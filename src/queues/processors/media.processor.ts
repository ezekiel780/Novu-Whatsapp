import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('media')
export class MediaProcessor {
  private logger = new Logger('MediaProcessor');

  // ── Process Media Compression ─────────────
  @Process('compress')
  async handleCompress(
    job: Job<{
      mediaId: string;
      fileUrl: string;
      fileType: string;
    }>,
  ) {
    const { mediaId, fileUrl, fileType } = job.data;
    this.logger.log(`Compressing media ${mediaId} — ${fileType}`);

    // TODO: Add sharp or ffmpeg compression logic here
    // For images: use sharp
    // For videos: use ffmpeg
  }

  // ── Process Thumbnail Generation ──────────
  @Process('thumbnail')
  async handleThumbnail(
    job: Job<{
      mediaId: string;
      fileUrl: string;
      fileType: string;
    }>,
  ) {
    const { mediaId, fileUrl, fileType } = job.data;
    this.logger.log(`Generating thumbnail for ${mediaId} — ${fileType}`);

    // TODO: Add thumbnail generation logic here
  }

  // ── Queue Event Listeners ─────────────────
  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing media job ${job.id} — ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed media job ${job.id} — ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed media job ${job.id} — ${job.name}: ${error.message}`,
    );
  }
}
