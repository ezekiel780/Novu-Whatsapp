import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get('REDIS_URL');

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      tls: redisUrl?.startsWith('rediss://') ? {} : undefined,
    });

    this.client.on('connect', () =>
      console.log('Redis connected successfully'),
    );

    this.client.on('error', (err) =>
      console.error('Redis connection error:', err),
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('Redis disconnected');
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    await this.client.set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds,
    );
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async delByPattern(pattern: string) {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async setForever(key: string, value: any) {
    await this.client.set(key, JSON.stringify(value));
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number) {
    await this.client.expire(key, ttlSeconds);
  }

  async setOnline(userId: string) {
    await this.client.set(`presence:${userId}`, '1', 'EX', 60);
  }

  async isOnline(userId: string): Promise<boolean> {
    const result = await this.client.exists(`presence:${userId}`);
    return result === 1;
  }

  async setOffline(userId: string) {
    await this.client.del(`presence:${userId}`);
  }

  async refreshPresence(userId: string) {
    await this.client.expire(`presence:${userId}`, 60);
  }

  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const current = await this.client.incr(key);
    if (current === 1) await this.client.expire(key, windowSeconds);
    return current <= limit;
  }

  async cacheUser(userId: string, data: any) {
    await this.set(`user:${userId}`, data, 300);
  }

  async getCachedUser<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:${userId}`);
  }

  async invalidateUser(userId: string) {
    await this.del(`user:${userId}`);
  }

  async cacheConversation(conversationId: string, data: any) {
    await this.set(`conversation:${conversationId}`, data, 120);
  }

  async getCachedConversation<T>(conversationId: string): Promise<T | null> {
    return this.get<T>(`conversation:${conversationId}`);
  }

  async invalidateConversation(conversationId: string) {
    await this.del(`conversation:${conversationId}`);
  }

  publisher(): Redis {
    return this.client;
  }

  subscriber(): Redis {
    return this.client.duplicate();
  }
}
