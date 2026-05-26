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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
let MessagesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MessagesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MessagesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ── Send Message ──────────────────────────
        async create(userId, dto) {
            const member = await this.prisma.conversationMember.findFirst({
                where: {
                    userId,
                    conversationId: dto.conversationId,
                    leftAt: null,
                },
            });
            if (!member)
                throw new ForbiddenException('You are not in this conversation');
            const message = await this.prisma.message.create({
                data: {
                    conversationId: dto.conversationId,
                    senderId: userId,
                    content: dto.content,
                    messageType: dto.messageType ?? 'TEXT',
                    replyToId: dto.replyToId,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    replyTo: {
                        select: {
                            id: true,
                            content: true,
                            sender: {
                                select: { displayName: true },
                            },
                        },
                    },
                    media: true,
                },
            });
            // Update conversation updatedAt
            await this.prisma.conversation.update({
                where: { id: dto.conversationId },
                data: { updatedAt: new Date() },
            });
            return message;
        }
        // ── Get Messages ──────────────────────────
        async findAll(userId, conversationId, cursor, take = 30) {
            const member = await this.prisma.conversationMember.findFirst({
                where: { userId, conversationId, leftAt: null },
            });
            if (!member)
                throw new ForbiddenException('You are not in this conversation');
            const messages = await this.prisma.message.findMany({
                where: {
                    conversationId,
                    deletedAt: null,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    replyTo: {
                        select: {
                            id: true,
                            content: true,
                            sender: { select: { displayName: true } },
                        },
                    },
                    media: true,
                },
                orderBy: { createdAt: 'desc' },
                take,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
            });
            const nextCursor = messages.length === take ? messages[messages.length - 1].id : null;
            return {
                messages: messages.reverse(),
                nextCursor,
            };
        }
        // ── Update Message ────────────────────────
        async update(userId, messageId, dto) {
            const message = await this.prisma.message.findUnique({
                where: { id: messageId },
            });
            if (!message)
                throw new NotFoundException('Message not found');
            if (message.senderId !== userId)
                throw new ForbiddenException('You can only edit your own messages');
            return this.prisma.message.update({
                where: { id: messageId },
                data: { content: dto.content, updatedAt: new Date() },
            });
        }
        // ── Delete Message ────────────────────────
        async delete(userId, messageId) {
            const message = await this.prisma.message.findUnique({
                where: { id: messageId },
            });
            if (!message)
                throw new NotFoundException('Message not found');
            if (message.senderId !== userId)
                throw new ForbiddenException('You can only delete your own messages');
            return this.prisma.message.update({
                where: { id: messageId },
                data: { deletedAt: new Date() },
            });
        }
        // ── Mark As Read ──────────────────────────
        async markAsRead(userId, conversationId) {
            return this.prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    status: { not: 'READ' },
                    deletedAt: null,
                },
                data: { status: 'READ' },
            });
        }
        // ── Search Messages ───────────────────────
        async search(userId, conversationId, query) {
            const member = await this.prisma.conversationMember.findFirst({
                where: { userId, conversationId, leftAt: null },
            });
            if (!member)
                throw new ForbiddenException('You are not in this conversation');
            return this.prisma.message.findMany({
                where: {
                    conversationId,
                    deletedAt: null,
                    content: { contains: query, mode: 'insensitive' },
                },
                include: {
                    sender: {
                        select: { id: true, displayName: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
        }
    };
    return MessagesService = _classThis;
})();
export { MessagesService };
