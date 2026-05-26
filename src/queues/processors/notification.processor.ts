import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

@Processor('notifications')
export class NotificationProcessor {
  private logger = new Logger('NotificationProcessor');

  constructor(private notificationsService: NotificationsService) {}

  @Process('new_message')
  async handleNewMessage(
    job: Job<{
      userId: string;
      senderName: string;
      message: string;
    }>,
  ) {
    const { userId, senderName, message } = job.data;
    await this.notificationsService.notifyNewMessage(
      userId,
      senderName,
      message,
    );
  }

  @Process('new_call')
  async handleNewCall(
    job: Job<{
      userId: string;
      callerName: string;
      callType: string;
    }>,
  ) {
    const { userId, callerName, callType } = job.data;
    await this.notificationsService.notifyIncomingCall(
      userId,
      callerName,
      callType,
    );
  }

  @Process('group_invite')
  async handleGroupInvite(
    job: Job<{
      userId: string;
      groupName: string;
      inviterName: string;
    }>,
  ) {
    const { userId, groupName, inviterName } = job.data;
    await this.notificationsService.create({
      userId,
      type: 'GROUP_INVITE',
      title: `You have been added to ${groupName}`,
      body: `${inviterName} added you to ${groupName}`,
    });
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing notification job ${job.id} — ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed notification job ${job.id} — ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed notification job ${job.id} — ${job.name}: ${error.message}`,
    );
  }
}