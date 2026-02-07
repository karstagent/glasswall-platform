import { NextResponse } from 'next/server';

// Define agent interfaces
interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  twitterHandle?: string;
  webhookUrl?: string;
  createdAt: number;
  updatedAt: number;
}

interface AgentUpdateRequest {
  name?: string;
  description?: string;
  twitterHandle?: string;
  webhookUrl?: string;
  avatar?: string;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
}

// Mock database of agents - in a real app, this would be in a database
const agents: Agent[] = [
  {
    id: 'agent_1',
    name: 'CryptoAnalyst',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    description: 'Expert in cryptocurrency analysis and market trends. Provides daily insights and trading recommendations.',
    verificationStatus: 'verified',
    twitterHandle: '@crypto_analyst',
    webhookUrl: 'https://api.example.com/webhooks/crypto-analyst',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: 'agent_2',
    name: 'CodeWizard',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    description: 'Full-stack developer specialized in helping with code reviews, debugging, and architecture decisions.',
    verificationStatus: 'verified',
    twitterHandle: '@code_wizard',
    webhookUrl: 'https://api.example.com/webhooks/code-wizard',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  },
];

// Helper function to get an agent by ID
function getAgentById(agentId: string): Agent | undefined {
  return agents.find(agent => agent.id === agentId);
}

// GET - Retrieve a specific agent by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agent = getAgentById(params.id);
  
  if (!agent) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ agent }, { status: 200 });
}

// PATCH - Update a specific agent
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const payload: AgentUpdateRequest = await request.json();
    
    // Find the agent to update
    const agentIndex = agents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Update the agent with the new information
    const updatedAgent: Agent = {
      ...agents[agentIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.avatar && { avatar: payload.avatar }),
      ...(payload.twitterHandle && { twitterHandle: payload.twitterHandle }),
      ...(payload.webhookUrl && { webhookUrl: payload.webhookUrl }),
      ...(payload.verificationStatus && { verificationStatus: payload.verificationStatus }),
      updatedAt: Date.now(),
    };
    
    // In a real implementation, this would update the database
    agents[agentIndex] = updatedAgent;
    
    return NextResponse.json({ agent: updatedAgent }, { status: 200 });
  } catch (error) {
    console.error('Error updating agent:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific agent
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;
  
  // Find the agent to delete
  const agentIndex = agents.findIndex(agent => agent.id === agentId);
  
  if (agentIndex === -1) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would delete from the database
  const deletedAgent = agents.splice(agentIndex, 1)[0];
  
  return NextResponse.json(
    { message: 'Agent deleted successfully', agent: deletedAgent },
    { status: 200 }
  );
}

// POST - Verify an agent
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const { action } = await request.json();
    
    // Find the agent
    const agentIndex = agents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    if (action === 'verify') {
      // Verify the agent
      agents[agentIndex].verificationStatus = 'verified';
      agents[agentIndex].updatedAt = Date.now();
      
      return NextResponse.json(
        { message: 'Agent verified successfully', agent: agents[agentIndex] },
        { status: 200 }
      );
    } else if (action === 'reject') {
      // Reject the verification
      agents[agentIndex].verificationStatus = 'unverified';
      agents[agentIndex].updatedAt = Date.now();
      
      return NextResponse.json(
        { message: 'Agent verification rejected', agent: agents[agentIndex] },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing agent action:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}