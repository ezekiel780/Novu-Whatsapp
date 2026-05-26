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
import { Injectable, BadRequestException, NotFoundException, } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
let MediaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MediaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        config;
        s3;
        bucket;
        constructor(prisma, config) {
            this.prisma = prisma;
            this.config = config;
            this.s3 = new S3Client({
                region: this.config.get('AWS_REGION'),
                credentials: {
                    accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
                    secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
                },
            });
            this.bucket = this.config.get('AWS_S3_BUCKET');
        }
        // ── Upload File ───────────────────────────
        async uploadFile(userId, file, messageId) {
            this.validateFile(file);
            const key = `uploads/${userId}/${uuidv4()}-${file.originalname}`;
            await this.s3.send(new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
            const fileUrl = `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}`;
            const media = await this.prisma.media.create({
                data: {
                    uploadedBy: userId,
                    fileUrl,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileName: file.originalname,
                    messageId: messageId ?? null,
                },
            });
            return media;
        }
        // ── Get Signed URL ────────────────────────
        async getSignedUrl(userId, fileName, fileType) {
            const key = `uploads/${userId}/${uuidv4()}-${fileName}`;
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: fileType,
            });
            const signedUrl = await getSignedUrl(this.s3, command, {
                expiresIn: 300,
            });
            return { signedUrl, key, fileUrl: `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}` };
        }
        // ── Get Media By Message ──────────────────
        async getMediaByMessage(messageId) {
            return this.prisma.media.findMany({
                where: { messageId },
                orderBy: { createdAt: 'desc' },
            });
        }
        // ── Get My Media ──────────────────────────
        async getMyMedia(userId) {
            return this.prisma.media.findMany({
                where: { uploadedBy: userId },
                orderBy: { createdAt: 'desc' },
            });
        }
        // ── Delete Media ──────────────────────────
        async deleteMedia(userId, mediaId) {
            const media = await this.prisma.media.findUnique({
                where: { id: mediaId },
            });
            if (!media)
                throw new NotFoundException('Media not found');
            if (media.uploadedBy !== userId)
                throw new BadRequestException('You can only delete your own media');
            const key = media.fileUrl.split('.amazonaws.com/')[1];
            await this.s3.send(new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            await this.prisma.media.delete({ where: { id: mediaId } });
            return { message: 'Media deleted successfully' };
        }
        // ── Validate File ─────────────────────────
        validateFile(file) {
            const maxSize = 100 * 1024 * 1024; // 100MB
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/webm',
                'audio/mpeg',
                'audio/wav',
                'audio/ogg',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (file.size > maxSize)
                throw new BadRequestException('File size exceeds 100MB limit');
            if (!allowedTypes.includes(file.mimetype))
                throw new BadRequestException('File type not supported');
        }
    };
    return MediaService = _classThis;
})();
export { MediaService };
