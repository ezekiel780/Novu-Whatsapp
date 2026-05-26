import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ── Send Message ──────────────────────────
  async create(userId: string, dto: CreateMessageDto) {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        userId,
        conversationId: dto.conversationId,
        leftAt: null,
      },
    });
    if (!member) throw new ForbiddenException('You are not in this conversation');

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
        messageType: dto.messageType ?? 'TEXT',
        replyToId: dto.replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: { displayName: true },
            },
          },
        },
        media: true,
      },
    });

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  // ── Get Messages ──────────────────────────
  async findAll(
    userId: string,
    conversationId: string,
    cursor?: string,
    take = 30,
  ) {
    const member = await this.prisma.conversationMember.findFirst({
      where: { userId, conversationId, leftAt: null },
    });
    if (!member) throw new ForbiddenException('You are not in this conversation');

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { displayName: true } },
          },
        },
        media: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const nextCursor =
      messages.length === take ? messages[messages.length - 1].id : null;

    return {
      messages: messages.reverse(),
      nextCursor,
    };
  }

  // ── Update Message ────────────────────────
  async update(
    userId: string,
    messageId: string,
    dto: UpdateMessageDto,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('You can only edit your own messages');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content, updatedAt: new Date() },
    });
  }

  // ── Delete Message ────────────────────────
  async delete(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('You can only delete your own messages');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  // ── Mark As Read ──────────────────────────
  async markAsRead(userId: string, conversationId: string) {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'READ' },
        deletedAt: null,
      },
      data: { status: 'READ' },
    });
  }

  // ── Search Messages ───────────────────────
  async search(userId: string, conversationId: string, query: string) {
    const member = await this.prisma.conversationMember.findFirst({
      where: { userId, conversationId, leftAt: null },
    });
    if (!member) throw new ForbiddenException('You are not in this conversation');

    return this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
