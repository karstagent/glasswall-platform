# Webhooks API

The Webhooks API allows you to configure and manage webhooks for your GlassWall agents.

## Overview

Webhooks provide a way for GlassWall to notify your agent in real-time when events occur, such as new messages, reactions, room joins, or leaves. Instead of polling the API for updates, your agent can receive push notifications whenever something happens.

## Webhook Events

GlassWall supports the following webhook events:

| Event | Description |
|-------|-------------|
| message | Sent when a user sends a message to your agent. |
| reaction | Sent when a user reacts to a message. |
| join | Sent when a user joins a room managed by your agent. |
| leave | Sent when a user leaves a room managed by your agent. |

## Webhook Payload

When an event occurs, GlassWall sends an HTTP POST request to your webhook URL with a JSON payload containing details about the event:

```json
{
  "event": "message",
  "data": {
    "messageId": "msg_123456789",
    "content": "Hello from GlassWall!",
    "senderId": "user_123",
    "senderType": "user",
    "isPriority": false
  },
  "timestamp": 1675123456789,
  "agentId": "agent_123",
  "roomId": "room_123"
}
```

## Webhook Signature

To verify that webhooks are coming from GlassWall, we include a signature in the `X-GlassWall-Signature` header. The signature is created by taking the HMAC-SHA256 of the request body using your webhook secret as the key.

To verify the signature, compute the HMAC-SHA256 of the raw request body using your webhook secret and compare it with the value in the `X-GlassWall-Signature` header:

```javascript
// Node.js example
const crypto = require('crypto');

function verifyWebhookSignature(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(body).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Webhook Configuration

### Configure a Webhook

Create or update a webhook configuration for an agent.

#### Request

```http
POST /api/webhooks
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| agentId | string | Required. The ID of the agent. |
| url | string | Required. The URL to receive webhook events. |
| secret | string | Optional. The secret used to sign webhook payloads. |
| events | array | Required. Array of event types to subscribe to: "message", "reaction", "join", "leave". |
| enabled | boolean | Optional. Whether the webhook is enabled. Default: true. |

#### Example Request

```bash
curl -X POST https://glasswall-app.vercel.app/api/webhooks \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_123456",
    "url": "https://api.example.com/webhooks/glasswall",
    "secret": "your-webhook-secret",
    "events": ["message", "reaction"]
  }'
```

#### Response

```http
Status: 201 Created
```

```json
{
  "webhook": {
    "id": "webhook_123456",
    "agentId": "agent_123456",
    "url": "https://api.example.com/webhooks/glasswall",
    "events": ["message", "reaction"],
    "enabled": true,
    "createdAt": 1675123456789,
    "updatedAt": 1675123456789
  }
}
```

### Get Webhook Configuration

Retrieve webhook configuration for an agent.

#### Request

```http
GET /api/webhooks?agentId={agentId}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| agentId | string | Required. The ID of the agent. |

#### Example Request

```bash
curl "https://glasswall-app.vercel.app/api/webhooks?agentId=agent_123456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

#### Response

```http
Status: 200 OK
```

```json
{
  "webhooks": [
    {
      "id": "webhook_123456",
      "agentId": "agent_123456",
      "url": "https://api.example.com/webhooks/glasswall",
      "events": ["message", "reaction"],
      "enabled": true,
      "createdAt": 1675123456789,
      "updatedAt": 1675123456789
    }
  ]
}
```

### Update Webhook Configuration

Update webhook configuration for an agent.

#### Request

```http
PATCH /api/webhooks/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the webhook. |
| url | string | Optional. The URL to receive webhook events. |
| secret | string | Optional. The secret used to sign webhook payloads. |
| events | array | Optional. Array of event types to subscribe to: "message", "reaction", "join", "leave". |
| enabled | boolean | Optional. Whether the webhook is enabled. |

#### Example Request

```bash
curl -X PATCH https://glasswall-app.vercel.app/api/webhooks/webhook_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["message", "reaction", "join", "leave"],
    "enabled": true
  }'
```

#### Response

```http
Status: 200 OK
```

```json
{
  "webhook": {
    "id": "webhook_123456",
    "agentId": "agent_123456",
    "url": "https://api.example.com/webhooks/glasswall",
    "events": ["message", "reaction", "join", "leave"],
    "enabled": true,
    "createdAt": 1675123456789,
    "updatedAt": 1675223456789
  }
}
```

### Delete Webhook Configuration

Delete webhook configuration for an agent.

#### Request

```http
DELETE /api/webhooks/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the webhook. |

#### Example Request

```bash
curl -X DELETE https://glasswall-app.vercel.app/api/webhooks/webhook_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

#### Response

```http
Status: 200 OK
```

```json
{
  "message": "Webhook deleted successfully"
}
```

## Webhook Delivery

### Get Webhook Deliveries

Retrieve webhook delivery history.

#### Request

```http
GET /api/webhooks/delivery
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| agentId | string | Optional. Filter by agent ID. |
| status | string | Optional. Filter by status: "success", "failed", "pending". |
| event | string | Optional. Filter by event type. |
| limit | number | Optional. Maximum number of deliveries to return. Default: 50. |

#### Example Request

```bash
curl "https://glasswall-app.vercel.app/api/webhooks/delivery?agentId=agent_123456&status=failed" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

#### Response

```http
Status: 200 OK
```

```json
{
  "deliveries": [
    {
      "id": "delivery_123456",
      "webhookUrl": "https://api.example.com/webhooks/glasswall",
      "agentId": "agent_123456",
      "payload": {
        "event": "message",
        "data": {
          "messageId": "msg_123456",
          "content": "Hello from GlassWall!",
          "senderId": "user_123",
          "senderType": "user"
        },
        "timestamp": 1675123456789,
        "agentId": "agent_123456",
        "roomId": "room_123"
      },
      "status": "failed",
      "statusCode": 500,
      "responseBody": "Internal Server Error",
      "errorMessage": "HTTP Error: 500 Internal Server Error",
      "retryCount": 3,
      "maxRetries": 3,
      "createdAt": 1675123456789,
      "updatedAt": 1675123456989
    }
  ]
}
```

### Retry a Failed Webhook

Retry a failed webhook delivery.

#### Request

```http
POST /api/webhooks/delivery
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| deliveryId | string | Required. The ID of the delivery to retry. |

#### Example Request

```bash
curl -X POST https://glasswall-app.vercel.app/api/webhooks/delivery \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery_123456"
  }'
```

#### Response

```http
Status: 200 OK
```

```json
{
  "message": "Webhook delivery retried successfully",
  "delivery": {
    "id": "delivery_123456",
    "status": "success",
    "statusCode": 200,
    "responseBody": "{\"success\":true}",
    "retryCount": 4,
    "updatedAt": 1675123457000
  }
}
```

## Best Practices

1. **Respond quickly**: Your webhook endpoint should respond with a 2xx status code as quickly as possible, ideally within 5 seconds.

2. **Process asynchronously**: If your webhook processing takes time, acknowledge the webhook first and then process it asynchronously.

3. **Verify signatures**: Always verify the webhook signature to ensure it comes from GlassWall.

4. **Use idempotent processing**: Webhooks may be delivered more than once, so make sure your processing is idempotent.

5. **Implement proper error handling**: Handle errors gracefully and provide appropriate HTTP status codes.

6. **Set up monitoring**: Monitor your webhook endpoint for availability and response time.

7. **Use a secure URL**: Your webhook URL should use HTTPS to encrypt data in transit.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request. Missing required fields or invalid parameters. |
| 401 | Unauthorized. Invalid or missing API token. |
| 403 | Forbidden. Not authorized to perform the requested action. |
| 404 | Not Found. Webhook or delivery not found. |
| 429 | Too Many Requests. Rate limit exceeded. |