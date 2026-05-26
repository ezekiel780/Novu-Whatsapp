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
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, } from '@nestjs/common';
import { ConversationType } from '@prisma/client';
let ConversationsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConversationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConversationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ── Create Conversation ───────────────────
        async create(userId, dto) {
            if (dto.type === ConversationType.DM) {
                if (dto.memberIds.length !== 1)
                    throw new BadRequestException('DM requires exactly one other member');
                const existing = await this.prisma.conversation.findFirst({
                    where: {
                        type: ConversationType.DM,
                        AND: [
                            { members: { some: { userId } } },
                            { members: { some: { userId: dto.memberIds[0] } } },
                        ],
                    },
                });
                if (existing)
                    return existing;
            }
            return this.prisma.conversation.create({
                data: {
                    type: dto.type,
                    name: dto.name,
                    description: dto.description,
                    avatarUrl: dto.avatarUrl,
                    members: {
                        create: [
                            { userId, role: 'ADMIN' },
                            ...dto.memberIds.map((id) => ({ userId: id, role: 'MEMBER' })),
                        ],
                    },
                },
                include: {
                    members: { include: { user: true } },
                },
            });
        }
        // ── Get All Conversations ─────────────────
        async findAll(userId) {
            return this.prisma.conversation.findMany({
                where: {
                    deletedAt: null,
                    members: { some: { userId, leftAt: null } },
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    displayName: true,
                                    avatarUrl: true,
                                    isOnline: true,
                                    lastSeen: true,
                                },
                            },
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: { sender: { select: { displayName: true } } },
                    },
                },
                orderBy: { updatedAt: 'desc' },
            });
        }
        // ── Get Single Conversation ───────────────
        async findOne(userId, conversationId) {
            const conversation = await this.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    deletedAt: null,
                    members: { some: { userId, leftAt: null } },
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    displayName: true,
                                    avatarUrl: true,
                                    isOnline: true,
                                    lastSeen: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!conversation)
                throw new NotFoundException('Conversation not found');
            return conversation;
        }
        // ── Update Conversation ───────────────────
        async update(userId, conversationId, dto) {
            await this.isAdmin(userId, conversationId);
            return this.prisma.conversation.update({
                where: { id: conversationId },
                data: { ...dto },
            });
        }
        // ── Add Member ────────────────────────────
        async addMember(userId, conversationId, memberId) {
            await this.isAdmin(userId, conversationId);
            return this.prisma.conversationMember.create({
                data: { conversationId, userId: memberId, role: 'MEMBER' },
            });
        }
        // ── Remove Member ─────────────────────────
        async removeMember(userId, conversationId, memberId) {
            await this.isAdmin(userId, conversationId);
            return this.prisma.conversationMember.updateMany({
                where: { conversationId, userId: memberId },
                data: { leftAt: new Date() },
            });
        }
        // ── Leave Conversation ────────────────────
        async leave(userId, conversationId) {
            return this.prisma.conversationMember.updateMany({
                where: { conversationId, userId },
                data: { leftAt: new Date() },
            });
        }
        // ── Delete Conversation ───────────────────
        async delete(userId, conversationId) {
            await this.isAdmin(userId, conversationId);
            return this.prisma.conversation.update({
                where: { id: conversationId },
                data: { deletedAt: new Date() },
            });
        }
        // ── Helper: Check Admin ───────────────────
        async isAdmin(userId, conversationId) {
            const member = await this.prisma.conversationMember.findFirst({
                where: { userId, conversationId, role: 'ADMIN', leftAt: null },
            });
            if (!member)
                throw new ForbiddenException('Only admins can do this');
            return member;
        }
    };
    return ConversationsService = _classThis;
})();
export { ConversationsService };
