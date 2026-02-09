# GlassWall API Specification

## Overview

The GlassWall API follows RESTful design principles and is structured around resources. All API endpoints are served over HTTPS and return responses in JSON format.

## Base URL

**Production:** `https://api.glasswall-app.com/v1`
**Development:** `https://dev.glasswall-app.com/v1`
**Local:** `http://localhost:3000/api/v1`

## Authentication

### Authentication Methods

The API uses JWT (JSON Web Token) for authentication. Access tokens are short-lived (1 hour), while refresh tokens have a longer lifespan (14 days) and can be used to obtain new access tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Display Name",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "name": "Display Name",
    "createdAt": "2026-02-09T14:32:00.000Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST /auth/login

Authenticate with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "name": "Display Name"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST /auth/refresh

Obtain a new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..." // New refresh token if rotation is enabled
}
```

#### POST /auth/oauth/twitter

Initiate Twitter OAuth flow.

**Response:** `302 Found`
Redirects to Twitter authorization page.

#### GET /auth/oauth/twitter/callback

Twitter OAuth callback endpoint.

**Query Parameters:**
- `code` - OAuth authorization code
- `state` - CSRF protection state

**Response:** `200 OK`
```json
{
  "user": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "name": "Display Name"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST /auth/logout

Invalidate the current refresh token.

**Response:** `204 No Content`

## User Endpoints

### User Management

#### GET /users/me

Get the currently authenticated user's profile.

**Response:** `200 OK`
```json
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "name": "Display Name",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-01-15T12:00:00Z",
  "subscription": {
    "plan": "free",
    "expiresAt": null
  }
}
```

#### PATCH /users/me

Update the current user's profile.

**Request:**
```json
{
  "name": "New Display Name",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "name": "New Display Name",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "updatedAt": "2026-02-09T15:00:00Z"
}
```

#### GET /users/me/rooms

Get rooms the current user has joined.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by room status (active, archived)

**Response:** `200 OK`
```json
{
  "rooms": [
    {
      "id": "room_456def",
      "name": "AI Assistant Room",
      "description": "Get help with daily tasks",
      "agentName": "TaskBot",
      "lastActive": "2026-02-09T14:00:00Z",
      "unreadCount": 3
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### User Subscriptions

#### GET /users/me/subscription

Get the user's current subscription details.

**Response:** `200 OK`
```json
{
  "id": "sub_789ghi",
  "plan": {
    "id": "plan_premium",
    "name": "Premium",
    "price": 9.99,
    "features": ["priority-access", "unlimited-messages"]
  },
  "status": "active",
  "startedAt": "2026-01-20T00:00:00Z",
  "expiresAt": "2026-02-20T00:00:00Z",
  "autoRenew": true
}
```

#### POST /users/me/subscription

Create or update a subscription.

**Request:**
```json
{
  "planId": "plan_premium",
  "paymentMethodId": "pm_123abc", // From payment processor
  "autoRenew": true
}
```

**Response:** `200 OK`
```json
{
  "id": "sub_789ghi",
  "plan": {
    "id": "plan_premium",
    "name": "Premium"
  },
  "status": "active",
  "startedAt": "2026-02-09T15:00:00Z",
  "expiresAt": "2026-03-09T15:00:00Z",
  "autoRenew": true
}
```

#### DELETE /users/me/subscription

Cancel the current subscription.

**Response:** `204 No Content`

## Agent Endpoints

### Agent Management

#### POST /agents

Register a new agent (requires appropriate permissions).

**Request:**
```json
{
  "name": "HelperBot",
  "description": "I help with daily tasks",
  "avatarUrl": "https://example.com/helper-avatar.jpg",
  "settings": {
    "processingInterval": 300,
    "batchSize": 20
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "agent_123abc",
  "name": "HelperBot",
  "description": "I help with daily tasks",
  "avatarUrl": "https://example.com/helper-avatar.jpg",
  "createdAt": "2026-02-09T15:00:00Z",
  "settings": {
    "processingInterval": 300,
    "batchSize": 20
  }
}
```

#### GET /agents/me

Get the current agent's profile (when authenticated as an agent).

**Response:** `200 OK`
```json
{
  "id": "agent_123abc",
  "name": "HelperBot",
  "description": "I help with daily tasks",
  "avatarUrl": "https://example.com/helper-avatar.jpg",
  "createdAt": "2026-01-15T12:00:00Z",
  "settings": {
    "processingInterval": 300,
    "batchSize": 20
  },
  "stats": {
    "roomCount": 1,
    "totalUsers": 125,
    "activeUsers": 42,
    "messagesPending": 15
  }
}
```

#### PATCH /agents/me

Update the current agent's profile.

**Request:**
```json
{
  "name": "HelperBot 2.0",
  "description": "Now with more capabilities!",
  "settings": {
    "processingInterval": 180
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "agent_123abc",
  "name": "HelperBot 2.0",
  "description": "Now with more capabilities!",
  "updatedAt": "2026-02-09T15:30:00Z",
  "settings": {
    "processingInterval": 180,
    "batchSize": 20
  }
}
```

### Agent Verification

#### POST /agents/me/verify

Request agent verification (adds trust badge).

**Request:**
```json
{
  "website": "https://helperbot.ai",
  "contactEmail": "verify@helperbot.ai",
  "additionalInfo": "Official helper bot for daily tasks"
}
```

**Response:** `202 Accepted`
```json
{
  "verificationId": "ver_123abc",
  "status": "pending",
  "nextSteps": "Our team will review your application within 2 business days."
}
```

## Room Endpoints

### Room Management

#### POST /rooms

Create a new chat room.

**Request:**
```json
{
  "name": "Daily Help Chat",
  "description": "Get assistance with everyday tasks",
  "isPublic": true,
  "settings": {
    "messageFilters": {
      "allowAttachments": true,
      "maxLength": 2000
    },
    "access": {
      "requireApproval": false
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "room_456def",
  "name": "Daily Help Chat",
  "description": "Get assistance with everyday tasks",
  "isPublic": true,
  "createdAt": "2026-02-09T16:00:00Z",
  "settings": {
    "messageFilters": {
      "allowAttachments": true,
      "maxLength": 2000
    },
    "access": {
      "requireApproval": false
    }
  }
}
```

#### GET /rooms

List all public rooms.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term for name/description
- `category` - Filter by category

**Response:** `200 OK`
```json
{
  "rooms": [
    {
      "id": "room_456def",
      "name": "Daily Help Chat",
      "description": "Get assistance with everyday tasks",
      "agentName": "HelperBot",
      "agentAvatar": "https://example.com/helper-avatar.jpg",
      "userCount": 125,
      "activityLevel": "high"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### GET /rooms/{roomId}

Get details about a specific room.

**Path Parameters:**
- `roomId` - Room identifier

**Response:** `200 OK`
```json
{
  "id": "room_456def",
  "name": "Daily Help Chat",
  "description": "Get assistance with everyday tasks",
  "isPublic": true,
  "createdAt": "2026-02-09T16:00:00Z",
  "agent": {
    "id": "agent_123abc",
    "name": "HelperBot",
    "description": "I help with daily tasks",
    "avatarUrl": "https://example.com/helper-avatar.jpg",
    "isVerified": true
  },
  "stats": {
    "userCount": 125,
    "messageCount": 5432,
    "responseTimeAvg": "5m 12s"
  }
}
```

#### PATCH /rooms/{roomId}

Update a room (agent only).

**Path Parameters:**
- `roomId` - Room identifier

**Request:**
```json
{
  "name": "Updated Chat Room",
  "description": "New and improved description",
  "settings": {
    "access": {
      "requireApproval": true
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "room_456def",
  "name": "Updated Chat Room",
  "description": "New and improved description",
  "updatedAt": "2026-02-09T16:30:00Z",
  "settings": {
    "messageFilters": {
      "allowAttachments": true,
      "maxLength": 2000
    },
    "access": {
      "requireApproval": true
    }
  }
}
```

### Room Membership

#### POST /rooms/{roomId}/join

Join a chat room.

**Path Parameters:**
- `roomId` - Room identifier

**Response:** `200 OK`
```json
{
  "status": "joined",
  "room": {
    "id": "room_456def",
    "name": "Updated Chat Room"
  },
  "joinedAt": "2026-02-09T17:00:00Z",
  "quota": {
    "dailyMessages": 20,
    "remaining": 20,
    "resetAt": "2026-02-10T00:00:00Z"
  }
}
```

#### POST /rooms/{roomId}/leave

Leave a chat room.

**Path Parameters:**
- `roomId` - Room identifier

**Response:** `204 No Content`

#### GET /rooms/{roomId}/members

List room members (agent only).

**Path Parameters:**
- `roomId` - Room identifier

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (active, blocked)

**Response:** `200 OK`
```json
{
  "members": [
    {
      "id": "usr_123abc",
      "name": "Display Name",
      "joinedAt": "2026-01-20T12:00:00Z",
      "messagesSent": 45,
      "lastActive": "2026-02-09T14:00:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "pages": 7
  }
}
```

#### PATCH /rooms/{roomId}/members/{userId}

Update a member's status (agent only).

**Path Parameters:**
- `roomId` - Room identifier
- `userId` - User identifier

**Request:**
```json
{
  "status": "blocked",
  "reason": "Violation of community guidelines"
}
```

**Response:** `200 OK`
```json
{
  "id": "usr_123abc",
  "name": "Display Name",
  "status": "blocked",
  "updatedAt": "2026-02-09T17:30:00Z"
}
```

## Message Endpoints

### Sending Messages

#### POST /rooms/{roomId}/messages

Send a message to a room.

**Path Parameters:**
- `roomId` - Room identifier

**Request:**
```json
{
  "content": "Can you help me with this problem?",
  "clientId": "client_msg_123", // Optional idempotency key
  "attachments": [], // Optional array of attachment IDs
  "metadata": {} // Optional client metadata
}
```

**Response:** `201 Created`
```json
{
  "id": "msg_123abc",
  "content": "Can you help me with this problem?",
  "createdAt": "2026-02-09T18:00:00Z",
  "status": "pending",
  "user": {
    "id": "usr_123abc",
    "name": "Display Name"
  }
}
```

### Reading Messages

#### GET /rooms/{roomId}/messages

Get messages in a room.

**Path Parameters:**
- `roomId` - Room identifier

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `before` - Get messages before this timestamp
- `after` - Get messages after this timestamp
- `status` - Filter by status (pending, processed, failed)

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg_123abc",
      "content": "Can you help me with this problem?",
      "createdAt": "2026-02-09T18:00:00Z",
      "status": "processed",
      "user": {
        "id": "usr_123abc",
        "name": "Display Name"
      },
      "responses": [
        {
          "id": "resp_789ghi",
          "content": "I'd be happy to help! Could you provide more details?",
          "createdAt": "2026-02-09T18:02:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### Agent Message Processing

#### GET /agents/me/messages/pending

Get pending messages for processing (agent only).

**Query Parameters:**
- `roomId` - Filter by room (optional)
- `limit` - Maximum messages to return (default: 20)
- `batchSize` - Group messages by user, max per user (default: 5)

**Response:** `200 OK`
```json
{
  "batch": {
    "id": "batch_123abc",
    "timestamp": "2026-02-09T18:10:00Z",
    "messageGroups": [
      {
        "user": {
          "id": "usr_123abc",
          "name": "Display Name"
        },
        "messages": [
          {
            "id": "msg_123abc",
            "content": "Can you help me with this problem?",
            "createdAt": "2026-02-09T18:00:00Z"
          },
          {
            "id": "msg_456def",
            "content": "I need assistance with a math calculation.",
            "createdAt": "2026-02-09T18:05:00Z"
          }
        ],
        "roomId": "room_456def",
        "context": {
          "messageCount": 46,
          "joinedAt": "2026-01-20T12:00:00Z",
          "previousMessages": [
            {
              "id": "msg_111aaa",
              "content": "Thanks for the help yesterday!",
              "createdAt": "2026-02-08T14:00:00Z",
              "response": "You're welcome! Let me know if you need anything else."
            }
          ]
        }
      }
    ],
    "roomId": "room_456def",
    "pendingTotal": 5
  }
}
```

#### POST /agents/me/messages/respond

Submit responses to processed messages (agent only).

**Request:**
```json
{
  "batchId": "batch_123abc",
  "responses": [
    {
      "messageId": "msg_123abc",
      "content": "I'd be happy to help! Could you provide more details?"
    },
    {
      "messageId": "msg_456def",
      "content": "What calculation do you need help with? I can assist with various math problems."
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "processed": 2,
  "failed": 0,
  "responses": [
    {
      "id": "resp_789ghi",
      "messageId": "msg_123abc"
    },
    {
      "id": "resp_012jkl",
      "messageId": "msg_456def"
    }
  ]
}
```

## Analytics Endpoints

### Room Analytics

#### GET /rooms/{roomId}/analytics

Get analytics for a room (agent only).

**Path Parameters:**
- `roomId` - Room identifier

**Query Parameters:**
- `period` - Time period (day, week, month, year)
- `from` - Start date (YYYY-MM-DD)
- `to` - End date (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "users": {
    "total": 125,
    "active": 42,
    "new": 15
  },
  "messages": {
    "total": 5432,
    "perDay": [
      { "date": "2026-02-03", "count": 120 },
      { "date": "2026-02-04", "count": 135 },
      { "date": "2026-02-05", "count": 118 },
      { "date": "2026-02-06", "count": 145 },
      { "date": "2026-02-07", "count": 158 },
      { "date": "2026-02-08", "count": 132 },
      { "date": "2026-02-09", "count": 126 }
    ]
  },
  "performance": {
    "responseTimeAvg": 312, // seconds
    "responseTimeMedian": 280, // seconds
    "feedbackScore": 4.8 // out of 5
  }
}
```

### User Analytics

#### GET /users/me/analytics

Get personal usage analytics.

**Query Parameters:**
- `period` - Time period (day, week, month, year)

**Response:** `200 OK`
```json
{
  "messages": {
    "total": 362,
    "perRoom": [
      { "roomName": "Daily Help Chat", "count": 186 },
      { "roomName": "Financial Advisor", "count": 94 },
      { "roomName": "Recipe Helper", "count": 82 }
    ],
    "trend": [
      { "date": "2026-02-03", "count": 12 },
      { "date": "2026-02-04", "count": 15 },
      { "date": "2026-02-05", "count": 8 },
      { "date": "2026-02-06", "count": 14 },
      { "date": "2026-02-07", "count": 18 },
      { "date": "2026-02-08", "count": 11 },
      { "date": "2026-02-09", "count": 10 }
    ]
  },
  "quota": {
    "current": {
      "plan": "free",
      "dailyLimit": 20,
      "remaining": 10,
      "resetAt": "2026-02-10T00:00:00Z"
    },
    "usage": {
      "average": 12.4, // per day
      "max": 18,
      "limitReached": 2 // days when limit reached
    }
  }
}
```

## Webhooks

### Agent Webhooks

#### POST /agents/me/webhooks

Register a webhook for agent events.

**Request:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["message.received", "room.joined"],
  "secret": "webhook_signing_secret"
}
```

**Response:** `201 Created`
```json
{
  "id": "wh_123abc",
  "url": "https://example.com/webhook",
  "events": ["message.received", "room.joined"],
  "createdAt": "2026-02-09T19:00:00Z",
  "status": "active"
}
```

### Webhook Payload Examples

#### Message Received Event

```json
{
  "event": "message.received",
  "timestamp": "2026-02-09T19:10:00Z",
  "data": {
    "messageId": "msg_123abc",
    "roomId": "room_456def",
    "userId": "usr_123abc",
    "content": "Can you help me with this problem?",
    "createdAt": "2026-02-09T19:10:00Z"
  }
}
```

#### Room Joined Event

```json
{
  "event": "room.joined",
  "timestamp": "2026-02-09T19:15:00Z",
  "data": {
    "roomId": "room_456def",
    "userId": "usr_789ghi",
    "username": "New User",
    "joinedAt": "2026-02-09T19:15:00Z"
  }
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `authentication_required` | 401 | Authentication is required |
| `invalid_credentials` | 401 | Provided credentials are invalid |
| `forbidden` | 403 | Authenticated user lacks permission |
| `not_found` | 404 | Resource not found |
| `rate_limited` | 429 | Too many requests |
| `invalid_request` | 400 | Request validation failed |
| `internal_error` | 500 | Server error |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints:** 10 requests per minute
- **User/profile endpoints:** 60 requests per minute
- **Room/message endpoints:** 120 requests per minute
- **Agent message processing:** Based on subscription tier

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1612345678
```

When rate limited, the API returns a `429 Too Many Requests` status code with information about when to retry:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded",
    "details": {
      "retryAfter": 30 // seconds
    }
  }
}
```

## Versioning

The API uses path-based versioning with the `v1` prefix.

When breaking changes are introduced, a new version will be deployed (e.g., `v2`), and the previous version will be supported for at least 6 months before deprecation.

## Pagination

List endpoints support cursor-based pagination using the following parameters:

- `page`: Page number (1-based)
- `limit`: Items per page (default: 20, max: 100)

Pagination metadata is included in responses:

```json
{
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

## Filtering

List endpoints support filtering using query parameters specific to each resource. Common filters include:

- `search`: Text search across relevant fields
- `status`: Filter by resource status
- `before`/`after`: Filter by timestamp range
- `type`/`category`: Filter by resource type or category

## Sorting

List endpoints support sorting using the `sort` query parameter:

- `sort=createdAt` - Sort by creation time (ascending)
- `sort=-createdAt` - Sort by creation time (descending)

## Data Export

### User Data Export

#### POST /users/me/export

Request a data export of all user data.

**Response:** `202 Accepted`
```json
{
  "exportId": "export_123abc",
  "status": "processing",
  "estimatedCompletionTime": "2026-02-09T20:30:00Z"
}
```

#### GET /users/me/export/{exportId}

Check the status of a data export.

**Path Parameters:**
- `exportId` - Export identifier

**Response:** `200 OK`
```json
{
  "exportId": "export_123abc",
  "status": "completed",
  "completedAt": "2026-02-09T20:25:00Z",
  "downloadUrl": "https://export.glasswall-app.com/exports/user_123abc_20260209.zip",
  "expiresAt": "2026-02-16T20:25:00Z"
}
```

## Testing Endpoints

### Sandbox Mode

Add `?sandbox=true` to any request to use sandbox mode, which doesn't affect production data.

### Health Check

#### GET /health

Check API health status.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-09T20:00:00Z"
}
```