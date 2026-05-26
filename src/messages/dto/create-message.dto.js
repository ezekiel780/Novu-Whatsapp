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
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '@prisma/client';
let CreateMessageDto = (() => {
    let _conversationId_decorators;
    let _conversationId_initializers = [];
    let _conversationId_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _messageType_decorators;
    let _messageType_initializers = [];
    let _messageType_extraInitializers = [];
    let _replyToId_decorators;
    let _replyToId_initializers = [];
    let _replyToId_extraInitializers = [];
    return class CreateMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _conversationId_decorators = [IsString()];
            _content_decorators = [IsOptional(), IsString()];
            _messageType_decorators = [IsEnum(MessageType), IsOptional()];
            _replyToId_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _conversationId_decorators, { kind: "field", name: "conversationId", static: false, private: false, access: { has: obj => "conversationId" in obj, get: obj => obj.conversationId, set: (obj, value) => { obj.conversationId = value; } }, metadata: _metadata }, _conversationId_initializers, _conversationId_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _messageType_decorators, { kind: "field", name: "messageType", static: false, private: false, access: { has: obj => "messageType" in obj, get: obj => obj.messageType, set: (obj, value) => { obj.messageType = value; } }, metadata: _metadata }, _messageType_initializers, _messageType_extraInitializers);
            __esDecorate(null, null, _replyToId_decorators, { kind: "field", name: "replyToId", static: false, private: false, access: { has: obj => "replyToId" in obj, get: obj => obj.replyToId, set: (obj, value) => { obj.replyToId = value; } }, metadata: _metadata }, _replyToId_initializers, _replyToId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        conversationId = __runInitializers(this, _conversationId_initializers, void 0);
        content = (__runInitializers(this, _conversationId_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        messageType = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _messageType_initializers, void 0));
        replyToId = (__runInitializers(this, _messageType_extraInitializers), __runInitializers(this, _replyToId_initializers, void 0));
        constructor() {
            __runInitializers(this, _replyToId_extraInitializers);
        }
    };
})();
export { CreateMessageDto };
