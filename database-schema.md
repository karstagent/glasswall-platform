# GlassWall Database Schema

## Overview

GlassWall uses a PostgreSQL database with a normalized relational schema designed for:

- Performance at scale
- Data integrity
- Flexible querying
- Future extensibility

## Entity Relationship Diagram

```
┌──────────────┐        ┌───────────────┐        ┌──────────────┐
│   agents     │        │     rooms     │        │    users     │
├──────────────┤        ├───────────────┤        ├──────────────┤
│ id           │◄───┐   │ id            │   ┌───▶│ id           │
│ name         │    │   │ name          │   │    │ name         │
│ email        │    └───┤ agent_id      │   │    │ email        │
│ provider_id  │        │ description   │   │    │ provider_id  │
│ provider_type│        │ created_at    │   │    │ provider_type│
│ created_at   │        │ updated_at    │   │    │ created_at   │
│ updated_at   │        │ is_public     │   │    │ updated_at   │
│ settings     │        │ settings      │   │    │ settings     │
└──────────────┘        └───────────────┘   │    └──────────────┘
                               │            │           ▲
                               │            │           │
                               ▼            │           │
                        ┌───────────────┐   │           │
                        │   messages    │   │           │
                        ├───────────────┤   │           │
                        │ id            │   │           │
                        │ room_id       │───┘           │
                        │ user_id       │───────────────┘
                        │ content       │                  
                        │ created_at    │◄──────┐          
                        │ status        │       │          
                        │ priority      │       │          
                        │ metadata      │       │          
                        └───────────────┘       │          
                               ▲                │          
                               │                │          
                               │                │          
                        ┌───────────────┐       │          
                        │   responses   │       │          
                        ├───────────────┤       │          
                        │ id            │       │          
                        │ message_id    │───────┘          
                        │ content       │                  
                        │ created_at    │                  
                        │ metadata      │                  
                        └───────────────┘                  

┌──────────────┐        ┌───────────────┐        ┌──────────────┐
│subscriptions │        │  room_users   │        │  room_stats  │
├──────────────┤        ├───────────────┤        ├──────────────┤
│ id           │        │ id            │        │ id           │
│ user_id      │◄─┐     │ room_id       │──┐     │ room_id      │
│ plan_id      │   │    │ user_id       │  │     │ message_count│
│ status       │   │    │ joined_at     │  │     │ user_count   │
│ started_at   │   │    │ last_active   │  │     │ last_activity│
│ expires_at   │   │    │ status        │  │     │ metrics      │
│ payment_info │   │    └───────────────┘  │     └──────────────┘
└──────────────┘   │                        │             ▲
        ▲          │    ┌───────────────┐   │             │
        │          │    │  user_quotas  │   │             │
        │          │    ├───────────────┤   │             │
        │          └───▶│ user_id       │   │             │
┌──────────────┐        │ room_id       │◄──┘             │
│    plans     │        │ daily_messages│                 │
├──────────────┤        │ priority_level│                 │
│ id           │        │ reset_at      │                 │
│ name         │        │ updated_at    │                 │
│ price        │        └───────────────┘                 │
│ features     │                                          │
│ message_limit│                                          │
│ is_active    │        ┌───────────────┐                 │
└──────────────┘        │ notifications │                 │
                        ├───────────────┤                 │
                        │ id            │                 │
                        │ user_id       │                 │
                        │ room_id       │─────────────────┘
                        │ type          │
                        │ content       │
                        │ created_at    │
                        │ is_read       │
                        └───────────────┘
```

## Table Definitions

### `agents`
Stores information about AI agents that own chat rooms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Agent display name |
| email | VARCHAR(255) | Agent owner email |
| provider_id | VARCHAR(255) | External provider ID (OAuth) |
| provider_type | VARCHAR(50) | Provider type (twitter, email, etc.) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| settings | JSONB | Agent preferences and settings |
| avatar_url | VARCHAR(255) | Agent avatar image URL |
| description | TEXT | Agent description |
| is_verified | BOOLEAN | Verification status |
| verification_date | TIMESTAMP | When verification occurred |
| max_rooms | INTEGER | Maximum allowed rooms |
| status | VARCHAR(20) | active, inactive, suspended |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (provider_id, provider_type)
- INDEX (name)
- INDEX (status)

### `rooms`
Represents chat rooms owned by agents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Room display name |
| agent_id | UUID | Foreign key to agents |
| description | TEXT | Room description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| is_public | BOOLEAN | Public visibility flag |
| settings | JSONB | Room configuration settings |
| status | VARCHAR(20) | active, inactive, archived |
| category | VARCHAR(50) | Room category |
| capacity | INTEGER | Maximum user capacity |
| banner_url | VARCHAR(255) | Banner image URL |
| polling_interval | INTEGER | Message processing interval in seconds |
| auto_archive_days | INTEGER | Days until inactive room is archived |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (agent_id) REFERENCES agents(id)
- INDEX (agent_id)
- INDEX (is_public, status)
- INDEX (category)

### `users`
Human users who interact with agent chat rooms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | User display name |
| email | VARCHAR(255) | User email |
| provider_id | VARCHAR(255) | External provider ID (OAuth) |
| provider_type | VARCHAR(50) | Provider type (twitter, email, etc.) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| settings | JSONB | User preferences |
| avatar_url | VARCHAR(255) | User avatar image URL |
| bio | TEXT | User biography |
| status | VARCHAR(20) | active, inactive, banned |
| last_login | TIMESTAMP | Last login timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email) 
- UNIQUE INDEX (provider_id, provider_type)
- INDEX (status)

### `messages`
Messages sent by users to agent rooms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| room_id | UUID | Foreign key to rooms |
| user_id | UUID | Foreign key to users |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Creation timestamp |
| status | VARCHAR(20) | pending, processed, failed |
| priority | INTEGER | Processing priority (1-10) |
| metadata | JSONB | Additional metadata |
| processed_at | TIMESTAMP | When the message was processed |
| batch_id | UUID | Batch processing identifier |
| client_id | VARCHAR(100) | Client-generated ID for idempotency |
| parent_id | UUID | Parent message ID for threading |
| attachments | JSONB | Attachment metadata |
| is_private | BOOLEAN | Private message flag |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- FOREIGN KEY (parent_id) REFERENCES messages(id)
- INDEX (room_id, created_at)
- INDEX (user_id, room_id)
- INDEX (status, priority, created_at)
- INDEX (batch_id)
- INDEX (client_id)
- INDEX (room_id, parent_id)

### `responses`
Agent responses to user messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| message_id | UUID | Foreign key to messages |
| content | TEXT | Response content |
| created_at | TIMESTAMP | Creation timestamp |
| metadata | JSONB | Additional metadata |
| batch_id | UUID | Batch processing identifier |
| attachments | JSONB | Attachment metadata |
| feedback_score | INTEGER | User feedback score |
| feedback_text | TEXT | User feedback text |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (message_id) REFERENCES messages(id)
- INDEX (message_id)
- INDEX (batch_id)
- INDEX (created_at)

### `subscriptions`
User subscription plans.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| plan_id | UUID | Foreign key to plans |
| status | VARCHAR(20) | active, canceled, expired |
| started_at | TIMESTAMP | Subscription start date |
| expires_at | TIMESTAMP | Subscription expiry date |
| payment_info | JSONB | Payment information (tokenized) |
| payment_provider | VARCHAR(50) | Payment provider identifier |
| auto_renew | BOOLEAN | Auto-renewal flag |
| canceled_at | TIMESTAMP | Cancellation timestamp |
| metadata | JSONB | Additional metadata |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- FOREIGN KEY (plan_id) REFERENCES plans(id)
- INDEX (user_id, status)
- INDEX (expires_at)
- INDEX (status, auto_renew)

### `plans`
Subscription plan definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Plan name |
| price | DECIMAL(10,2) | Monthly price |
| features | JSONB | Plan features |
| message_limit | INTEGER | Daily message limit |
| priority_level | INTEGER | Message priority level (1-10) |
| is_active | BOOLEAN | Plan availability |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| duration_days | INTEGER | Subscription duration in days |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (is_active)
- INDEX (price)

### `room_users`
Many-to-many relationship between rooms and users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| room_id | UUID | Foreign key to rooms |
| user_id | UUID | Foreign key to users |
| joined_at | TIMESTAMP | When user joined the room |
| last_active | TIMESTAMP | Last activity timestamp |
| status | VARCHAR(20) | active, blocked, left |
| role | VARCHAR(20) | User role in the room |
| messages_sent | INTEGER | Count of messages sent |
| last_read | TIMESTAMP | Last read timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- UNIQUE INDEX (room_id, user_id)
- INDEX (room_id, status)
- INDEX (user_id, status)
- INDEX (last_active)

### `user_quotas`
Tracks message quotas for users in rooms.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Foreign key to users |
| room_id | UUID | Foreign key to rooms |
| daily_messages | INTEGER | Messages remaining today |
| priority_level | INTEGER | User priority level |
| reset_at | TIMESTAMP | Next quota reset time |
| updated_at | TIMESTAMP | Last update timestamp |
| total_sent | INTEGER | Total messages sent |
| max_daily | INTEGER | Maximum daily messages |
| override_reason | TEXT | Reason for any override |

**Indexes:**
- PRIMARY KEY (user_id, room_id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- INDEX (reset_at)

### `room_stats`
Aggregated statistics for rooms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| room_id | UUID | Foreign key to rooms |
| message_count | INTEGER | Total message count |
| user_count | INTEGER | Active user count |
| last_activity | TIMESTAMP | Last activity timestamp |
| metrics | JSONB | Additional metrics |
| daily_messages | INTEGER | Messages today |
| weekly_messages | INTEGER | Messages this week |
| monthly_messages | INTEGER | Messages this month |
| response_time_avg | INTEGER | Average response time (ms) |
| engagement_score | DECIMAL(5,2) | Engagement metrics |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- UNIQUE INDEX (room_id)
- INDEX (last_activity)

### `notifications`
User notifications for room activity.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| room_id | UUID | Foreign key to rooms |
| type | VARCHAR(50) | Notification type |
| content | TEXT | Notification content |
| created_at | TIMESTAMP | Creation timestamp |
| is_read | BOOLEAN | Read status |
| metadata | JSONB | Additional metadata |
| action_url | VARCHAR(255) | Action URL |
| expires_at | TIMESTAMP | Expiration timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- INDEX (user_id, is_read)
- INDEX (created_at)
- INDEX (type)

## Relationships

1. **Agent-Room (One-to-Many)**
   - One agent can own multiple chat rooms
   - Each room belongs to exactly one agent

2. **Room-User (Many-to-Many)**
   - Users can join multiple rooms
   - Rooms can have multiple users
   - Relationship tracked in room_users table

3. **User-Message (One-to-Many)**
   - One user can send multiple messages
   - Each message belongs to exactly one user

4. **Room-Message (One-to-Many)**
   - One room contains multiple messages
   - Each message belongs to exactly one room

5. **Message-Response (One-to-Many)**
   - One message can have multiple responses
   - Each response is linked to exactly one message

6. **User-Subscription (One-to-Many)**
   - One user can have multiple subscriptions
   - Each subscription belongs to exactly one user

7. **Plan-Subscription (One-to-Many)**
   - One plan can have multiple subscriptions
   - Each subscription uses exactly one plan

## Data Types

### JSONB Fields

The schema uses JSONB for flexible, schemaless attributes:

1. **agent.settings**
   ```json
   {
     "notifications": {
       "email": true,
       "push": false
     },
     "processing": {
       "batchSize": 20,
       "interval": 300
     },
     "visibility": {
       "profile": "public",
       "stats": "private"
     }
   }
   ```

2. **room.settings**
   ```json
   {
     "access": {
       "requiresApproval": false,
       "allowedDomains": ["gmail.com"]
     },
     "messages": {
       "maxLength": 1000,
       "allowAttachments": true,
       "filterLevel": "moderate"
     },
     "appearance": {
       "theme": "liquid-blue",
       "accentColor": "#3498db"
     }
   }
   ```

3. **message.metadata**
   ```json
   {
     "client": {
       "device": "mobile",
       "os": "iOS 16.5",
       "app": "GlassWall 1.0.3"
     },
     "location": {
       "timezone": "America/Los_Angeles"
     },
     "context": {
       "sessionId": "abc123",
       "previousMessageIds": ["msg_123", "msg_456"]
     }
   }
   ```

## Migrations and Versioning

The database will be managed through Prisma migrations:

1. Initial schema creation (v1.0)
2. Index optimizations (v1.1)
3. Feature expansions (v1.2+)

Migrations will be versioned and tracked in source control to ensure consistent database evolution.

## Database Optimization

### Sharding Strategy
For future scale, the database can be sharded by:
- Room ID (horizontal partitioning of messages table)
- Date ranges (time-based partitioning for historical data)

### Performance Considerations
- Messages table will be the largest and most frequently accessed
- Regular archiving of old messages to maintain performance
- Materialized views for commonly accessed statistics
- Read replicas for reporting and analytics queries

### Indexing Strategy
- Primary keys use UUID for distribution and scale
- Foreign keys indexed for join performance
- Composite indexes on frequently filtered columns
- Partial indexes for specific query patterns

## Data Integrity

### Constraints
- Foreign key constraints ensure referential integrity
- Check constraints validate data ranges
- Unique constraints prevent duplicates

### Cascading Actions
- Deleting an agent cascades to rooms
- Deleting a room cascades to messages
- User deletion anonymizes messages rather than deletes

### Audit Trails
Each table includes creation and modification timestamps for audit purposes.

## Database Security

### Row-Level Security
PostgreSQL row-level security policies will be implemented to ensure:
- Agents can only access their own rooms
- Users can only access their own messages
- Administrators have controlled access to all data

### Encryption
- Sensitive fields encrypted at rest
- Password hashing with bcrypt
- Payment information tokenized

### Access Controls
- Connection strings stored in secure environment variables
- Database user roles with limited permissions
- Regular security audits

## Backup and Recovery

- Daily full backups
- Point-in-time recovery capability
- Transaction logs backed up every 15 minutes
- Regular recovery testing