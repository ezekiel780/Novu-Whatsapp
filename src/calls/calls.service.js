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
let CallsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CallsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CallsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ── Initiate Call ─────────────────────────
        async create(userId, dto) {
            const receiver = await this.prisma.user.findUnique({
                where: { id: dto.receiverId },
            });
            if (!receiver)
                throw new NotFoundException('Receiver not found');
            const call = await this.prisma.call.create({
                data: {
                    callerId: userId,
                    receiverId: dto.receiverId,
                    type: dto.type,
                    status: 'ONGOING',
                },
                include: {
                    caller: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return call;
        }
        // ── Update Call Status ────────────────────
        async update(userId, callId, dto) {
            const call = await this.prisma.call.findUnique({
                where: { id: callId },
            });
            if (!call)
                throw new NotFoundException('Call not found');
            if (call.callerId !== userId && call.receiverId !== userId)
                throw new ForbiddenException('You are not part of this call');
            const endedAt = dto.status === 'COMPLETED' ||
                dto.status === 'MISSED' ||
                dto.status === 'DECLINED'
                ? new Date()
                : null;
            const duration = endedAt && call.startedAt
                ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
                : null;
            return this.prisma.call.update({
                where: { id: callId },
                data: {
                    status: dto.status,
                    endedAt,
                    duration,
                },
            });
        }
        // ── Get Call History ──────────────────────
        async getHistory(userId, cursor, take = 20) {
            const calls = await this.prisma.call.findMany({
                where: {
                    OR: [
                        { callerId: userId },
                        { receiverId: userId },
                    ],
                },
                include: {
                    caller: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { startedAt: 'desc' },
                take,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
            });
            const nextCursor = calls.length === take ? calls[calls.length - 1].id : null;
            return { calls, nextCursor };
        }
        async findOne(userId, callId) {
            const call = await this.prisma.call.findUnique({
                where: { id: callId },
                include: {
                    caller: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            if (!call)
                throw new NotFoundException('Call not found');
            if (call.callerId !== userId && call.receiverId !== userId)
                throw new ForbiddenException('You are not part of this call');
            return call;
        }
        async getMissedCalls(userId) {
            return this.prisma.call.findMany({
                where: {
                    receiverId: userId,
                    status: 'MISSED',
                },
                include: {
                    caller: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { startedAt: 'desc' },
                take: 20,
            });
        }
    };
    return CallsService = _classThis;
})();
export { CallsService };
