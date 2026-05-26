import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class GlobalWsExceptionFilter extends BaseWsExceptionFilter {
  private logger = new Logger('GlobalWsExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    let message = 'WebSocket error occurred';

    if (exception instanceof WsException) {
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(`WebSocket error — ${message}`);

    client.emit('error', {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
