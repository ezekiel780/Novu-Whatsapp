# Novu — Real-Time Messaging App

> A full-featured WhatsApp-like messaging backend built with NestJS, Prisma, PostgreSQL, Redis, WebSockets, WebRTC, Firebase FCM, and the Meta WhatsApp Business API.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Modules](#api-modules)
- [WebSocket Events](#websocket-events)
- [Queue Jobs](#queue-jobs)
- [Docker](#docker)
- [Scripts](#scripts)
- [Author](#author)

---

## Overview

Novu is a production-ready real-time messaging backend that supports direct messaging, group chats, voice and video calls, file sharing, push notifications, and WhatsApp Business API integration. It is designed to serve general consumers at scale with a clean modular NestJS architecture backed by PostgreSQL and Redis.

---

## Features

- **Authentication** — Register, login, JWT access and refresh tokens, forgot and reset password with OTP
- **Direct Messaging** — One-on-one real-time chat with read receipts, reply threads, and message search
- **Group Chats** — Create and manage groups with admin roles, member management, and group settings
- **Real-Time** — WebSocket gateway with Socket.IO for live messaging, typing indicators, and user presence
- **Voice and Video Calls** — WebRTC peer-to-peer calls with ICE candidate exchange and TURN server fallback
- **File Sharing** — Upload images, videos, audio, and documents to AWS S3 with signed URL support
- **Push Notifications** — Firebase Cloud Messaging (FCM) for mobile push notifications
- **WhatsApp Integration** — Send and receive messages via Meta WhatsApp Business API with webhook support
- **Background Jobs** — BullMQ queues for async notification delivery and media processing
- **Caching** — Redis caching for user profiles, conversation data, and presence tracking
- **Rate Limiting** — Request throttling to prevent abuse
- **API Documentation** — Swagger UI available at `/api/docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Cache and Queues | Redis 7 + BullMQ |
| Real-Time | Socket.IO WebSockets |
| Voice and Video | WebRTC + TURN Server |
| File Storage | AWS S3 |
| Push Notifications | Firebase Admin SDK (FCM) |
| Messaging API | Meta WhatsApp Business API |
| Containerization | Docker + Docker Compose |
| API Documentation | Swagger |

---

## Architecture

```
Client (Mobile / Web / WhatsApp)
            ↓
REST API (port 3000) + WebSocket Gateway
            ↓
NestJS Modules
  Auth · Users · Conversations · Messages
  Calls · Media · Notifications · Gateway
            ↓
Prisma ORM (Type-safe queries)
            ↓
PostgreSQL (Primary Database)
            ↓
External Infrastructure
  Redis       → Caching, Presence, Pub/Sub
  BullMQ      → Background job queues
  AWS S3      → Media file storage
  Firebase    → Push notifications (FCM)
  WhatsApp    → Business messaging API
  WebRTC      → Peer-to-peer calls
```

---

## Project Structure

```
novu-backend/
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts
│   └── migrations/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── conversations/
│   │   ├── dto/
│   │   │   ├── create-conversation.dto.ts
│   │   │   └── update-conversation.dto.ts
│   │   ├── conversations.service.ts
│   │   ├── conversations.controller.ts
│   │   └── conversations.module.ts
│   ├── messages/
│   │   ├── dto/
│   │   │   ├── create-message.dto.ts
│   │   │   └── update-message.dto.ts
│   │   ├── messages.service.ts
│   │   ├── messages.controller.ts
│   │   └── messages.module.ts
│   ├── calls/
│   │   ├── dto/
│   │   │   ├── create-call.dto.ts
│   │   │   └── update-call.dto.ts
│   │   ├── calls.service.ts
│   │   ├── calls.controller.ts
│   │   └── calls.module.ts
│   ├── media/
│   │   ├── dto/
│   │   │   └── upload-media.dto.ts
│   │   ├── media.service.ts
│   │   ├── media.controller.ts
│   │   └── media.module.ts
│   ├── notifications/
│   │   ├── dto/
│   │   │   └── create-notification.dto.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.webhook.controller.ts
│   │   └── notifications.module.ts
│   ├── gateway/
│   │   ├── gateway.ts
│   │   └── gateway.module.ts
│   ├── redis/
│   │   ├── redis.service.ts
│   │   └── redis.module.ts
│   ├── queues/
│   │   ├── processors/
│   │   │   ├── notification.processor.ts
│   │   │   └── media.processor.ts
│   │   ├── queues.service.ts
│   │   └── queues.module.ts
│   ├── helpers/
│   │   ├── date.helper.ts
│   │   ├── file.helper.ts
│   │   ├── pagination.helper.ts
│   │   ├── response.helper.ts
│   │   ├── token.helper.ts
│   │   └── whatsapp.helper.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .dockerignore
├── .gitignore
├── .env
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/novu-backend.git
cd novu-backend

# Install dependencies
npm install

# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novu_db"

# JWT
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# AWS S3
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="novu-media"

# Firebase
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"

# WhatsApp Business API
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_whatsapp_access_token"
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"

# App
PORT=3000
APP_URL="http://localhost:3000"
```

---

## Database

### Models

| Model | Purpose |
|---|---|
| User | Core user account with presence and FCM token |
| RefreshToken | JWT refresh token storage |
| Conversation | DM and group chat conversations |
| ConversationMember | User membership and roles in conversations |
| Message | All messages with reply thread support |
| Media | File and image metadata linked to messages |
| Call | Voice and video call history |
| Notification | In-app and push notification records |

### Migrations

```bash
# Create and apply a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## API Modules

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout user |
| POST | `/auth/forgot-password` | No | Send OTP to email |
| POST | `/auth/reset-password` | No | Reset password with OTP |

### Users — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Get current user profile |
| PATCH | `/users/me` | Yes | Update profile and FCM token |
| DELETE | `/users/me` | Yes | Soft delete account |
| GET | `/users/search?q=` | Yes | Search users by name or email |
| GET | `/users/:id` | Yes | Get user by ID |

### Conversations — `/conversations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/conversations` | Yes | Create DM or group |
| GET | `/conversations` | Yes | Get all conversations |
| GET | `/conversations/:id` | Yes | Get single conversation |
| PATCH | `/conversations/:id` | Yes | Update group details |
| POST | `/conversations/:id/members/:memberId` | Yes | Add member |
| DELETE | `/conversations/:id/members/:memberId` | Yes | Remove member |
| DELETE | `/conversations/:id/leave` | Yes | Leave conversation |
| DELETE | `/conversations/:id` | Yes | Delete conversation |

### Messages — `/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/messages` | Yes | Send message |
| GET | `/messages/:conversationId` | Yes | Get paginated messages |
| PATCH | `/messages/:id` | Yes | Edit message |
| DELETE | `/messages/:id` | Yes | Soft delete message |
| PATCH | `/messages/:conversationId/read` | Yes | Mark messages as read |
| GET | `/messages/:conversationId/search?q=` | Yes | Search messages |

### Calls — `/calls`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/calls` | Yes | Initiate call |
| PATCH | `/calls/:id` | Yes | Update call status |
| GET | `/calls/history` | Yes | Get call history |
| GET | `/calls/missed` | Yes | Get missed calls |
| GET | `/calls/:id` | Yes | Get single call |

### Media — `/media`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/media/upload` | Yes | Upload file to S3 |
| POST | `/media/signed-url` | Yes | Get pre-signed upload URL |
| GET | `/media/me` | Yes | Get my uploaded media |
| GET | `/media/message/:messageId` | Yes | Get media by message |
| DELETE | `/media/:id` | Yes | Delete media from S3 and DB |

### Notifications — `/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | Get paginated notifications |
| GET | `/notifications/unread-count` | Yes | Get unread badge count |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |
| GET | `/webhook/whatsapp` | No | Verify WhatsApp webhook |
| POST | `/webhook/whatsapp` | No | Receive WhatsApp messages |

---

## WebSocket Events

Connect to the WebSocket server with a JWT token:

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_access_token' }
});
```

| Event | Direction | Payload | Description |
|---|---|---|---|
| `conversation:join` | Client → Server | `conversationId` | Join a conversation room |
| `conversation:leave` | Client → Server | `conversationId` | Leave a conversation room |
| `message:send` | Client → Server | `CreateMessageDto` | Send a message |
| `message:new` | Server → Client | `Message` | New message received |
| `message:delivered` | Client → Server | `{ messageId, conversationId }` | Confirm delivery |
| `message:read` | Client → Server | `{ conversationId }` | Mark messages as read |
| `typing:start` | Client → Server | `{ conversationId }` | User started typing |
| `typing:stop` | Client → Server | `{ conversationId }` | User stopped typing |
| `presence:update` | Server → Client | `{ userId, isOnline }` | User online or offline |
| `call:invite` | Client → Server | `{ receiverId, type, offer }` | Initiate WebRTC call |
| `call:incoming` | Server → Client | `{ callerId, type, offer }` | Incoming call |
| `call:accept` | Client → Server | `{ callerId, answer }` | Accept call |
| `call:decline` | Client → Server | `{ callerId }` | Decline call |
| `call:end` | Client → Server | `{ receiverId }` | End call |
| `call:ice-candidate` | Client → Server | `{ targetId, candidate }` | WebRTC ICE candidate |

---

## Queue Jobs

| Queue | Job | Data | Purpose |
|---|---|---|---|
| `notifications` | `new_message` | `userId, senderName, message` | Async message notification |
| `notifications` | `new_call` | `userId, callerName, callType` | Async call notification |
| `notifications` | `group_invite` | `userId, groupName, inviterName` | Group invite notification |
| `media` | `compress` | `mediaId, fileUrl, fileType` | Compress uploaded media |
| `media` | `thumbnail` | `mediaId, fileUrl, fileType` | Generate media thumbnails |

---

## Docker

### Development

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart
```

### Production

```bash
# Build and start everything
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run start:dev` | Start with hot reload |
| Production | `npm run start:prod` | Start production build |
| Build | `npm run build` | Compile TypeScript |
| Migrate Dev | `npm run migrate:dev` | Create and apply migration |
| Migrate Prod | `npm run migrate` | Apply migrations in production |
| Studio | `npm run studio` | Open Prisma Studio |
| Docker Dev | `npm run docker:dev` | Start Docker containers |
| Docker Prod | `npm run docker:prod` | Start production containers |
| Docker Down | `npm run docker:down` | Stop all containers |
| Docker Logs | `npm run docker:logs` | View container logs |

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api/docs
```

---

## Author

**Balogun Ezekiel**
Fullstack Developer and Programming Tutor at ExpertHive

- Tutoring: [https://www.experthivetutors.com/tutor/BALOGUN-EZEKIEL-34](https://www.experthivetutors.com/tutor/BALOGUN-EZEKIEL-34)

---

## License

MIT
