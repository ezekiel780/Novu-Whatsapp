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
import { Controller, Get, Post, Patch, Delete, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
let ConversationsController = (() => {
    let _classDecorators = [ApiTags('Conversations'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('conversations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _addMember_decorators;
    let _removeMember_decorators;
    let _leave_decorators;
    let _delete_decorators;
    var ConversationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [Post()];
            _findAll_decorators = [Get()];
            _findOne_decorators = [Get(':id')];
            _update_decorators = [Patch(':id')];
            _addMember_decorators = [Post(':id/members/:memberId')];
            _removeMember_decorators = [Delete(':id/members/:memberId')];
            _leave_decorators = [Delete(':id/leave')];
            _delete_decorators = [Delete(':id')];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addMember_decorators, { kind: "method", name: "addMember", static: false, private: false, access: { has: obj => "addMember" in obj, get: obj => obj.addMember }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeMember_decorators, { kind: "method", name: "removeMember", static: false, private: false, access: { has: obj => "removeMember" in obj, get: obj => obj.removeMember }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _leave_decorators, { kind: "method", name: "leave", static: false, private: false, access: { has: obj => "leave" in obj, get: obj => obj.leave }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConversationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        conversationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(conversationsService) {
            this.conversationsService = conversationsService;
        }
        create(req, dto) {
            return this.conversationsService.create(req.user.id, dto);
        }
        findAll(req) {
            return this.conversationsService.findAll(req.user.id);
        }
        findOne(req, id) {
            return this.conversationsService.findOne(req.user.id, id);
        }
        update(req, id, dto) {
            return this.conversationsService.update(req.user.id, id, dto);
        }
        addMember(req, id, memberId) {
            return this.conversationsService.addMember(req.user.id, id, memberId);
        }
        removeMember(req, id, memberId) {
            return this.conversationsService.removeMember(req.user.id, id, memberId);
        }
        leave(req, id) {
            return this.conversationsService.leave(req.user.id, id);
        }
        delete(req, id) {
            return this.conversationsService.delete(req.user.id, id);
        }
    };
    return ConversationsController = _classThis;
})();
export { ConversationsController };
