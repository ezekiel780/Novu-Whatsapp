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
import { Injectable, ConflictException, UnauthorizedException, BadRequestException, } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwt;
        config;
        constructor(prisma, jwt, config) {
            this.prisma = prisma;
            this.jwt = jwt;
            this.config = config;
        }
        // ── Register ──────────────────────────────
        async register(dto) {
            const exists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (exists)
                throw new ConflictException('Email already in use');
            const hashed = await bcrypt.hash(dto.password, 12);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashed,
                    displayName: dto.displayName,
                    phoneNumber: dto.phoneNumber,
                },
            });
            const tokens = await this.generateTokens(user.id, user.email);
            return { user: this.exclude(user, ['password']), ...tokens };
        }
        // ── Login ─────────────────────────────────
        async login(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user || user.deletedAt)
                throw new UnauthorizedException('Invalid credentials');
            const valid = await bcrypt.compare(dto.password, user.password);
            if (!valid)
                throw new UnauthorizedException('Invalid credentials');
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isOnline: true, lastSeen: new Date() },
            });
            const tokens = await this.generateTokens(user.id, user.email);
            return { user: this.exclude(user, ['password']), ...tokens };
        }
        // ── Refresh Token ─────────────────────────
        async refreshToken(token) {
            const stored = await this.prisma.refreshToken.findUnique({
                where: { token },
                include: { user: true },
            });
            if (!stored || stored.expiresAt < new Date())
                throw new UnauthorizedException('Invalid or expired refresh token');
            await this.prisma.refreshToken.delete({ where: { token } });
            const tokens = await this.generateTokens(stored.user.id, stored.user.email);
            return tokens;
        }
        // ── Logout ────────────────────────────────
        async logout(userId, token) {
            await this.prisma.refreshToken.deleteMany({ where: { token } });
            await this.prisma.user.update({
                where: { id: userId },
                data: { isOnline: false, lastSeen: new Date() },
            });
            return { message: 'Logged out successfully' };
        }
        // ── Forgot Password ───────────────────────
        async forgotPassword(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user)
                return { message: 'If that email exists, an OTP was sent' };
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashed = await bcrypt.hash(otp, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { status: `otp:${hashed}` },
            });
            // TODO: Send OTP via email service
            console.log(`OTP for ${user.email}: ${otp}`);
            return { message: 'If that email exists, an OTP was sent' };
        }
        // ── Reset Password ────────────────────────
        async resetPassword(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user || !user.status?.startsWith('otp:'))
                throw new BadRequestException('Invalid or expired OTP');
            const storedHash = user.status.replace('otp:', '');
            const valid = await bcrypt.compare(dto.otp, storedHash);
            if (!valid)
                throw new BadRequestException('Invalid OTP');
            const hashed = await bcrypt.hash(dto.newPassword, 12);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashed, status: null },
            });
            return { message: 'Password reset successfully' };
        }
        // ── Helpers ───────────────────────────────
        async generateTokens(userId, email) {
            const [accessToken, refreshToken] = await Promise.all([
                this.jwt.signAsync({ sub: userId, email }, {
                    secret: this.config.get('JWT_SECRET'),
                    expiresIn: this.config.get('JWT_EXPIRES_IN'),
                }),
                this.jwt.signAsync({ sub: userId, email }, {
                    secret: this.config.get('JWT_REFRESH_SECRET'),
                    expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
                }),
            ]);
            await this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            return { accessToken, refreshToken };
        }
        exclude(obj, keys) {
            return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
        }
    };
    return AuthService = _classThis;
})();
export { AuthService };
