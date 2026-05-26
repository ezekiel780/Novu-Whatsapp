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
import { Controller, Post, Get, Delete, UseGuards, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
let MediaController = (() => {
    let _classDecorators = [ApiTags('Media'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('media')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _uploadFile_decorators;
    let _getSignedUrl_decorators;
    let _getMyMedia_decorators;
    let _getMediaByMessage_decorators;
    let _deleteMedia_decorators;
    var MediaController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _uploadFile_decorators = [Post('upload'), ApiConsumes('multipart/form-data'), UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))];
            _getSignedUrl_decorators = [Post('signed-url')];
            _getMyMedia_decorators = [Get('me')];
            _getMediaByMessage_decorators = [Get('message/:messageId')];
            _deleteMedia_decorators = [Delete(':id')];
            __esDecorate(this, null, _uploadFile_decorators, { kind: "method", name: "uploadFile", static: false, private: false, access: { has: obj => "uploadFile" in obj, get: obj => obj.uploadFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSignedUrl_decorators, { kind: "method", name: "getSignedUrl", static: false, private: false, access: { has: obj => "getSignedUrl" in obj, get: obj => obj.getSignedUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMyMedia_decorators, { kind: "method", name: "getMyMedia", static: false, private: false, access: { has: obj => "getMyMedia" in obj, get: obj => obj.getMyMedia }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMediaByMessage_decorators, { kind: "method", name: "getMediaByMessage", static: false, private: false, access: { has: obj => "getMediaByMessage" in obj, get: obj => obj.getMediaByMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteMedia_decorators, { kind: "method", name: "deleteMedia", static: false, private: false, access: { has: obj => "deleteMedia" in obj, get: obj => obj.deleteMedia }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MediaController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mediaService = __runInitializers(this, _instanceExtraInitializers);
        constructor(mediaService) {
            this.mediaService = mediaService;
        }
        uploadFile(req, file, messageId) {
            return this.mediaService.uploadFile(req.user.id, file, messageId);
        }
        getSignedUrl(req, fileName, fileType) {
            return this.mediaService.getSignedUrl(req.user.id, fileName, fileType);
        }
        getMyMedia(req) {
            return this.mediaService.getMyMedia(req.user.id);
        }
        getMediaByMessage(messageId) {
            return this.mediaService.getMediaByMessage(messageId);
        }
        deleteMedia(req, id) {
            return this.mediaService.deleteMedia(req.user.id, id);
        }
    };
    return MediaController = _classThis;
})();
export { MediaController };
