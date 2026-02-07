import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

// Mock data
const mockAgent = {
  id: `agent_${uuidv4()}`,
  name: 'Test Agent',
  description: 'Test agent for integration tests',
  verificationStatus: 'unverified',
};

const mockRoom = {
  id: `room_${uuidv4()}`,
  name: 'Test Room',
  description: 'Test room for integration tests',
  type: 'public',
  agentId: mockAgent.id,
};

const mockUser = {
  id: `user_${uuidv4()}`,
  name: 'Test User',
  email: 'test@example.com',
};

const mockMessage = {
  id: `msg_${uuidv4()}`,
  content: 'Test message',
  roomId: mockRoom.id,
  senderId: mockUser.id,
  senderType: 'user',
  isPriority: false,
};

// Setup test server
let server: any;
let prisma: PrismaClient;
let baseUrl: string;

beforeAll(async () => {
  // Initialize Prisma client
  prisma = new PrismaClient();
  
  // Create a test server
  server = createServer(async (req, res) => {
    try {
      // Get the API route path from the request URL
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;
      
      // Route to the appropriate API handler
      if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api/', '');
        const handler = require(`../../src/app/api/${apiPath}/route`);
        await apiResolver(req, res, url.query, handler, {}, false);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // Start the server on a random port
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      baseUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
  
  // Seed the test database
  await seedTestDatabase();
});

afterAll(async () => {
  // Close the server
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  
  // Clean up the test database
  await cleanupTestDatabase();
  
  // Close the Prisma client
  await prisma.$disconnect();
});

// Seed the test database with mock data
async function seedTestDatabase() {
  // Create test agent
  await prisma.agent.create({
    data: {
      id: mockAgent.id,
      name: mockAgent.name,
      description: mockAgent.description,
      verificationStatus: mockAgent.verificationStatus,
    },
  });
  
  // Create test room
  await prisma.room.create({
    data: {
      id: mockRoom.id,
      name: mockRoom.name,
      description: mockRoom.description,
      type: mockRoom.type,
      agentId: mockAgent.id,
    },
  });
  
  // Create test user
  await prisma.user.create({
    data: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    },
  });
}

// Clean up the test database
async function cleanupTestDatabase() {
  // Delete test message if it exists
  await prisma.message.deleteMany({
    where: { id: mockMessage.id },
  });
  
  // Delete test user
  await prisma.user.delete({
    where: { id: mockUser.id },
  });
  
  // Delete test room
  await prisma.room.delete({
    where: { id: mockRoom.id },
  });
  
  // Delete test agent
  await prisma.agent.delete({
    where: { id: mockAgent.id },
  });
}

// Test the Agents API
describe('Agents API', () => {
  it('should get a list of agents', async () => {
    const response = await fetch(`${baseUrl}/api/agents`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.agents)).toBe(true);
    
    // Check if our test agent is in the list
    const testAgent = data.agents.find((agent: any) => agent.id === mockAgent.id);
    expect(testAgent).toBeDefined();
    expect(testAgent.name).toBe(mockAgent.name);
  });
  
  it('should get a specific agent by ID', async () => {
    const response = await fetch(`${baseUrl}/api/agents/${mockAgent.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.agent).toBeDefined();
    expect(data.agent.id).toBe(mockAgent.id);
    expect(data.agent.name).toBe(mockAgent.name);
    expect(data.agent.description).toBe(mockAgent.description);
  });
  
  it('should return 404 for non-existent agent', async () => {
    const response = await fetch(`${baseUrl}/api/agents/non-existent-id`);
    expect(response.status).toBe(404);
  });
  
  it('should create a new agent', async () => {
    const newAgent = {
      name: 'New Test Agent',
      description: 'A new test agent for integration tests',
    };
    
    const response = await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAgent),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.agent).toBeDefined();
    expect(data.agent.name).toBe(newAgent.name);
    expect(data.agent.description).toBe(newAgent.description);
    
    // Clean up the new agent
    await prisma.agent.delete({
      where: { id: data.agent.id },
    });
  });
});

// Test the Rooms API
describe('Rooms API', () => {
  it('should get a list of rooms', async () => {
    const response = await fetch(`${baseUrl}/api/rooms`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.rooms)).toBe(true);
    
    // Check if our test room is in the list
    const testRoom = data.rooms.find((room: any) => room.id === mockRoom.id);
    expect(testRoom).toBeDefined();
    expect(testRoom.name).toBe(mockRoom.name);
  });
  
  it('should filter rooms by agent ID', async () => {
    const response = await fetch(`${baseUrl}/api/rooms?agentId=${mockAgent.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.rooms)).toBe(true);
    
    // All rooms should belong to our test agent
    data.rooms.forEach((room: any) => {
      expect(room.agentId).toBe(mockAgent.id);
    });
    
    // Our test room should be in the list
    const testRoom = data.rooms.find((room: any) => room.id === mockRoom.id);
    expect(testRoom).toBeDefined();
  });
  
  it('should get a specific room by ID', async () => {
    const response = await fetch(`${baseUrl}/api/rooms/${mockRoom.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.room).toBeDefined();
    expect(data.room.id).toBe(mockRoom.id);
    expect(data.room.name).toBe(mockRoom.name);
    expect(data.room.description).toBe(mockRoom.description);
    expect(data.room.agentId).toBe(mockAgent.id);
  });
  
  it('should create a new room', async () => {
    const newRoom = {
      name: 'New Test Room',
      description: 'A new test room for integration tests',
      type: 'public',
      agentId: mockAgent.id,
    };
    
    const response = await fetch(`${baseUrl}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRoom),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.room).toBeDefined();
    expect(data.room.name).toBe(newRoom.name);
    expect(data.room.description).toBe(newRoom.description);
    expect(data.room.agentId).toBe(mockAgent.id);
    
    // Clean up the new room
    await prisma.room.delete({
      where: { id: data.room.id },
    });
  });
});

// Test the Messages API
describe('Messages API', () => {
  // Create a test message before each test
  beforeEach(async () => {
    await prisma.message.create({
      data: {
        id: mockMessage.id,
        content: mockMessage.content,
        roomId: mockMessage.roomId,
        senderId: mockMessage.senderId,
        senderType: mockMessage.senderType,
        isPriority: mockMessage.isPriority,
      },
    });
  });
  
  // Delete the test message after each test
  afterEach(async () => {
    await prisma.message.deleteMany({
      where: { id: mockMessage.id },
    });
  });
  
  it('should get messages for a room', async () => {
    const response = await fetch(`${baseUrl}/api/messages?roomId=${mockRoom.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.messages)).toBe(true);
    
    // Check if our test message is in the list
    const testMessage = data.messages.find((message: any) => message.id === mockMessage.id);
    expect(testMessage).toBeDefined();
    expect(testMessage.content).toBe(mockMessage.content);
    expect(testMessage.roomId).toBe(mockRoom.id);
  });
  
  it('should get a specific message by ID', async () => {
    const response = await fetch(`${baseUrl}/api/messages/${mockMessage.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.message.id).toBe(mockMessage.id);
    expect(data.message.content).toBe(mockMessage.content);
    expect(data.message.roomId).toBe(mockRoom.id);
  });
  
  it('should create a new message', async () => {
    const newMessage = {
      content: 'A new test message',
      roomId: mockRoom.id,
      senderId: mockUser.id,
      senderType: 'user',
    };
    
    const response = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMessage),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.message.content).toBe(newMessage.content);
    expect(data.message.roomId).toBe(newMessage.roomId);
    expect(data.message.senderId).toBe(newMessage.senderId);
    
    // Clean up the new message
    await prisma.message.delete({
      where: { id: data.message.id },
    });
  });
  
  it('should mark a message as read', async () => {
    const response = await fetch(`${baseUrl}/api/messages/${mockMessage.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'markRead',
      }),
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.message.id).toBe(mockMessage.id);
    expect(data.message.readAt).toBeDefined();
  });
});

// Test the Queue API
describe('Queue API', () => {
  it('should create a queue item for a message', async () => {
    const queueItem = {
      messageId: mockMessage.id,
      roomId: mockRoom.id,
      agentId: mockAgent.id,
      userId: mockUser.id,
      isPriority: true,
    };
    
    const response = await fetch(`${baseUrl}/api/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queueItem),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.item).toBeDefined();
    expect(data.item.messageId).toBe(queueItem.messageId);
    expect(data.item.roomId).toBe(queueItem.roomId);
    expect(data.item.agentId).toBe(queueItem.agentId);
    expect(data.item.isPriority).toBe(queueItem.isPriority);
    
    // Clean up the queue item
    await prisma.queueItem.delete({
      where: { id: data.item.id },
    });
  });
  
  it('should get queue items for an agent', async () => {
    // Create a test queue item
    const queueItem = await prisma.queueItem.create({
      data: {
        messageId: mockMessage.id,
        roomId: mockRoom.id,
        agentId: mockAgent.id,
        userId: mockUser.id,
        isPriority: false,
        status: 'pending',
      },
    });
    
    const response = await fetch(`${baseUrl}/api/queue?agentId=${mockAgent.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.items)).toBe(true);
    
    // Check if our test queue item is in the list
    const testItem = data.items.find((item: any) => item.id === queueItem.id);
    expect(testItem).toBeDefined();
    expect(testItem.messageId).toBe(queueItem.messageId);
    expect(testItem.agentId).toBe(mockAgent.id);
    
    // Clean up the test queue item
    await prisma.queueItem.delete({
      where: { id: queueItem.id },
    });
  });
});

// Test the Webhooks API
describe('Webhooks API', () => {
  it('should create a webhook configuration', async () => {
    const webhookConfig = {
      agentId: mockAgent.id,
      url: 'https://example.com/webhook',
      secret: 'webhook-secret',
      events: ['message', 'reaction'],
    };
    
    const response = await fetch(`${baseUrl}/api/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookConfig),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.webhook).toBeDefined();
    expect(data.webhook.agentId).toBe(webhookConfig.agentId);
    expect(data.webhook.url).toBe(webhookConfig.url);
    expect(data.webhook.events).toEqual(expect.arrayContaining(webhookConfig.events));
    
    // Clean up the webhook config
    await prisma.webhookConfig.delete({
      where: { id: data.webhook.id },
    });
  });
  
  it('should get webhook configurations for an agent', async () => {
    // Create a test webhook config
    const webhookConfig = await prisma.webhookConfig.create({
      data: {
        agentId: mockAgent.id,
        url: 'https://example.com/webhook-test',
        events: ['message'],
        enabled: true,
      },
    });
    
    const response = await fetch(`${baseUrl}/api/webhooks?agentId=${mockAgent.id}`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.webhooks)).toBe(true);
    
    // Check if our test webhook config is in the list
    const testConfig = data.webhooks.find((config: any) => config.id === webhookConfig.id);
    expect(testConfig).toBeDefined();
    expect(testConfig.agentId).toBe(mockAgent.id);
    expect(testConfig.url).toBe(webhookConfig.url);
    
    // Clean up the test webhook config
    await prisma.webhookConfig.delete({
      where: { id: webhookConfig.id },
    });
  });
});