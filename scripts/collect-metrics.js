#!/usr/bin/env node

/**
 * GlassWall Metrics Collection Script
 * 
 * This script collects platform metrics from the database and generates
 * reports for monitoring and analysis purposes.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Get the current date
const today = new Date();
const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

// Create metrics directory if it doesn't exist
const metricsDir = path.join(__dirname, '..', 'metrics');
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true });
}

async function collectMetrics() {
  console.log('Starting metrics collection...');
  
  try {
    // Collect user metrics
    const userMetrics = await collectUserMetrics();
    
    // Collect agent metrics
    const agentMetrics = await collectAgentMetrics();
    
    // Collect message metrics
    const messageMetrics = await collectMessageMetrics();
    
    // Collect webhook metrics
    const webhookMetrics = await collectWebhookMetrics();
    
    // Collect queue metrics
    const queueMetrics = await collectQueueMetrics();
    
    // Combine all metrics
    const allMetrics = {
      timestamp: new Date().toISOString(),
      date: dateString,
      users: userMetrics,
      agents: agentMetrics,
      messages: messageMetrics,
      webhooks: webhookMetrics,
      queue: queueMetrics,
    };
    
    // Write metrics to JSON file
    const filePath = path.join(metricsDir, `metrics-${dateString}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allMetrics, null, 2));
    
    console.log(`Metrics collected and saved to ${filePath}`);
    return allMetrics;
    
  } catch (error) {
    console.error('Error collecting metrics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function collectUserMetrics() {
  console.log('Collecting user metrics...');
  
  // Get total user count
  const totalUsers = await prisma.user.count();
  
  // Get new users in the last day
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Get active users in the last day (users who sent messages)
  const activeUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "senderId") 
    FROM "Message" 
    WHERE "senderType" = 'user' 
    AND "createdAt" >= NOW() - INTERVAL '24 HOURS'
  `;
  
  return {
    total: totalUsers,
    new: newUsers,
    active: Number(activeUsers[0].count) || 0,
    retentionRate: totalUsers > 0 ? Number(activeUsers[0].count) / totalUsers * 100 : 0,
  };
}

async function collectAgentMetrics() {
  console.log('Collecting agent metrics...');
  
  // Get total agent count
  const totalAgents = await prisma.agent.count();
  
  // Get verified agent count
  const verifiedAgents = await prisma.agent.count({
    where: {
      verificationStatus: 'verified',
    },
  });
  
  // Get new agents in the last day
  const newAgents = await prisma.agent.count({
    where: {
      createdAt: {
        gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Get active agents in the last day (agents who sent messages)
  const activeAgents = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "senderId") 
    FROM "Message" 
    WHERE "senderType" = 'agent' 
    AND "createdAt" >= NOW() - INTERVAL '24 HOURS'
  `;
  
  return {
    total: totalAgents,
    verified: verifiedAgents,
    new: newAgents,
    active: Number(activeAgents[0].count) || 0,
    verificationRate: totalAgents > 0 ? verifiedAgents / totalAgents * 100 : 0,
  };
}

async function collectMessageMetrics() {
  console.log('Collecting message metrics...');
  
  // Get total message count
  const totalMessages = await prisma.message.count();
  
  // Get messages in the last day
  const recentMessages = await prisma.message.count({
    where: {
      createdAt: {
        gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Get priority message count
  const priorityMessages = await prisma.message.count({
    where: {
      isPriority: true,
    },
  });
  
  // Get priority message count in the last day
  const recentPriorityMessages = await prisma.message.count({
    where: {
      isPriority: true,
      createdAt: {
        gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Get average response time (time between user message and agent response)
  const responseTimeData = await prisma.$queryRaw`
    WITH user_messages AS (
      SELECT id, "roomId", "createdAt"
      FROM "Message"
      WHERE "senderType" = 'user'
      AND "createdAt" >= NOW() - INTERVAL '24 HOURS'
    ),
    agent_responses AS (
      SELECT m.id, m."roomId", m."createdAt", 
        (SELECT MAX(um."createdAt") 
         FROM user_messages um 
         WHERE um."roomId" = m."roomId" AND um."createdAt" < m."createdAt") as prev_message_time
      FROM "Message" m
      WHERE m."senderType" = 'agent'
      AND m."createdAt" >= NOW() - INTERVAL '24 HOURS'
    )
    SELECT AVG(EXTRACT(EPOCH FROM ("createdAt" - prev_message_time))) as avg_response_time
    FROM agent_responses
    WHERE prev_message_time IS NOT NULL
  `;
  
  const avgResponseTimeSeconds = Number(responseTimeData[0].avg_response_time) || 0;
  
  return {
    total: totalMessages,
    recent: recentMessages,
    priority: {
      total: priorityMessages,
      recent: recentPriorityMessages,
      percentage: totalMessages > 0 ? priorityMessages / totalMessages * 100 : 0,
    },
    avgResponseTimeSeconds,
  };
}

async function collectWebhookMetrics() {
  console.log('Collecting webhook metrics...');
  
  // Get total webhook count
  const totalWebhooks = await prisma.webhookConfig.count();
  
  // Get enabled webhook count
  const enabledWebhooks = await prisma.webhookConfig.count({
    where: {
      enabled: true,
    },
  });
  
  // Get webhook delivery count
  const totalDeliveries = await prisma.webhookDelivery.count();
  
  // Get successful webhook delivery count
  const successfulDeliveries = await prisma.webhookDelivery.count({
    where: {
      status: 'success',
    },
  });
  
  // Get failed webhook delivery count
  const failedDeliveries = await prisma.webhookDelivery.count({
    where: {
      status: 'failed',
    },
  });
  
  // Get recent webhook delivery count
  const recentDeliveries = await prisma.webhookDelivery.count({
    where: {
      createdAt: {
        gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });
  
  return {
    configs: {
      total: totalWebhooks,
      enabled: enabledWebhooks,
    },
    deliveries: {
      total: totalDeliveries,
      recent: recentDeliveries,
      successful: successfulDeliveries,
      failed: failedDeliveries,
      successRate: totalDeliveries > 0 ? successfulDeliveries / totalDeliveries * 100 : 0,
    },
  };
}

async function collectQueueMetrics() {
  console.log('Collecting queue metrics...');
  
  // Get total queue item count
  const totalItems = await prisma.queueItem.count();
  
  // Get queue items by status
  const pendingItems = await prisma.queueItem.count({
    where: {
      status: 'pending',
    },
  });
  
  const processingItems = await prisma.queueItem.count({
    where: {
      status: 'processing',
    },
  });
  
  const completedItems = await prisma.queueItem.count({
    where: {
      status: 'completed',
    },
  });
  
  const failedItems = await prisma.queueItem.count({
    where: {
      status: 'failed',
    },
  });
  
  // Get priority queue items
  const priorityItems = await prisma.queueItem.count({
    where: {
      isPriority: true,
    },
  });
  
  // Get standard queue items
  const standardItems = await prisma.queueItem.count({
    where: {
      isPriority: false,
    },
  });
  
  // Get average processing time for completed items
  const processingTimeData = await prisma.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM ("processedAt" - "createdAt"))) as avg_processing_time
    FROM "QueueItem"
    WHERE "status" = 'completed'
    AND "processedAt" IS NOT NULL
    AND "createdAt" >= NOW() - INTERVAL '24 HOURS'
  `;
  
  const avgProcessingTimeSeconds = Number(processingTimeData[0].avg_processing_time) || 0;
  
  return {
    total: totalItems,
    byStatus: {
      pending: pendingItems,
      processing: processingItems,
      completed: completedItems,
      failed: failedItems,
    },
    byPriority: {
      priority: priorityItems,
      standard: standardItems,
      priorityPercentage: totalItems > 0 ? priorityItems / totalItems * 100 : 0,
    },
    avgProcessingTimeSeconds,
    completionRate: totalItems > 0 ? completedItems / totalItems * 100 : 0,
  };
}

// Run the metrics collection if the script is executed directly
if (require.main === module) {
  collectMetrics()
    .then(() => {
      console.log('Metrics collection completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in metrics collection:', error);
      process.exit(1);
    });
}

module.exports = collectMetrics;