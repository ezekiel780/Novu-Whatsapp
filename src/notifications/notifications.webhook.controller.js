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
import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
let WebhookController = (() => {
    let _classDecorators = [ApiTags('WhatsApp Webhook'), Controller('webhook')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _verifyWebhook_decorators;
    let _receiveWebhook_decorators;
    var WebhookController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _verifyWebhook_decorators = [Get('whatsapp')];
            _receiveWebhook_decorators = [Post('whatsapp')];
            __esDecorate(this, null, _verifyWebhook_decorators, { kind: "method", name: "verifyWebhook", static: false, private: false, access: { has: obj => "verifyWebhook" in obj, get: obj => obj.verifyWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _receiveWebhook_decorators, { kind: "method", name: "receiveWebhook", static: false, private: false, access: { has: obj => "receiveWebhook" in obj, get: obj => obj.receiveWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WebhookController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationsService = __runInitializers(this, _instanceExtraInitializers);
        config;
        constructor(notificationsService, config) {
            this.notificationsService = notificationsService;
            this.config = config;
        }
        // ── Verify Webhook ────────────────────────
        verifyWebhook(mode, token, challenge, res) {
            if (mode === 'subscribe' &&
                token === this.config.get('WHATSAPP_VERIFY_TOKEN')) {
                return res.status(200).send(challenge);
            }
            return res.status(403).send('Forbidden');
        }
        // ── Receive Webhook ───────────────────────
        async receiveWebhook(body) {
            await this.notificationsService.handleWhatsAppWebhook(body);
            return { status: 'ok' };
        }
    };
    return WebhookController = _classThis;
})();
export { WebhookController };
