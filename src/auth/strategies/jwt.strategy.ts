import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static extractAccessToken(req: any): string | null {
    if (!req) return null;

    const authHeader = req.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.trim()) {
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
      }
      return authHeader.trim();
    }

    const accessHeader = req.headers?.['access_token'] ?? req.headers?.['x-access-token'];
    if (typeof accessHeader === 'string' && accessHeader.trim()) {
      return accessHeader.trim();
    }
    if (Array.isArray(accessHeader) && accessHeader.length > 0) {
      return String(accessHeader[0]).trim();
    }

    if (typeof req.query?.access_token === 'string' && req.query.access_token.trim()) {
      return req.query.access_token.trim();
    }

    if (typeof req.body?.access_token === 'string' && req.body.access_token.trim()) {
      return req.body.access_token.trim();
    }

    return null;
  }

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractAccessToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    return user;
  }
}
