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
import { Injectable, NotFoundException } from '@nestjs/common';
let UsersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ── Get Current User ──────────────────────
        async getMe(userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                    status: true,
                    isOnline: true,
                    lastSeen: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                },
            });
            if (!user)
                throw new NotFoundException('User not found');
            return user;
        }
        // ── Update Profile ────────────────────────
        async updateMe(userId, dto) {
            return this.prisma.user.update({
                where: { id: userId },
                data: { ...dto },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                    status: true,
                    phoneNumber: true,
                    updatedAt: true,
                },
            });
        }
        // ── Search Users ──────────────────────────
        async searchUsers(query, currentUserId) {
            return this.prisma.user.findMany({
                where: {
                    AND: [
                        { id: { not: currentUserId } },
                        { deletedAt: null },
                        {
                            OR: [
                                { displayName: { contains: query, mode: 'insensitive' } },
                                { email: { contains: query, mode: 'insensitive' } },
                            ],
                        },
                    ],
                },
                select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    isOnline: true,
                    lastSeen: true,
                },
                take: 20,
            });
        }
        // ── Get User By ID ────────────────────────
        async getUserById(userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                    status: true,
                    isOnline: true,
                    lastSeen: true,
                },
            });
            if (!user)
                throw new NotFoundException('User not found');
            return user;
        }
        // ── Update Presence ───────────────────────
        async updatePresence(userId, isOnline) {
            return this.prisma.user.update({
                where: { id: userId },
                data: { isOnline, lastSeen: new Date() },
            });
        }
        // ── Delete Account ────────────────────────
        async deleteMe(userId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { deletedAt: new Date() },
            });
            return { message: 'Account deleted successfully' };
        }
    };
    return UsersService = _classThis;
})();
export { UsersService };
