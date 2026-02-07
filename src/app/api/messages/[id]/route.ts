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

// Mock database of messages - in a real app, this would be in a database
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

// Helper function to get a message by ID
function getMessageById(messageId: string): Message | undefined {
  return messages.find(message => message.id === messageId);
}

// GET - Retrieve a specific message by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const message = getMessageById(params.id);
  
  if (!message) {
    return NextResponse.json(
      { error: 'Message not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ message }, { status: 200 });
}

// PATCH - Update a specific message (content or properties)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;
    const { content } = await request.json();
    
    // Find the message to update
    const messageIndex = messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Only allow updating content
    if (content) {
      messages[messageIndex].content = content;
    } else {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ message: messages[messageIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating message:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific message
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const messageId = params.id;
  
  // Find the message to delete
  const messageIndex = messages.findIndex(message => message.id === messageId);
  
  if (messageIndex === -1) {
    return NextResponse.json(
      { error: 'Message not found' },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would delete from the database
  // Or possibly mark as deleted rather than actually removing it
  const deletedMessage = messages.splice(messageIndex, 1)[0];
  
  return NextResponse.json(
    { message: 'Message deleted successfully', message: deletedMessage },
    { status: 200 }
  );
}

// POST - Handle reactions to messages
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;
    const { action, userId, emoji } = await request.json();
    
    // Find the message
    const messageIndex = messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Handle reactions
    if (action === 'react') {
      if (!emoji || !userId) {
        return NextResponse.json(
          { error: 'emoji and userId are required for reactions' },
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
    } else if (action === 'unreact') {
      if (!emoji || !userId) {
        return NextResponse.json(
          { error: 'emoji and userId are required for removing reactions' },
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
    } else if (action === 'markRead') {
      messages[messageIndex].readAt = Date.now();
      
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
    console.error('Error processing message action:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}