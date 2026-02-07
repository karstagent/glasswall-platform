import { NextResponse } from 'next/server';

// Define message interfaces
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  isPriority: boolean;
  attachments?: {
    id: string;
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    mimeType?: string;
    size?: number;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
  createdAt: number;
  deliveredAt?: number;
  readAt?: number;
}

interface MessageCreateRequest {
  roomId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  isPriority?: boolean;
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    mimeType?: string;
    size?: number;
  }[];
}

// Mock database of messages
const messages: Message[] = [
  {
    id: 'msg_1',
    roomId: 'room_1',
    senderId: 'agent_1',
    senderType: 'agent',
    content: 'Welcome to the Crypto Market Analysis room! I\'m CryptoAnalyst, your dedicated agent for cryptocurrency insights and market analysis.',
    isPriority: false,
    reactions: [
      { emoji: '👋', count: 5, userIds: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'] },
      { emoji: '🚀', count: 3, userIds: ['user_1', 'user_2', 'user_3'] },
    ],
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    readAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'msg_2',
    roomId: 'room_1',
    senderId: 'user_1',
    senderType: 'user',
    content: 'Hi there! I\'m interested in learning about the current state of Bitcoin and Ethereum. What\'s your take on where the market is headed this month?',
    isPriority: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000, // 2 days ago + 1 second
    deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000,
    readAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 2000,
  },
];

// GET - Retrieve messages (with optional filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters for filtering
  const roomId = searchParams.get('roomId');
  const senderId = searchParams.get('senderId');
  const isPriority = searchParams.get('isPriority');
  const before = searchParams.get('before'); // timestamp for pagination
  const after = searchParams.get('after'); // timestamp for pagination
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  // Filter messages based on query parameters
  let filteredMessages = [...messages];
  
  if (roomId) {
    filteredMessages = filteredMessages.filter(message => 
      message.roomId === roomId
    );
  }
  
  if (senderId) {
    filteredMessages = filteredMessages.filter(message => 
      message.senderId === senderId
    );
  }
  
  if (isPriority !== null) {
    const isPriorityBool = isPriority === 'true';
    filteredMessages = filteredMessages.filter(message => 
      message.isPriority === isPriorityBool
    );
  }
  
  if (before) {
    const beforeTimestamp = parseInt(before, 10);
    filteredMessages = filteredMessages.filter(message => 
      message.createdAt < beforeTimestamp
    );
  }
  
  if (after) {
    const afterTimestamp = parseInt(after, 10);
    filteredMessages = filteredMessages.filter(message => 
      message.createdAt > afterTimestamp
    );
  }
  
  // Sort by createdAt (newest first) and limit the number of messages
  filteredMessages.sort((a, b) => b.createdAt - a.createdAt);
  filteredMessages = filteredMessages.slice(0, limit);
  
  return NextResponse.json({ messages: filteredMessages }, { status: 200 });
}

// POST - Create a new message
export async function POST(request: Request) {
  try {
    const payload: MessageCreateRequest = await request.json();
    
    // Validate required fields
    if (!payload.roomId || !payload.senderId || !payload.senderType || !payload.content) {
      return NextResponse.json(
        { error: 'roomId, senderId, senderType, and content are required' },
        { status: 400 }
      );
    }
    
    // Generate a new message ID
    const messageId = `msg_${Date.now()}`;
    
    // Create the new message
    const newMessage: Message = {
      id: messageId,
      roomId: payload.roomId,
      senderId: payload.senderId,
      senderType: payload.senderType,
      content: payload.content,
      isPriority: payload.isPriority || false,
      attachments: payload.attachments,
      reactions: [],
      createdAt: Date.now(),
    };
    
    // In a real implementation, this would save to a database
    messages.push(newMessage);
    
    // In a real implementation, this would trigger a webhook delivery to the agent
    // if the message is sent to a room managed by an agent
    if (payload.senderType === 'user') {
      // Mock webhook delivery
      console.log(`Delivering message ${messageId} to agent for room ${payload.roomId}`);
      
      // Update message with delivery status
      newMessage.deliveredAt = Date.now();
    }
    
    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update message read status or other properties
export async function PUT(request: Request) {
  try {
    const { messageId, action, data } = await request.json();
    
    // Find the message
    const messageIndex = messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    if (action === 'markAsRead') {
      messages[messageIndex].readAt = Date.now();
      
      return NextResponse.json(
        { message: messages[messageIndex] },
        { status: 200 }
      );
    } 
    else if (action === 'addReaction') {
      const { emoji, userId } = data;
      
      if (!emoji || !userId) {
        return NextResponse.json(
          { error: 'emoji and userId are required for adding a reaction' },
          { status: 400 }
        );
      }
      
      // Initialize reactions array if it doesn't exist
      if (!messages[messageIndex].reactions) {
        messages[messageIndex].reactions = [];
      }
      
      // Find existing reaction with the same emoji
      const reactionIndex = messages[messageIndex].reactions!.findIndex(
        reaction => reaction.emoji === emoji
      );
      
      if (reactionIndex === -1) {
        // Create new reaction
        messages[messageIndex].reactions!.push({
          emoji,
          count: 1,
          userIds: [userId],
        });
      } else {
        // Update existing reaction if the user hasn't already reacted
        const reaction = messages[messageIndex].reactions![reactionIndex];
        if (!reaction.userIds.includes(userId)) {
          reaction.count += 1;
          reaction.userIds.push(userId);
        }
      }
      
      return NextResponse.json(
        { message: messages[messageIndex] },
        { status: 200 }
      );
    }
    else if (action === 'removeReaction') {
      const { emoji, userId } = data;
      
      if (!emoji || !userId) {
        return NextResponse.json(
          { error: 'emoji and userId are required for removing a reaction' },
          { status: 400 }
        );
      }
      
      // Check if reactions exist
      if (!messages[messageIndex].reactions) {
        return NextResponse.json(
          { error: 'No reactions exist for this message' },
          { status: 400 }
        );
      }
      
      // Find existing reaction with the same emoji
      const reactionIndex = messages[messageIndex].reactions!.findIndex(
        reaction => reaction.emoji === emoji
      );
      
      if (reactionIndex === -1) {
        return NextResponse.json(
          { error: 'Reaction not found' },
          { status: 404 }
        );
      }
      
      // Update existing reaction
      const reaction = messages[messageIndex].reactions![reactionIndex];
      const userIdIndex = reaction.userIds.indexOf(userId);
      
      if (userIdIndex !== -1) {
        // Remove the user from the reaction
        reaction.userIds.splice(userIdIndex, 1);
        reaction.count -= 1;
        
        // Remove the reaction if no users left
        if (reaction.count === 0) {
          messages[messageIndex].reactions!.splice(reactionIndex, 1);
        }
      }
      
      return NextResponse.json(
        { message: messages[messageIndex] },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}