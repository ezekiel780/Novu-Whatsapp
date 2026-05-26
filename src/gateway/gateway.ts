import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { GlobalWsExceptionFilter } from '../filters/ws-exception.filter';

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class NovuGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NovuGateway');
  private connectedUsers = new Map<string, string>();

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Init ──────────────────────────────────
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  // ── Connection ────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);

      await this.usersService.updatePresence(payload.sub, true);

      client.broadcast.emit('presence:update', {
        userId: payload.sub,
        isOnline: true,
      });

      this.logger.log(`Client connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  // ── Disconnection ─────────────────────────
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    this.connectedUsers.delete(userId);

    await this.usersService.updatePresence(userId, false);

    client.broadcast.emit('presence:update', {
      userId,
      isOnline: false,
      lastSeen: new Date(),
    });

    this.logger.log(`Client disconnected: ${userId}`);
  }

  // ── Join Conversation Room ─────────────────
  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
    this.logger.log(`User ${client.data.userId} joined room ${conversationId}`);
  }

  // ── Leave Conversation Room ────────────────
  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId);
    this.logger.log(`User ${client.data.userId} left room ${conversationId}`);
  }

// ── Send Message ──────────────────────────
@SubscribeMessage('message:send')
async handleSendMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() dto: CreateMessageDto,
) {
  try {
    const message = await this.messagesService.create(
      client.data.userId,
      dto,
    );
    this.server.to(dto.conversationId).emit('message:new', message);
    return { status: 'ok', message };
  } catch (error: any) {                    // ← add : any
    return { status: 'error', message: error.message };
  }
}
  // ── Message Delivered ─────────────────────
  @SubscribeMessage('message:delivered')
  handleMessageDelivered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    this.server.to(data.conversationId).emit('message:delivered', {
      messageId: data.messageId,
      userId: client.data.userId,
    });
  }

  // ── Message Read ──────────────────────────
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.messagesService.markAsRead(
      client.data.userId,
      data.conversationId,
    );
    this.server.to(data.conversationId).emit('message:read', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  // ── Typing Start ──────────────────────────
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.to(data.conversationId).emit('typing:start', {
      userId: client.data.userId,
      conversationId: data.conversationId,
    });
  }

  // ── Typing Stop ───────────────────────────
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.to(data.conversationId).emit('typing:stop', {
      userId: client.data.userId,
      conversationId: data.conversationId,
    });
  }

  // ── Call Invite ───────────────────────────
  @SubscribeMessage('call:invite')
  handleCallInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; type: string; offer: any },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (!receiverSocketId) {
      return { status: 'error', message: 'User is offline' };
    }
    this.server.to(receiverSocketId).emit('call:incoming', {
      callerId: client.data.userId,
      type: data.type,
      offer: data.offer,
    });
    return { status: 'ok' };
  }

  // ── Call Accept ───────────────────────────
  @SubscribeMessage('call:accept')
  handleCallAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: string; answer: any },
  ) {
    const callerSocketId = this.connectedUsers.get(data.callerId);
    if (!callerSocketId) return;
    this.server.to(callerSocketId).emit('call:accepted', {
      userId: client.data.userId,
      answer: data.answer,
    });
  }

  // ── Call Decline ──────────────────────────
  @SubscribeMessage('call:decline')
  handleCallDecline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: string },
  ) {
    const callerSocketId = this.connectedUsers.get(data.callerId);
    if (!callerSocketId) return;
    this.server.to(callerSocketId).emit('call:declined', {
      userId: client.data.userId,
    });
  }

  // ── Call End ──────────────────────────────
  @SubscribeMessage('call:end')
  handleCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (!receiverSocketId) return;
    this.server.to(receiverSocketId).emit('call:ended', {
      userId: client.data.userId,
    });
  }

  // ── ICE Candidate ─────────────────────────
  @SubscribeMessage('call:ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; candidate: any },
  ) {
    const targetSocketId = this.connectedUsers.get(data.targetId);
    if (!targetSocketId) return;
    this.server.to(targetSocketId).emit('call:ice-candidate', {
      userId: client.data.userId,
      candidate: data.candidate,
    });
  }

  // ── Emit To Specific User ─────────────────
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
