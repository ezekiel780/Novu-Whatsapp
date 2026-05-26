import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationType } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  // ── Create Conversation ───────────────────
  async create(userId: string, dto: CreateConversationDto) {
    if (dto.type === ConversationType.DM) {
      if (dto.memberIds.length !== 1)
        throw new BadRequestException('DM requires exactly one other member');

      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: ConversationType.DM,
          AND: [
            { members: { some: { userId } } },
            { members: { some: { userId: dto.memberIds[0] } } },
          ],
        },
      });
      if (existing) return existing;
    }

    return this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.name,
        description: dto.description,
        avatarUrl: dto.avatarUrl,
        members: {
          create: [
            { userId, role: 'ADMIN' },
            ...dto.memberIds.map((id) => ({ userId: id, role: 'MEMBER' as const })),
          ],
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });
  }

  // ── Get All Conversations ─────────────────
  async findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId, leftAt: null } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { displayName: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ── Get Single Conversation ───────────────
  async findOne(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        deletedAt: null,
        members: { some: { userId, leftAt: null } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  // ── Update Conversation ───────────────────
  async update(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ) {
    await this.isAdmin(userId, conversationId);
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { ...dto },
    });
  }

  // ── Add Member ────────────────────────────
  async addMember(userId: string, conversationId: string, memberId: string) {
    await this.isAdmin(userId, conversationId);
    return this.prisma.conversationMember.create({
      data: { conversationId, userId: memberId, role: 'MEMBER' },
    });
  }

  // ── Remove Member ─────────────────────────
  async removeMember(
    userId: string,
    conversationId: string,
    memberId: string,
  ) {
    await this.isAdmin(userId, conversationId);
    return this.prisma.conversationMember.updateMany({
      where: { conversationId, userId: memberId },
      data: { leftAt: new Date() },
    });
  }

  // ── Leave Conversation ────────────────────
  async leave(userId: string, conversationId: string) {
    return this.prisma.conversationMember.updateMany({
      where: { conversationId, userId },
      data: { leftAt: new Date() },
    });
  }

  // ── Delete Conversation ───────────────────
  async delete(userId: string, conversationId: string) {
    await this.isAdmin(userId, conversationId);
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date() },
    });
  }

  // ── Helper: Check Admin ───────────────────
  private async isAdmin(userId: string, conversationId: string) {
    const member = await this.prisma.conversationMember.findFirst({
      where: { userId, conversationId, role: 'ADMIN', leftAt: null },
    });
    if (!member) throw new ForbiddenException('Only admins can do this');
    return member;
  }
}
