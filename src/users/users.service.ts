import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ── Get Current User ──────────────────────
  async getMe(userId: string) {
    // Check cache first
    const cached = await this.redis.getCachedUser(userId);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        phoneNumber: true,
        fcmToken: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Cache for 5 minutes
    await this.redis.cacheUser(userId, user);
    return user;
  }

  // ── Update Profile ────────────────────────
  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        status: true,
        phoneNumber: true,
        fcmToken: true,
        updatedAt: true,
      },
    });

    // Invalidate cache after update
    await this.redis.invalidateUser(userId);
    return user;
  }

  // ── Search Users ──────────────────────────
  async searchUsers(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          { deletedAt: null },
          {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 20,
    });
  }

  // ── Get User By ID ────────────────────────
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        status: true,
        isOnline: true,
        lastSeen: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ── Update Presence ───────────────────────
  async updatePresence(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isOnline, lastSeen: new Date() },
    });
  }

  // ── Delete Account ────────────────────────
  async deleteMe(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    await this.redis.invalidateUser(userId);
    return { message: 'Account deleted successfully' };
  }
}
