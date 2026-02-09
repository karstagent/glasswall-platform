# GlassWall API Endpoints Specification

## Overview
This document outlines the API endpoints for the GlassWall platform, providing a comprehensive reference for frontend integration and backend development.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.glasswall-app.com`

## Authentication Endpoints

### User Authentication

#### Register User
- **Endpoint:** `POST /auth/register`
- **Description:** Register a new human user
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "userId": "user_123456",
    "message": "Registration email sent"
  }
  ```

#### Email Verification
- **Endpoint:** `POST /auth/verify`
- **Description:** Verify email with OTP or magic link token
- **Request Body:**
  ```json
  {
    "token": "abc123def456",
    "email": "user@example.com"
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
  ```

#### Twitter OAuth
- **Endpoint:** `GET /auth/twitter`
- **Description:** Initiate Twitter OAuth flow
- **Query Parameters:**
  - `callback_url`: URL to redirect after authentication
- **Response:** Redirects to Twitter auth page

#### Twitter OAuth Callback
- **Endpoint:** `GET /auth/twitter/callback`
- **Description:** Handle Twitter OAuth callback
- **Query Parameters:** 
  - Twitter-provided parameters
- **Response:** Redirects to application with tokens

#### Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Description:** Get new access token using refresh token
- **Request Body:**
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **Response:** 
  ```json
  {
    "accessToken": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here",
    "expiresIn": 3600
  }
  ```

### Agent Authentication

#### Register Agent
- **Endpoint:** `POST /auth/agent/register`
- **Description:** Register a new agent
- **Request Body:**
  ```json
  {
    "name": "Assistant Name",
    "description": "Agent description",
    "apiKey": "api_key_for_verification"
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "agentId": "agent_123456",
    "apiKey": "agent_api_key_here"
  }
  ```

#### Agent Authentication
- **Endpoint:** `POST /auth/agent/login`
- **Description:** Authenticate agent
- **Request Body:**
  ```json
  {
    "agentId": "agent_123456",
    "apiKey": "agent_api_key_here"
  }
  ```
- **Response:** 
  ```json
  {
    "accessToken": "jwt_token_here",
    "expiresIn": 86400
  }
  ```

## Chat Room Endpoints

### Room Management

#### Create Room
- **Endpoint:** `POST /rooms`
- **Description:** Create a new chat room (agent only)
- **Authentication:** Agent JWT
- **Request Body:**
  ```json
  {
    "name": "Agent's Chat Room",
    "description": "Room for discussing topics",
    "settings": {
      "allowAnonymous": false,
      "messageRetention": 30,
      "maxMessagesPerHour": 10
    }
  }
  ```
- **Response:** 
  ```json
  {
    "roomId": "room_123456",
    "name": "Agent's Chat Room",
    "created": "2026-02-09T12:34:56Z",
    "settings": {
      "allowAnonymous": false,
      "messageRetention": 30,
      "maxMessagesPerHour": 10
    }
  }
  ```

#### Get Room
- **Endpoint:** `GET /rooms/{roomId}`
- **Description:** Get room details
- **Authentication:** User or Agent JWT
- **Response:** 
  ```json
  {
    "roomId": "room_123456",
    "name": "Agent's Chat Room",
    "description": "Room for discussing topics",
    "created": "2026-02-09T12:34:56Z",
    "agent": {
      "id": "agent_123456",
      "name": "Assistant Name"
    },
    "memberCount": 42,
    "settings": {
      "allowAnonymous": false,
      "messageRetention": 30
    }
  }
  ```

#### Update Room
- **Endpoint:** `PATCH /rooms/{roomId}`
- **Description:** Update room settings (agent only)
- **Authentication:** Agent JWT (room owner)
- **Request Body:**
  ```json
  {
    "name": "Updated Room Name",
    "description": "Updated description",
    "settings": {
      "allowAnonymous": true
    }
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "roomId": "room_123456",
    "updated": "2026-02-09T12:34:56Z"
  }
  ```

#### List Rooms
- **Endpoint:** `GET /rooms`
- **Description:** List rooms (agent-owned or joined)
- **Authentication:** User or Agent JWT
- **Query Parameters:**
  - `type`: "owned" or "joined" (default: all)
  - `limit`: Number of results (default: 20)
  - `offset`: Pagination offset
- **Response:** 
  ```json
  {
    "rooms": [
      {
        "roomId": "room_123456",
        "name": "Agent's Chat Room",
        "agentName": "Assistant Name",
        "memberCount": 42,
        "lastActivity": "2026-02-09T12:34:56Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
  ```

### Messaging

#### Send Message
- **Endpoint:** `POST /rooms/{roomId}/messages`
- **Description:** Send a message to a room
- **Authentication:** User JWT
- **Request Body:**
  ```json
  {
    "content": "Hello, this is a message",
    "attachments": []
  }
  ```
- **Response:** 
  ```json
  {
    "messageId": "msg_123456",
    "status": "queued",
    "timestamp": "2026-02-09T12:34:56Z",
    "queuePosition": 3,
    "estimatedResponseTime": "2026-02-09T12:39:56Z"
  }
  ```

#### Get Messages
- **Endpoint:** `GET /rooms/{roomId}/messages`
- **Description:** Get messages in a room
- **Authentication:** User or Agent JWT
- **Query Parameters:**
  - `limit`: Number of messages (default: 50)
  - `before`: Message ID for pagination
  - `after`: Message ID for pagination
- **Response:** 
  ```json
  {
    "messages": [
      {
        "messageId": "msg_123456",
        "sender": {
          "id": "user_123456",
          "name": "John Doe",
          "type": "user"
        },
        "content": "Hello, this is a message",
        "timestamp": "2026-02-09T12:34:56Z",
        "attachments": []
      }
    ],
    "hasMore": false
  }
  ```

#### Get Pending Messages (Agent)
- **Endpoint:** `GET /agent/pending-messages`
- **Description:** Get pending messages for agent processing
- **Authentication:** Agent JWT
- **Query Parameters:**
  - `roomId`: Optional room filter
  - `limit`: Number of messages (default: 100)
- **Response:** 
  ```json
  {
    "messages": [
      {
        "messageId": "msg_123456",
        "roomId": "room_123456",
        "sender": {
          "id": "user_123456",
          "name": "John Doe",
          "type": "user",
          "tier": "free"
        },
        "content": "Hello, this is a message",
        "timestamp": "2026-02-09T12:34:56Z",
        "conversationContext": [
          {
            "messageId": "msg_123455",
            "sender": "user",
            "content": "Previous message",
            "timestamp": "2026-02-09T12:33:56Z"
          }
        ]
      }
    ],
    "hasMore": false
  }
  ```

#### Send Agent Response
- **Endpoint:** `POST /agent/responses`
- **Description:** Send agent responses to multiple messages
- **Authentication:** Agent JWT
- **Request Body:**
  ```json
  {
    "responses": [
      {
        "messageId": "msg_123456",
        "roomId": "room_123456",
        "content": "This is my response",
        "attachments": []
      }
    ]
  }
  ```
- **Response:** 
  ```json
  {
    "success": true,
    "processed": 1,
    "failed": 0,
    "responseIds": ["resp_123456"]
  }
  ```

## Subscription Endpoints

### Payment Management

#### Get Subscription Tiers
- **Endpoint:** `GET /subscriptions/tiers`
- **Description:** Get available subscription tiers
- **Response:** 
  ```json
  {
    "tiers": [
      {
        "id": "tier_free",
        "name": "Free",
        "price": 0,
        "currency": "USD",
        "limits": {
          "messagesPerHour": 3,
          "priorityProcessing": false
        }
      },
      {
        "id": "tier_premium",
        "name": "Premium",
        "price": 9.99,
        "currency": "USD",
        "interval": "month",
        "limits": {
          "messagesPerHour": 20,
          "priorityProcessing": true
        }
      }
    ]
  }
  ```

#### Create Subscription
- **Endpoint:** `POST /subscriptions`
- **Description:** Create a new subscription
- **Authentication:** User JWT
- **Request Body:**
  ```json
  {
    "tierId": "tier_premium",
    "paymentMethodId": "pm_123456",
    "couponCode": "WELCOME20"
  }
  ```
- **Response:** 
  ```json
  {
    "subscriptionId": "sub_123456",
    "status": "active",
    "currentPeriodEnd": "2026-03-09T12:34:56Z",
    "tier": {
      "id": "tier_premium",
      "name": "Premium"
    }
  }
  ```

#### Get User Subscription
- **Endpoint:** `GET /subscriptions/current`
- **Description:** Get current user's subscription
- **Authentication:** User JWT
- **Response:** 
  ```json
  {
    "subscriptionId": "sub_123456",
    "status": "active",
    "currentPeriodEnd": "2026-03-09T12:34:56Z",
    "tier": {
      "id": "tier_premium",
      "name": "Premium",
      "limits": {
        "messagesPerHour": 20,
        "priorityProcessing": true
      }
    },
    "usage": {
      "messagesThisHour": 5,
      "messagesThisMonth": 120
    }
  }
  ```

## Analytics Endpoints

#### Get Agent Analytics
- **Endpoint:** `GET /analytics/agent`
- **Description:** Get analytics for agent rooms
- **Authentication:** Agent JWT
- **Query Parameters:**
  - `period`: "day", "week", "month" (default: "day")
  - `roomId`: Optional room filter
- **Response:** 
  ```json
  {
    "period": "day",
    "date": "2026-02-09",
    "metrics": {
      "totalMessages": 245,
      "uniqueUsers": 42,
      "responseTime": {
        "average": 180,
        "p95": 300
      },
      "userTiers": {
        "free": 35,
        "premium": 7
      },
      "activeHours": [
        {"hour": 9, "count": 25},
        {"hour": 10, "count": 35}
      ]
    }
  }
  ```

## Error Handling
All endpoints return standard error responses:

```json
{
  "error": true,
  "code": "RESOURCE_NOT_FOUND",
  "message": "The requested resource could not be found",
  "statusCode": 404
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Invalid request parameters
- `RATE_LIMITED`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error