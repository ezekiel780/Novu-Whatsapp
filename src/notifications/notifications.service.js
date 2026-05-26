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
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import axios from 'axios';
let NotificationsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        config;
        constructor(prisma, config) {
            this.prisma = prisma;
            this.config = config;
            // Initialize Firebase Admin once
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: this.config.get('FIREBASE_PROJECT_ID'),
                        privateKey: this.config
                            .get('FIREBASE_PRIVATE_KEY')
                            ?.replace(/\\n/g, '\n'),
                        clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
                    }),
                });
            }
        }
        // ── Create Notification ───────────────────
        async create(dto) {
            return this.prisma.notification.create({
                data: {
                    userId: dto.userId,
                    type: dto.type,
                    title: dto.title,
                    body: dto.body,
                    metadata: dto.metadata ?? {},
                },
            });
        }
        // ── Get My Notifications ──────────────────
        async getMyNotifications(userId, cursor, take = 20) {
            const notifications = await this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor },
                }),
            });
            const nextCursor = notifications.length === take
                ? notifications[notifications.length - 1].id
                : null;
            return { notifications, nextCursor };
        }
        // ── Get Unread Count ──────────────────────
        async getUnreadCount(userId) {
            const count = await this.prisma.notification.count({
                where: { userId, isRead: false },
            });
            return { count };
        }
        // ── Mark As Read ──────────────────────────
        async markAsRead(userId, notificationId) {
            return this.prisma.notification.updateMany({
                where: { id: notificationId, userId },
                data: { isRead: true },
            });
        }
        // ── Mark All As Read ──────────────────────
        async markAllAsRead(userId) {
            return this.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
        }
        // ── Delete Notification ───────────────────
        async delete(userId, notificationId) {
            return this.prisma.notification.deleteMany({
                where: { id: notificationId, userId },
            });
        }
        // ── Send Push Notification (FCM) ──────────
        async sendPushNotification(fcmToken, title, body, data) {
            try {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: { title, body },
                    data: data ?? {},
                    android: {
                        priority: 'high',
                        notification: { sound: 'default' },
                    },
                    apns: {
                        payload: {
                            aps: { sound: 'default', badge: 1 },
                        },
                    },
                });
            }
            catch (error) {
                console.error('FCM push notification error:', error.message);
            }
        }
        // ── Send WhatsApp Notification ────────────
        async sendWhatsAppNotification(phoneNumber, templateName, parameters) {
            try {
                const url = `${this.config.get('WHATSAPP_API_URL')}/${this.config.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
                await axios.post(url, {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: 'en_US' },
                        components: [
                            {
                                type: 'body',
                                parameters: parameters.map((p) => ({
                                    type: 'text',
                                    text: p,
                                })),
                            },
                        ],
                    },
                }, {
                    headers: {
                        Authorization: `Bearer ${this.config.get('WHATSAPP_ACCESS_TOKEN')}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
            catch (error) {
                console.error('WhatsApp notification error:', error.message);
            }
        }
        // ── Send WhatsApp Text Message ────────────
        async sendWhatsAppTextMessage(phoneNumber, message) {
            try {
                const url = `${this.config.get('WHATSAPP_API_URL')}/${this.config.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
                await axios.post(url, {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: { body: message },
                }, {
                    headers: {
                        Authorization: `Bearer ${this.config.get('WHATSAPP_ACCESS_TOKEN')}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
            catch (error) {
                console.error('WhatsApp text message error:', error.message);
            }
        }
        // ── Handle WhatsApp Webhook ───────────────
        async handleWhatsAppWebhook(body) {
            try {
                const entry = body?.entry?.[0];
                const changes = entry?.changes?.[0];
                const value = changes?.value;
                const messages = value?.messages;
                if (!messages || messages.length === 0)
                    return;
                const message = messages[0];
                const from = message.from;
                const text = message?.text?.body;
                if (!text)
                    return;
                // Find user by phone number
                const user = await this.prisma.user.findUnique({
                    where: { phoneNumber: from },
                });
                if (!user)
                    return;
                // Save incoming WhatsApp message as notification
                await this.create({
                    userId: user.id,
                    type: 'NEW_MESSAGE',
                    title: 'New WhatsApp message',
                    body: text,
                    metadata: { from, source: 'whatsapp' },
                });
            }
            catch (error) {
                console.error('WhatsApp webhook error:', error.message);
            }
        }
        // ── Notify New Message ────────────────────
        async notifyNewMessage(userId, senderName, message, fcmToken, phoneNumber) {
            const title = `New message from ${senderName}`;
            const body = message.length > 50 ? message.slice(0, 50) + '...' : message;
            // Save to database
            await this.create({
                userId,
                type: 'NEW_MESSAGE',
                title,
                body,
            });
            // Send push notification
            if (fcmToken) {
                await this.sendPushNotification(fcmToken, title, body);
            }
            // Send WhatsApp if user is offline
            if (phoneNumber) {
                await this.sendWhatsAppTextMessage(phoneNumber, `${title}: ${body}`);
            }
        }
        // ── Notify Incoming Call ──────────────────
        async notifyIncomingCall(userId, callerName, callType, fcmToken) {
            const title = `Incoming ${callType} call`;
            const body = `${callerName} is calling you`;
            await this.create({
                userId,
                type: 'NEW_CALL',
                title,
                body,
                metadata: { callerName, callType },
            });
            if (fcmToken) {
                await this.sendPushNotification(fcmToken, title, body, {
                    type: 'call',
                    callerName,
                    callType,
                });
            }
        }
    };
    return NotificationsService = _classThis;
})();
export { NotificationsService };
