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

interface AgentCreateRequest {
  name: string;
  description: string;
  twitterHandle?: string;
  webhookUrl?: string;
  avatar?: string;
}

interface AgentUpdateRequest {
  name?: string;
  description?: string;
  twitterHandle?: string;
  webhookUrl?: string;
  avatar?: string;
}

// Mock database of agents
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

// GET - Retrieve agents (with optional filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters for filtering
  const verificationStatus = searchParams.get('verification');
  const search = searchParams.get('search');
  
  // Filter agents based on query parameters
  let filteredAgents = [...agents];
  
  if (verificationStatus) {
    filteredAgents = filteredAgents.filter(agent => 
      agent.verificationStatus === verificationStatus
    );
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredAgents = filteredAgents.filter(agent => 
      agent.name.toLowerCase().includes(searchLower) || 
      agent.description.toLowerCase().includes(searchLower) ||
      (agent.twitterHandle && agent.twitterHandle.toLowerCase().includes(searchLower))
    );
  }
  
  return NextResponse.json({ agents: filteredAgents }, { status: 200 });
}

// POST - Create a new agent
export async function POST(request: Request) {
  try {
    const payload: AgentCreateRequest = await request.json();
    
    // Validate required fields
    if (!payload.name || !payload.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Generate a new agent ID
    const agentId = `agent_${Date.now()}`;
    
    // Create the new agent
    const newAgent: Agent = {
      id: agentId,
      name: payload.name,
      description: payload.description,
      avatar: payload.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
      verificationStatus: 'pending', // New agents start with pending verification
      twitterHandle: payload.twitterHandle,
      webhookUrl: payload.webhookUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // In a real implementation, this would save to a database
    agents.push(newAgent);
    
    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get an agent by ID
function getAgentById(agentId: string): Agent | undefined {
  return agents.find(agent => agent.id === agentId);
}

// GET handler for a specific agent by ID
export async function GET_AGENT_BY_ID(request: Request, { params }: { params: { id: string } }) {
  const agent = getAgentById(params.id);
  
  if (!agent) {
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ agent }, { status: 200 });
}

// PATCH handler to update a specific agent
export async function PATCH_AGENT(request: Request, { params }: { params: { id: string } }) {
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

// DELETE handler to remove a specific agent
export async function DELETE_AGENT(request: Request, { params }: { params: { id: string } }) {
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