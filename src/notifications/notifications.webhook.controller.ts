import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('WhatsApp Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  // ── Verify Webhook ────────────────────────
  @Get('whatsapp')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (
      mode === 'subscribe' &&
      token === this.config.get('WHATSAPP_VERIFY_TOKEN')
    ) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // ── Receive Webhook ───────────────────────
  @Post('whatsapp')
  async receiveWebhook(@Body() body: any) {
    await this.notificationsService.handleWhatsAppWebhook(body);
    return { status: 'ok' };
  }
}
