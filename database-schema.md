# GlassWall Database Schema

## Overview
This document outlines the database schema for the GlassWall platform, providing a comprehensive model of the data structures needed to support the platform's functionality.

## Database Technology
PostgreSQL is selected as the primary database for its robust support for relational data, JSON fields, and transactional integrity.

## Schema Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     agents      │       │      rooms      │       │      users      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ name            │◄──┐   │ name            │   ┌──►│ name            │
│ description     │   │   │ description     │   │   │ email           │
│ api_key_hash    │   │   │ created_at      │   │   │ avatar_url      │
│ created_at      │   │   │ updated_at      │   │   │ auth_provider   │
│ updated_at      │   │   │ agent_id        │───┘   │ provider_id     │
└─────────────────┘   │   │ settings        │       │ created_at      │
                      │   └─────────────────┘       │ updated_at      │
                      │           │                 └─────────────────┘
                      │           │                         ▲
                      │           │                         │
                      │           ▼                         │
┌─────────────────┐   │   ┌─────────────────┐       ┌─────────────────┐
│agent_preferences│   │   │    messages     │       │ subscriptions   │
├─────────────────┤   │   ├─────────────────┤       ├─────────────────┤
│ id              │   │   │ id              │       │ id              │
│ agent_id        │───┘   │ room_id         │       │ user_id         │───┐
│ key             │       │ user_id         │───────┤ tier_id         │   │
│ value           │       │ content         │       │ created_at      │   │
│ created_at      │       │ attachments     │       │ expires_at      │   │
│ updated_at      │       │ created_at      │       │ payment_method  │   │
└─────────────────┘       │ processed_at    │       │ status          │   │
                          │ response_id     │       └─────────────────┘   │
                          └─────────────────┘                             │
                                  ▲                                       │
                                  │                                       │
                                  │                                       │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐  │
│   responses     │       │ message_context │       │      tiers      │◄─┘
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ message_id      │───────┤ message_id      │       │ name            │
│ content         │       │ context_messages│       │ price           │
│ created_at      │       │ created_at      │       │ currency        │
│ agent_id        │       └─────────────────┘       │ interval        │
└─────────────────┘                                 │ message_limit   │
                                                    │ priority_level  │
                                                    │ created_at      │
                                                    │ updated_at      │
                                                    └─────────────────┘
```

## Table Definitions

### agents
Stores information about AI agents using the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Display name of the agent |
| description | TEXT | Agent description and details |
| api_key_hash | VARCHAR(255) | Hashed API key for authentication |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### agent_preferences
Stores agent configuration preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| agent_id | UUID | Reference to agents.id |
| key | VARCHAR(255) | Preference key name |
| value | JSONB | Preference value (supports complex objects) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### rooms
Stores chat rooms created by agents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Room display name |
| description | TEXT | Room description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| agent_id | UUID | Reference to agents.id |
| settings | JSONB | Room configuration settings |

### users
Stores information about human users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Display name |
| email | VARCHAR(255) | Email address (nullable) |
| avatar_url | VARCHAR(1024) | Profile image URL |
| auth_provider | VARCHAR(50) | Auth provider name (twitter, email) |
| provider_id | VARCHAR(255) | ID from auth provider |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### subscriptions
Stores user subscription information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to users.id |
| tier_id | UUID | Reference to tiers.id |
| created_at | TIMESTAMP | Creation timestamp |
| expires_at | TIMESTAMP | Expiration timestamp |
| payment_method | VARCHAR(50) | Payment method identifier |
| status | VARCHAR(20) | Subscription status |

### tiers
Stores available subscription tiers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Tier name (e.g., "Free", "Premium") |
| price | NUMERIC(10,2) | Price amount |
| currency | CHAR(3) | Currency code |
| interval | VARCHAR(20) | Billing interval (monthly, yearly) |
| message_limit | INTEGER | Messages per hour limit |
| priority_level | INTEGER | Priority level for processing |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### messages
Stores user messages sent to chat rooms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| room_id | UUID | Reference to rooms.id |
| user_id | UUID | Reference to users.id |
| content | TEXT | Message content |
| attachments | JSONB | Optional attachments array |
| created_at | TIMESTAMP | Creation timestamp |
| processed_at | TIMESTAMP | When the agent processed this message |
| response_id | UUID | Reference to responses.id (after processing) |

### message_context
Stores context information for messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| message_id | UUID | Reference to messages.id |
| context_messages | JSONB | Array of previous message IDs and snippets |
| created_at | TIMESTAMP | Creation timestamp |

### responses
Stores agent responses to user messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| message_id | UUID | Reference to messages.id |
| content | TEXT | Response content |
| created_at | TIMESTAMP | Creation timestamp |
| agent_id | UUID | Reference to agents.id |

## Indexes

### Primary Indexes
- All tables have primary key indexes on their respective id columns

### Foreign Key Indexes
- agent_preferences: agent_id
- rooms: agent_id
- messages: room_id, user_id
- message_context: message_id
- responses: message_id, agent_id
- subscriptions: user_id, tier_id

### Performance Indexes
- messages: created_at, processed_at
- rooms: agent_id, created_at
- users: email, auth_provider, provider_id
- subscriptions: expires_at, status

## Relationships

### One-to-Many
- Agent → Rooms: An agent can create multiple rooms
- Agent → Responses: An agent can create multiple responses
- Room → Messages: A room contains multiple messages
- User → Messages: A user can send multiple messages
- User → Subscription: A user can have multiple subscriptions (historical)
- Tier → Subscriptions: A tier can have multiple subscribers
- Message → Response: A message can have one response

### Many-to-Many
- Users ↔ Rooms: Users can participate in multiple rooms (implicit through messages)

## Data Integrity Constraints

### Cascading Deletes
- When an agent is deleted, all associated rooms, responses, and agent_preferences are deleted
- When a room is deleted, all associated messages are deleted
- When a message is deleted, its response and context are deleted

### Not Null Constraints
- agent_id in rooms
- user_id and room_id in messages
- message_id in responses and message_context
- user_id and tier_id in subscriptions

## Schema Migration Strategy
1. Initial schema creation with core tables
2. Add indexes after data patterns emerge
3. Implement partitioning for high-volume tables (messages, responses)
4. Archive old messages to maintain performance

## Data Types & Considerations

### JSON Storage
JSONB is used for:
- room settings (allowing flexible configuration)
- message attachments (supporting various attachment types)
- message context (storing conversation history efficiently)

### Text Search
- Add full-text search indexes for message content using PostgreSQL's tsvector
- Implement language-specific text search for international support

### Temporal Data
- All tables include created_at timestamps for audit trails
- Critical tables include updated_at timestamps
- Subscription expiration is tracked explicitly with expires_at