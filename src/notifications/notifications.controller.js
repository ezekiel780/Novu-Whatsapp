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
import { Controller, Get, Patch, Delete, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let NotificationsController = (() => {
    let _classDecorators = [ApiTags('Notifications'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyNotifications_decorators;
    let _getUnreadCount_decorators;
    let _markAsRead_decorators;
    let _markAllAsRead_decorators;
    let _delete_decorators;
    var NotificationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMyNotifications_decorators = [Get()];
            _getUnreadCount_decorators = [Get('unread-count')];
            _markAsRead_decorators = [Patch(':id/read')];
            _markAllAsRead_decorators = [Patch('read-all')];
            _delete_decorators = [Delete(':id')];
            __esDecorate(this, null, _getMyNotifications_decorators, { kind: "method", name: "getMyNotifications", static: false, private: false, access: { has: obj => "getMyNotifications" in obj, get: obj => obj.getMyNotifications }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUnreadCount_decorators, { kind: "method", name: "getUnreadCount", static: false, private: false, access: { has: obj => "getUnreadCount" in obj, get: obj => obj.getUnreadCount }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: obj => "markAsRead" in obj, get: obj => obj.markAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAllAsRead_decorators, { kind: "method", name: "markAllAsRead", static: false, private: false, access: { has: obj => "markAllAsRead" in obj, get: obj => obj.markAllAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationsService = __runInitializers(this, _instanceExtraInitializers);
        config;
        constructor(notificationsService, config) {
            this.notificationsService = notificationsService;
            this.config = config;
        }
        getMyNotifications(req, cursor, take) {
            return this.notificationsService.getMyNotifications(req.user.id, cursor, take ? Number(take) : 20);
        }
        getUnreadCount(req) {
            return this.notificationsService.getUnreadCount(req.user.id);
        }
        markAsRead(req, id) {
            return this.notificationsService.markAsRead(req.user.id, id);
        }
        markAllAsRead(req) {
            return this.notificationsService.markAllAsRead(req.user.id);
        }
        delete(req, id) {
            return this.notificationsService.delete(req.user.id, id);
        }
    };
    return NotificationsController = _classThis;
})();
export { NotificationsController };
