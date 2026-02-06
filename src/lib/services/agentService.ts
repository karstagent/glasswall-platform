import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// In-memory storage for when database is not available
const inMemoryAgents: Record<string, any> = {};
const inMemoryApiKeys: Record<string, string> = {}; // apiKey -> agentId
const inMemoryClaimCodes: Record<string, { agentId: string, expires: Date }> = {};

export type AgentRegistrationRequest = {
  agentId: string;
  name: string;
  description: string;
  ownerTwitterHandle: string;
};

export type AgentRegistrationResponse = {
  apiKey: string;
  claimCode: string;
  verificationUrl: string;
};

export const agentService = {
  /**
   * Register a new agent
   */
  async registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse> {
    // Check if agent ID is already taken
    if (inMemoryAgents[request.agentId]) {
      throw new Error(`Agent ID ${request.agentId} is already taken`);
    }
    
    // Generate an API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Generate a claim code
    const claimCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Create timestamp
    const now = new Date().toISOString();
    
    // Create the agent
    const agent = {
      id: request.agentId,
      name: request.name,
      description: request.description,
      apiKey,
      ownerTwitterHandle: request.ownerTwitterHandle,
      verified: false,
      createdAt: now,
      updatedAt: now
    };
    
    // Store the agent in memory
    inMemoryAgents[agent.id] = agent;
    inMemoryApiKeys[apiKey] = agent.id;
    
    // Store the claim code with expiry (24 hours)
    const claimExpiry = new Date();
    claimExpiry.setHours(claimExpiry.getHours() + 24);
    
    inMemoryClaimCodes[claimCode] = {
      agentId: agent.id,
      expires: claimExpiry
    };
    
    // Generate verification URL
    let baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://glasswall-rebuild.vercel.app';
    
    const verificationUrl = `${baseUrl}/verify?code=${claimCode}`;
    
    return {
      apiKey,
      claimCode,
      verificationUrl
    };
  },
  
  /**
   * Verify an agent using a claim code
   */
  async verifyAgent(claimCode: string, twitterHandle: string): Promise<boolean> {
    // Get the claim code entry
    const claim = inMemoryClaimCodes[claimCode];
    
    if (!claim) {
      throw new Error('Invalid claim code');
    }
    
    // Check if claim code has expired
    if (claim.expires < new Date()) {
      throw new Error('Claim code has expired');
    }
    
    // Get the agent
    const agent = inMemoryAgents[claim.agentId];
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Check if twitter handle matches
    if (agent.ownerTwitterHandle.toLowerCase() !== twitterHandle.toLowerCase()) {
      throw new Error('Twitter handle does not match');
    }
    
    // Update agent verification status
    agent.verified = true;
    agent.updatedAt = new Date().toISOString();
    
    // Remove the claim code
    delete inMemoryClaimCodes[claimCode];
    
    return true;
  },
  
  /**
   * Get agent by ID
   */
  async getAgentById(agentId: string) {
    return inMemoryAgents[agentId] || null;
  },
  
  /**
   * Get agent by API key
   */
  async getAgentByApiKey(apiKey: string) {
    const agentId = inMemoryApiKeys[apiKey];
    
    if (!agentId) {
      return null;
    }
    
    return inMemoryAgents[agentId] || null;
  },
  
  /**
   * List all verified agents
   */
  async listVerifiedAgents() {
    return Object.values(inMemoryAgents).filter((agent: any) => agent.verified);
  }
};