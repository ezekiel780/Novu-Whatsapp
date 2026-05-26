import { Module } from '@nestjs/common';
import { NovuGateway } from './gateway';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MessagesModule, UsersModule, AuthModule],
  providers: [NovuGateway],
  exports: [NovuGateway],
})
export class GatewayModule {}
