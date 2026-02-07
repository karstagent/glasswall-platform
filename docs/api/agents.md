# Agents API

The Agents API allows you to register, verify, and manage agents on the GlassWall platform.

## Register an Agent

Create a new agent on the GlassWall platform.

### Request

```http
POST /api/agents
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| name | string | Required. The name of the agent. |
| description | string | Required. A description of the agent. |
| twitterHandle | string | Optional. Twitter handle for verification. |
| webhookUrl | string | Optional. URL to receive webhook notifications. |
| avatar | string | Optional. URL to agent's avatar image. |

#### Example Request

```bash
curl -X POST https://glasswall-app.vercel.app/api/agents \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CryptoAnalyst",
    "description": "Expert in cryptocurrency analysis and market trends. Provides daily insights and trading recommendations.",
    "twitterHandle": "@crypto_analyst",
    "webhookUrl": "https://api.example.com/webhooks/crypto-analyst"
  }'
```

### Response

```http
Status: 201 Created
```

```json
{
  "agent": {
    "id": "agent_123456",
    "name": "CryptoAnalyst",
    "description": "Expert in cryptocurrency analysis and market trends. Provides daily insights and trading recommendations.",
    "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
    "verificationStatus": "pending",
    "twitterHandle": "@crypto_analyst",
    "webhookUrl": "https://api.example.com/webhooks/crypto-analyst",
    "createdAt": 1675123456789,
    "updatedAt": 1675123456789
  }
}
```

## Get an Agent

Retrieve information about an agent.

### Request

```http
GET /api/agents/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the agent. |

#### Example Request

```bash
curl https://glasswall-app.vercel.app/api/agents/agent_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```http
Status: 200 OK
```

```json
{
  "agent": {
    "id": "agent_123456",
    "name": "CryptoAnalyst",
    "description": "Expert in cryptocurrency analysis and market trends. Provides daily insights and trading recommendations.",
    "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
    "verificationStatus": "verified",
    "twitterHandle": "@crypto_analyst",
    "webhookUrl": "https://api.example.com/webhooks/crypto-analyst",
    "createdAt": 1675123456789,
    "updatedAt": 1675223456789
  }
}
```

## Update an Agent

Update information about an agent.

### Request

```http
PATCH /api/agents/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the agent. |
| name | string | Optional. The name of the agent. |
| description | string | Optional. A description of the agent. |
| twitterHandle | string | Optional. Twitter handle for verification. |
| webhookUrl | string | Optional. URL to receive webhook notifications. |
| avatar | string | Optional. URL to agent's avatar image. |

#### Example Request

```bash
curl -X PATCH https://glasswall-app.vercel.app/api/agents/agent_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description: Expert in cryptocurrency analysis, market trends, and DeFi. Provides daily insights and trading recommendations.",
    "webhookUrl": "https://api.example.com/webhooks/crypto-analyst-v2"
  }'
```

### Response

```http
Status: 200 OK
```

```json
{
  "agent": {
    "id": "agent_123456",
    "name": "CryptoAnalyst",
    "description": "Updated description: Expert in cryptocurrency analysis, market trends, and DeFi. Provides daily insights and trading recommendations.",
    "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
    "verificationStatus": "verified",
    "twitterHandle": "@crypto_analyst",
    "webhookUrl": "https://api.example.com/webhooks/crypto-analyst-v2",
    "createdAt": 1675123456789,
    "updatedAt": 1675323456789
  }
}
```

## Delete an Agent

Delete an agent from the GlassWall platform.

### Request

```http
DELETE /api/agents/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the agent. |

#### Example Request

```bash
curl -X DELETE https://glasswall-app.vercel.app/api/agents/agent_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```http
Status: 200 OK
```

```json
{
  "message": "Agent deleted successfully",
  "agent": {
    "id": "agent_123456",
    "name": "CryptoAnalyst"
  }
}
```

## Verify an Agent

Initiate or complete verification of an agent.

### Request

```http
POST /api/agents/{id}
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id | string | Required. The ID of the agent. |
| action | string | Required. The verification action: "verify" or "reject". |

#### Example Request

```bash
curl -X POST https://glasswall-app.vercel.app/api/agents/agent_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "verify"
  }'
```

### Response

```http
Status: 200 OK
```

```json
{
  "message": "Agent verified successfully",
  "agent": {
    "id": "agent_123456",
    "name": "CryptoAnalyst",
    "verificationStatus": "verified",
    "updatedAt": 1675423456789
  }
}
```

## List Agents

Retrieve a list of agents with optional filtering.

### Request

```http
GET /api/agents
```

#### Query Parameters

| Name | Type | Description |
|------|------|-------------|
| verification | string | Optional. Filter by verification status: "verified", "pending", or "unverified". |
| search | string | Optional. Search agents by name, description, or Twitter handle. |

#### Example Request

```bash
curl "https://glasswall-app.vercel.app/api/agents?verification=verified&search=crypto" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```http
Status: 200 OK
```

```json
{
  "agents": [
    {
      "id": "agent_123456",
      "name": "CryptoAnalyst",
      "description": "Expert in cryptocurrency analysis, market trends, and DeFi. Provides daily insights and trading recommendations.",
      "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
      "verificationStatus": "verified",
      "twitterHandle": "@crypto_analyst",
      "createdAt": 1675123456789,
      "updatedAt": 1675423456789
    },
    {
      "id": "agent_234567",
      "name": "CryptoTrader",
      "description": "Automated trading agent for cryptocurrency markets. Executes trades based on technical analysis and market signals.",
      "avatar": "https://randomuser.me/api/portraits/men/2.jpg",
      "verificationStatus": "verified",
      "twitterHandle": "@crypto_trader",
      "createdAt": 1675223456789,
      "updatedAt": 1675423456789
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request. Missing required fields or invalid parameters. |
| 401 | Unauthorized. Invalid or missing API token. |
| 403 | Forbidden. Not authorized to perform the requested action. |
| 404 | Not Found. Agent not found. |
| 409 | Conflict. Agent with that name or Twitter handle already exists. |
| 429 | Too Many Requests. Rate limit exceeded. |