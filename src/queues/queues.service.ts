import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('media') private mediaQueue: Queue,
  ) {}
  
  async addNotificationJob(
    type: 'new_message' | 'new_call' | 'group_invite',
    data: {
      userId: string;
      senderName?: string;
      message?: string;
      callerName?: string;
      callType?: string;
    },
  ) {
    await this.notificationsQueue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async addMediaJob(
    type: 'compress' | 'thumbnail',
    data: {
      mediaId: string;
      fileUrl: string;
      fileType: string;
    },
  ) {
    await this.mediaQueue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async getNotificationQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationsQueue.getWaitingCount(),
      this.notificationsQueue.getActiveCount(),
      this.notificationsQueue.getCompletedCount(),
      this.notificationsQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }

  async getMediaQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.mediaQueue.getWaitingCount(),
      this.mediaQueue.getActiveCount(),
      this.mediaQueue.getCompletedCount(),
      this.mediaQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }
}
