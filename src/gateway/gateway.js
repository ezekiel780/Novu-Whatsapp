var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { WebSocketGateway, WebSocketServer, SubscribeMessage, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
let NovuGateway = (() => {
    let _classDecorators = [WebSocketGateway({
            cors: {
                origin: '*',
                credentials: true,
            },
            namespace: '/',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handleJoinConversation_decorators;
    let _handleLeaveConversation_decorators;
    let _handleSendMessage_decorators;
    let _handleMessageDelivered_decorators;
    let _handleMessageRead_decorators;
    let _handleTypingStart_decorators;
    let _handleTypingStop_decorators;
    let _handleCallInvite_decorators;
    let _handleCallAccept_decorators;
    let _handleCallDecline_decorators;
    let _handleCallEnd_decorators;
    let _handleIceCandidate_decorators;
    var NovuGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _server_decorators = [WebSocketServer()];
            _handleJoinConversation_decorators = [SubscribeMessage('conversation:join')];
            _handleLeaveConversation_decorators = [SubscribeMessage('conversation:leave')];
            _handleSendMessage_decorators = [SubscribeMessage('message:send')];
            _handleMessageDelivered_decorators = [SubscribeMessage('message:delivered')];
            _handleMessageRead_decorators = [SubscribeMessage('message:read')];
            _handleTypingStart_decorators = [SubscribeMessage('typing:start')];
            _handleTypingStop_decorators = [SubscribeMessage('typing:stop')];
            _handleCallInvite_decorators = [SubscribeMessage('call:invite')];
            _handleCallAccept_decorators = [SubscribeMessage('call:accept')];
            _handleCallDecline_decorators = [SubscribeMessage('call:decline')];
            _handleCallEnd_decorators = [SubscribeMessage('call:end')];
            _handleIceCandidate_decorators = [SubscribeMessage('call:ice-candidate')];
            __esDecorate(this, null, _handleJoinConversation_decorators, { kind: "method", name: "handleJoinConversation", static: false, private: false, access: { has: obj => "handleJoinConversation" in obj, get: obj => obj.handleJoinConversation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleLeaveConversation_decorators, { kind: "method", name: "handleLeaveConversation", static: false, private: false, access: { has: obj => "handleLeaveConversation" in obj, get: obj => obj.handleLeaveConversation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleSendMessage_decorators, { kind: "method", name: "handleSendMessage", static: false, private: false, access: { has: obj => "handleSendMessage" in obj, get: obj => obj.handleSendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleMessageDelivered_decorators, { kind: "method", name: "handleMessageDelivered", static: false, private: false, access: { has: obj => "handleMessageDelivered" in obj, get: obj => obj.handleMessageDelivered }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleMessageRead_decorators, { kind: "method", name: "handleMessageRead", static: false, private: false, access: { has: obj => "handleMessageRead" in obj, get: obj => obj.handleMessageRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleTypingStart_decorators, { kind: "method", name: "handleTypingStart", static: false, private: false, access: { has: obj => "handleTypingStart" in obj, get: obj => obj.handleTypingStart }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleTypingStop_decorators, { kind: "method", name: "handleTypingStop", static: false, private: false, access: { has: obj => "handleTypingStop" in obj, get: obj => obj.handleTypingStop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallInvite_decorators, { kind: "method", name: "handleCallInvite", static: false, private: false, access: { has: obj => "handleCallInvite" in obj, get: obj => obj.handleCallInvite }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallAccept_decorators, { kind: "method", name: "handleCallAccept", static: false, private: false, access: { has: obj => "handleCallAccept" in obj, get: obj => obj.handleCallAccept }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallDecline_decorators, { kind: "method", name: "handleCallDecline", static: false, private: false, access: { has: obj => "handleCallDecline" in obj, get: obj => obj.handleCallDecline }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleCallEnd_decorators, { kind: "method", name: "handleCallEnd", static: false, private: false, access: { has: obj => "handleCallEnd" in obj, get: obj => obj.handleCallEnd }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleIceCandidate_decorators, { kind: "method", name: "handleIceCandidate", static: false, private: false, access: { has: obj => "handleIceCandidate" in obj, get: obj => obj.handleIceCandidate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NovuGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        messagesService = __runInitializers(this, _instanceExtraInitializers);
        usersService;
        jwt;
        config;
        server = __runInitializers(this, _server_initializers, void 0);
        logger = (__runInitializers(this, _server_extraInitializers), new Logger('NovuGateway'));
        connectedUsers = new Map(); // userId → socketId
        constructor(messagesService, usersService, jwt, config) {
            this.messagesService = messagesService;
            this.usersService = usersService;
            this.jwt = jwt;
            this.config = config;
        }
        // ── Init ──────────────────────────────────
        afterInit() {
            this.logger.log('WebSocket Gateway initialized');
        }
        // ── Connection ────────────────────────────
        async handleConnection(client) {
            try {
                const token = client.handshake.auth?.token ||
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
                // Update user presence to online
                await this.usersService.updatePresence(payload.sub, true);
                // Notify others that user is online
                client.broadcast.emit('presence:update', {
                    userId: payload.sub,
                    isOnline: true,
                });
                this.logger.log(`Client connected: ${payload.sub}`);
            }
            catch {
                client.disconnect();
            }
        }
        // ── Disconnection ─────────────────────────
        async handleDisconnect(client) {
            const userId = client.data.userId;
            if (!userId)
                return;
            this.connectedUsers.delete(userId);
            // Update user presence to offline
            await this.usersService.updatePresence(userId, false);
            // Notify others that user is offline
            client.broadcast.emit('presence:update', {
                userId,
                isOnline: false,
                lastSeen: new Date(),
            });
            this.logger.log(`Client disconnected: ${userId}`);
        }
        // ── Join Conversation Room ─────────────────
        handleJoinConversation(client, conversationId) {
            client.join(conversationId);
            this.logger.log(`User ${client.data.userId} joined room ${conversationId}`);
        }
        // ── Leave Conversation Room ────────────────
        handleLeaveConversation(client, conversationId) {
            client.leave(conversationId);
            this.logger.log(`User ${client.data.userId} left room ${conversationId}`);
        }
        // ── Send Message ──────────────────────────
        async handleSendMessage(client, dto) {
            try {
                const message = await this.messagesService.create(client.data.userId, dto);
                // Emit to everyone in the conversation room
                this.server.to(dto.conversationId).emit('message:new', message);
                // Return to sender
                return { status: 'ok', message };
            }
            catch (error) {
                return { status: 'error', message: error.message };
            }
        }
        // ── Message Delivered ─────────────────────
        async handleMessageDelivered(client, data) {
            this.server.to(data.conversationId).emit('message:delivered', {
                messageId: data.messageId,
                userId: client.data.userId,
            });
        }
        // ── Message Read ──────────────────────────
        async handleMessageRead(client, data) {
            await this.messagesService.markAsRead(client.data.userId, data.conversationId);
            this.server.to(data.conversationId).emit('message:read', {
                conversationId: data.conversationId,
                userId: client.data.userId,
            });
        }
        handleTypingStart(client, data) {
            client.to(data.conversationId).emit('typing:start', {
                userId: client.data.userId,
                conversationId: data.conversationId,
            });
        }
        handleTypingStop(client, data) {
            client.to(data.conversationId).emit('typing:stop', {
                userId: client.data.userId,
                conversationId: data.conversationId,
            });
        }
        handleCallInvite(client, data) {
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
        handleCallAccept(client, data) {
            const callerSocketId = this.connectedUsers.get(data.callerId);
            if (!callerSocketId)
                return;
            this.server.to(callerSocketId).emit('call:accepted', {
                userId: client.data.userId,
                answer: data.answer,
            });
        }
        handleCallDecline(client, data) {
            const callerSocketId = this.connectedUsers.get(data.callerId);
            if (!callerSocketId)
                return;
            this.server.to(callerSocketId).emit('call:declined', {
                userId: client.data.userId,
            });
        }
        handleCallEnd(client, data) {
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (!receiverSocketId)
                return;
            this.server.to(receiverSocketId).emit('call:ended', {
                userId: client.data.userId,
            });
        }
        handleIceCandidate(client, data) {
            const targetSocketId = this.connectedUsers.get(data.targetId);
            if (!targetSocketId)
                return;
            this.server.to(targetSocketId).emit('call:ice-candidate', {
                userId: client.data.userId,
                candidate: data.candidate,
            });
        }
        emitToUser(userId, event, data) {
            const socketId = this.connectedUsers.get(userId);
            if (socketId) {
                this.server.to(socketId).emit(event, data);
            }
        }
    };
    return NovuGateway = _classThis;
})();
export { NovuGateway };
