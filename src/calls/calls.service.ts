import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class CallsService {
  constructor(private prisma: PrismaService) {}

  // ── Initiate Call ─────────────────────────
  async create(userId: string, dto: CreateCallDto) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const call = await this.prisma.call.create({
      data: {
        callerId: userId,
        receiverId: dto.receiverId,
        type: dto.type,
        status: 'ONGOING',
      },
      include: {
        caller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return call;
  }

  // ── Update Call Status ────────────────────
  async update(userId: string, callId: string, dto: UpdateCallDto) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) throw new NotFoundException('Call not found');

    if (call.callerId !== userId && call.receiverId !== userId)
      throw new ForbiddenException('You are not part of this call');

    const endedAt =
      dto.status === 'COMPLETED' ||
      dto.status === 'MISSED' ||
      dto.status === 'DECLINED'
        ? new Date()
        : null;

    const duration =
      endedAt && call.startedAt
        ? Math.floor(
            (endedAt.getTime() - call.startedAt.getTime()) / 1000,
          )
        : null;

    return this.prisma.call.update({
      where: { id: callId },
      data: {
        status: dto.status,
        endedAt,
        duration,
      },
    });
  }

  // ── Get Call History ──────────────────────
  async getHistory(userId: string, cursor?: string, take = 20) {
    const calls = await this.prisma.call.findMany({
      where: {
        OR: [
          { callerId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        caller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const nextCursor =
      calls.length === take ? calls[calls.length - 1].id : null;

    return { calls, nextCursor };
  }

  async findOne(userId: string, callId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!call) throw new NotFoundException('Call not found');
    if (call.callerId !== userId && call.receiverId !== userId)
      throw new ForbiddenException('You are not part of this call');

    return call;
  }

  async getMissedCalls(userId: string) {
    return this.prisma.call.findMany({
      where: {
        receiverId: userId,
        status: 'MISSED',
      },
      include: {
        caller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}
