import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto } from './dto/create-notification.dto';
import * as admin from 'firebase-admin';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Initialize Firebase Admin once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get('FIREBASE_PROJECT_ID'),
          privateKey: this.config
            .get('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
          clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return JSON.stringify(error);
  }

  // ── Create Notification ───────────────────
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        metadata: dto.metadata ?? {},
      },
    });
  }

  // ── Get My Notifications ──────────────────
  async getMyNotifications(userId: string, cursor?: string, take = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const nextCursor =
      notifications.length === take
        ? notifications[notifications.length - 1].id
        : null;

    return { notifications, nextCursor };
  }

  // ── Get Unread Count ──────────────────────
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  // ── Mark As Read ──────────────────────────
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // ── Mark All As Read ──────────────────────
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // ── Delete Notification ───────────────────
  async delete(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  // ── Send Push Notification (FCM) ──────────
  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: {
            aps: { sound: 'default', badge: 1 },
          },
        },
      });
    } catch (error) {
      console.error('FCM push notification error:', this.getErrorMessage(error));
    }
  }

  async sendWhatsAppNotification(
    phoneNumber: string,
    templateName: string,
    parameters: string[],
  ) {
    try {
      const url = `${this.config.get('WHATSAPP_API_URL')}/${this.config.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: parameters.map((p) => ({
                  type: 'text',
                  text: p,
                })),
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.get('WHATSAPP_ACCESS_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error(
        'WhatsApp notification error:',
        this.getErrorMessage(error),
      );
    }
  }


  async sendWhatsAppTextMessage(phoneNumber: string, message: string) {
    try {
      const url = `${this.config.get('WHATSAPP_API_URL')}/${this.config.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.get('WHATSAPP_ACCESS_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error(
        'WhatsApp text message error:',
        this.getErrorMessage(error),
      );
    }
  }

  async handleWhatsAppWebhook(body: any) {
    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) return;

      const message = messages[0];
      const from = message.from;
      const text = message?.text?.body;

      if (!text) return;

      const user = await this.prisma.user.findUnique({
        where: { phoneNumber: from },
      });

      if (!user) return;

      await this.create({
        userId: user.id,
        type: 'NEW_MESSAGE',
        title: 'New WhatsApp message',
        body: text,
        metadata: { from, source: 'whatsapp' },
      });
    } catch (error) {
      console.error('WhatsApp webhook error:', this.getErrorMessage(error));
    }
  }
  
  async notifyNewMessage(userId: string, senderName: string, message: string) {
    const title = `New message from ${senderName}`;
    const body = message.length > 50 ? message.slice(0, 50) + '...' : message;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        fcmToken: true,
        phoneNumber: true,
        isOnline: true,
      },
    });

    // Save to database
    await this.create({ userId, type: 'NEW_MESSAGE', title, body });

    // Only notify if user is offline
    if (!user?.isOnline) {
      if (user?.fcmToken) {
        await this.sendPushNotification(user.fcmToken, title, body);
      }
      if (user?.phoneNumber) {
        await this.sendWhatsAppTextMessage(
          user.phoneNumber,
          `${title}: ${body}`,
        );
      }
    }
  }

  // ── Notify Incoming Call ──────────────────
  async notifyIncomingCall(
    userId: string,
    callerName: string,
    callType: string,
  ) {
    const title = `Incoming ${callType} call`;
    const body = `${callerName} is calling you`;

    // Fetch user fcmToken automatically
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    await this.create({
      userId,
      type: 'NEW_CALL',
      title,
      body,
      metadata: { callerName, callType },
    });

    if (user?.fcmToken) {
      await this.sendPushNotification(user.fcmToken, title, body, {
        type: 'call',
        callerName,
        callType,
      });
    }
  }
}
