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
let UsersController = (() => {
    let _classDecorators = [ApiTags('Users'), ApiBearerAuth(), UseGuards(JwtAuthGuard), Controller('users')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMe_decorators;
    let _updateMe_decorators;
    let _deleteMe_decorators;
    let _searchUsers_decorators;
    let _getUserById_decorators;
    var UsersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getMe_decorators = [Get('me')];
            _updateMe_decorators = [Patch('me')];
            _deleteMe_decorators = [Delete('me')];
            _searchUsers_decorators = [Get('search')];
            _getUserById_decorators = [Get(':id')];
            __esDecorate(this, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: obj => "getMe" in obj, get: obj => obj.getMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateMe_decorators, { kind: "method", name: "updateMe", static: false, private: false, access: { has: obj => "updateMe" in obj, get: obj => obj.updateMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteMe_decorators, { kind: "method", name: "deleteMe", static: false, private: false, access: { has: obj => "deleteMe" in obj, get: obj => obj.deleteMe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _searchUsers_decorators, { kind: "method", name: "searchUsers", static: false, private: false, access: { has: obj => "searchUsers" in obj, get: obj => obj.searchUsers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUserById_decorators, { kind: "method", name: "getUserById", static: false, private: false, access: { has: obj => "getUserById" in obj, get: obj => obj.getUserById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(usersService) {
            this.usersService = usersService;
        }
        getMe(req) {
            return this.usersService.getMe(req.user.id);
        }
        updateMe(req, dto) {
            return this.usersService.updateMe(req.user.id, dto);
        }
        deleteMe(req) {
            return this.usersService.deleteMe(req.user.id);
        }
        searchUsers(query, req) {
            return this.usersService.searchUsers(query, req.user.id);
        }
        getUserById(id) {
            return this.usersService.getUserById(id);
        }
    };
    return UsersController = _classThis;
})();
export { UsersController };
