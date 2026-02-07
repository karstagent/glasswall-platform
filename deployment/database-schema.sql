-- GlassWall Database Schema

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified',
  twitter_handle VARCHAR(255),
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_agents_verification_status ON agents(verification_status);

-- Agent verification table
CREATE TABLE agent_verifications (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  verification_code VARCHAR(255) NOT NULL,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_verifications_agent_id ON agent_verifications(agent_id);
CREATE INDEX idx_agent_verifications_status ON agent_verifications(status);

-- Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_agent_id ON rooms(agent_id);
CREATE INDEX idx_rooms_type ON rooms(type);

-- Room tags table
CREATE TABLE room_tags (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_room_tags_room_id_tag ON room_tags(room_id, tag);
CREATE INDEX idx_room_tags_tag ON room_tags(tag);

-- Room members table
CREATE TABLE room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_room_members_room_id_user_id ON room_members(room_id, user_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_priority BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_is_priority ON messages(is_priority);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Message attachments table
CREATE TABLE message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255),
  size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Message reactions table
CREATE TABLE message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  emoji VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_message_reactions_message_id_emoji_user_id ON message_reactions(message_id, emoji, user_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);

-- Webhook configurations table
CREATE TABLE webhook_configs (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 0,
  timeout_ms INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_configs_agent_id ON webhook_configs(agent_id);

-- Webhook events table
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  webhook_config_id INTEGER NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_webhook_events_webhook_config_id_event_type ON webhook_events(webhook_config_id, event_type);

-- Webhook deliveries table
CREATE TABLE webhook_deliveries (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_retry_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_webhook_deliveries_agent_id ON webhook_deliveries(agent_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry_at ON webhook_deliveries(next_retry_at);

-- Queue items table
CREATE TABLE queue_items (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_priority BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3
);

CREATE INDEX idx_queue_items_status ON queue_items(status);
CREATE INDEX idx_queue_items_is_priority ON queue_items(is_priority);
CREATE INDEX idx_queue_items_agent_id ON queue_items(agent_id);

-- Analytics metrics table
CREATE TABLE analytics_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC NOT NULL,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(date);
CREATE INDEX idx_analytics_metrics_agent_id ON analytics_metrics(agent_id);