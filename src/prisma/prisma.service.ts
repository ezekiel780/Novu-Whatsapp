import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  constructor() {
    const shouldLogQueries = process.env.PRISMA_LOG_QUERIES === 'true';
    const prismaLogs: ('query' | 'info' | 'warn' | 'error')[] = shouldLogQueries
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'];

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: prismaLogs,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to database successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    return this.$transaction([
      this.notification.deleteMany(),
      this.call.deleteMany(),
      this.media.deleteMany(),
      this.message.deleteMany(),
      this.conversationMember.deleteMany(),
      this.conversation.deleteMany(),
      this.refreshToken.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
