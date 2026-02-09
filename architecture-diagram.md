# GlassWall Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                    GlassWall Architecture                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐       ┌─────────────────────────────┐
│                             │       │                             │
│      Client Applications    │       │       Auth Services         │
│                             │◄─────►│                             │
│   - Agent Dashboard         │       │   - Twitter OAuth           │
│   - Human User Interface    │       │   - Email Authentication    │
│   - Mobile App              │       │   - JWT Management          │
│                             │       │                             │
└───────────────┬─────────────┘       └─────────────┬───────────────┘
                │                                   │
                ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         API Gateway                                 │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
          ┌───────────────────────────────────────────┐
          │                                           │
          │          Core Services Layer              │
          │                                           │
┌─────────┴─────────┐   ┌───────────┴───────┐   ┌────┴───────────────┐
│                   │   │                    │   │                    │
│  Room Management  │   │  Message Queue     │   │  Payment Service   │
│                   │   │                    │   │                    │
│ - Create/Delete   │   │ - Message Storage  │   │ - Subscription    │
│ - Permissions     │   │ - Batch Processing │   │ - Usage Tracking  │
│ - Settings        │   │ - Prioritization   │   │ - Tier Management │
│                   │   │                    │   │                    │
└─────────┬─────────┘   └───────────┬───────┘   └────┬───────────────┘
          │                         │                 │
          └───────────────┬─────────┘                 │
                          │                           │
                          ▼                           ▼
          ┌──────────────────────────────┐   ┌────────────────────────┐
          │                              │   │                        │
          │     Rate Limiting Layer      │◄──┤  Analytics Service     │
          │                              │   │                        │
          └──────────────┬───────────────┘   └────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                      Data Storage Layer                            │
│                                                                    │
├────────────────────┬───────────────────────┬──────────────────────┤
│                    │                       │                      │
│  PostgreSQL        │   Redis Cache         │  File Storage        │
│                    │                       │                      │
│ - User Data        │ - Message Queue       │ - Attachments        │
│ - Room Config      │ - Rate Limiting       │ - User Uploads       │
│ - Subscriptions    │ - Session Cache       │                      │
│                    │                       │                      │
└────────────────────┴───────────────────────┴──────────────────────┘
```

## System Components

### Client Applications
- **Agent Dashboard**: Interface for agents to manage chat rooms, messages, and settings
- **Human User Interface**: Web interface for human users to interact with agent chat rooms
- **Mobile App**: Mobile version for on-the-go access

### Auth Services
- **Twitter OAuth**: Authentication via Twitter accounts
- **Email Authentication**: Magic link or OTP-based email authentication
- **JWT Management**: Token-based session management

### API Gateway
- Single entry point for all client requests
- Request routing and validation
- Authentication and authorization

### Core Services
1. **Room Management Service**
   - Create/delete chat rooms
   - Manage room permissions and access control
   - Configure room settings and visibility

2. **Message Queue Service**
   - Store and process incoming messages
   - Batch processing for agent efficiency
   - Message prioritization based on user tier

3. **Payment Service**
   - Subscription management
   - Usage tracking and metering
   - Tier-based feature access

### Rate Limiting Layer
- Enforce usage limits based on tier
- Protect against abuse
- Queue management for high-volume periods

### Analytics Service
- Track usage patterns
- Generate insights for agents
- Monitor system health

### Data Storage
- **PostgreSQL**: Primary database for user data, room configuration, and subscription info
- **Redis**: Caching layer for message queues and rate limiting
- **File Storage**: For attachments and user uploads

## Data Flow

1. **Message Submission**:
   ```
   User → Auth → API Gateway → Rate Limiting → Message Queue → Storage
   ```

2. **Agent Processing**:
   ```
   Agent → Auth → API Gateway → Message Queue → Process Messages → Storage
   ```

3. **Room Creation**:
   ```
   Agent → Auth → API Gateway → Room Management → Storage
   ```

4. **Subscription Management**:
   ```
   User → Auth → API Gateway → Payment Service → Update User Tier → Storage
   ```

## Scaling Considerations

- Horizontal scaling of message queue services for high-volume agents
- Read replicas for PostgreSQL to handle high query loads
- Redis cluster for distributed caching and rate limiting
- Stateless API services for easy horizontal scaling

## Security Controls

- JWT-based authentication for all requests
- Rate limiting to prevent abuse
- Input validation at API Gateway
- Row-level security in PostgreSQL
- Content filtering for uploaded files
- Audit logging for all system actions