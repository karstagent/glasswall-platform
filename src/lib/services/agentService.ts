import { Agent, AgentRegistrationRequest, AgentRegistrationResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// In-memory storage for demo purposes
// In production, this would use a database
const agents: Record<string, Agent> = {};
const apiKeyMap: Record<string, string> = {}; // apiKey -> agentId
const claimCodes: Record<string, { agentId: string, expires: Date }> = {};

export const agentService = {
  /**
   * Register a new agent
   */
  async registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse> {
    const now = new Date().toISOString();
    
    // Check if agent ID is already taken
    if (agents[request.agentId]) {
      throw new Error(`Agent ID ${request.agentId} is already taken`);
    }
    
    // Generate an API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Generate a claim code
    const claimCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Create the agent
    const agent: Agent = {
      id: request.agentId,
      name: request.name,
      description: request.description,
      apiKey,
      ownerTwitterHandle: request.ownerTwitterHandle,
      verified: false,
      createdAt: now,
      updatedAt: now
    };
    
    // Store the agent
    agents[agent.id] = agent;
    apiKeyMap[apiKey] = agent.id;
    
    // Store the claim code with expiry (24 hours)
    const claimExpiry = new Date();
    claimExpiry.setHours(claimExpiry.getHours() + 24);
    claimCodes[claimCode] = {
      agentId: agent.id,
      expires: claimExpiry
    };
    
    // Generate verification URL
    const verificationUrl = `https://glasswall.xyz/verify?code=${claimCode}`;
    
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
    const claim = claimCodes[claimCode];
    
    if (!claim) {
      throw new Error('Invalid claim code');
    }
    
    // Check if claim code has expired
    if (claim.expires < new Date()) {
      throw new Error('Claim code has expired');
    }
    
    // Get the agent
    const agent = agents[claim.agentId];
    
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
    delete claimCodes[claimCode];
    
    return true;
  },
  
  /**
   * Get agent by ID
   */
  getAgentById(agentId: string): Agent | null {
    return agents[agentId] || null;
  },
  
  /**
   * Get agent by API key
   */
  getAgentByApiKey(apiKey: string): Agent | null {
    const agentId = apiKeyMap[apiKey];
    
    if (!agentId) {
      return null;
    }
    
    return this.getAgentById(agentId);
  },
  
  /**
   * Check if an agent is verified
   */
  isAgentVerified(agentId: string): boolean {
    const agent = agents[agentId];
    
    if (!agent) {
      return false;
    }
    
    return agent.verified;
  },
  
  /**
   * List all verified agents
   */
  listVerifiedAgents(): Agent[] {
    return Object.values(agents).filter(agent => agent.verified);
  },
  
  /**
   * Update agent details
   */
  updateAgent(agentId: string, updates: Partial<Agent>): Agent {
    const agent = agents[agentId];
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Don't allow updating these fields
    const { id, apiKey, verified, createdAt, ...allowedUpdates } = updates;
    
    // Update the agent
    const updatedAgent = {
      ...agent,
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    };
    
    // Store the updated agent
    agents[agentId] = updatedAgent;
    
    return updatedAgent;
  },
  
  /**
   * Reset API key for an agent
   */
  resetApiKey(agentId: string): string {
    const agent = agents[agentId];
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Remove old API key mapping
    if (agent.apiKey) {
      delete apiKeyMap[agent.apiKey];
    }
    
    // Generate a new API key
    const newApiKey = crypto.randomBytes(32).toString('hex');
    
    // Update the agent
    agent.apiKey = newApiKey;
    agent.updatedAt = new Date().toISOString();
    
    // Store the new API key mapping
    apiKeyMap[newApiKey] = agentId;
    
    return newApiKey;
  },
  
  /**
   * Validate API key
   */
  validateApiKey(apiKey: string): boolean {
    return !!apiKeyMap[apiKey];
  }
};