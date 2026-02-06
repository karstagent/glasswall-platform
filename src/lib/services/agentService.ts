import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
    const existingAgent = await prisma.agent.findUnique({
      where: { id: request.agentId }
    });
    
    if (existingAgent) {
      throw new Error(`Agent ID ${request.agentId} is already taken`);
    }
    
    // Generate an API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Generate a claim code
    const claimCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        id: request.agentId,
        name: request.name,
        description: request.description,
        apiKey,
        ownerTwitterHandle: request.ownerTwitterHandle,
        verified: false,
      }
    });
    
    // Store the claim code with expiry (24 hours)
    const claimExpiry = new Date();
    claimExpiry.setHours(claimExpiry.getHours() + 24);
    
    await prisma.verificationCode.create({
      data: {
        code: claimCode,
        expires: claimExpiry,
        agent: {
          connect: {
            id: agent.id
          }
        }
      }
    });
    
    // Generate verification URL
    const verificationUrl = `https://glasswall.vercel.app/verify?code=${claimCode}`;
    
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
    const claim = await prisma.verificationCode.findUnique({
      where: { code: claimCode },
      include: { agent: true }
    });
    
    if (!claim) {
      throw new Error('Invalid claim code');
    }
    
    // Check if claim code has expired
    if (claim.expires < new Date()) {
      throw new Error('Claim code has expired');
    }
    
    // Get the agent
    const agent = claim.agent;
    
    // Check if twitter handle matches
    if (agent.ownerTwitterHandle.toLowerCase() !== twitterHandle.toLowerCase()) {
      throw new Error('Twitter handle does not match');
    }
    
    // Update agent verification status
    await prisma.agent.update({
      where: { id: agent.id },
      data: { verified: true }
    });
    
    // Remove the claim code
    await prisma.verificationCode.delete({
      where: { id: claim.id }
    });
    
    return true;
  },
  
  /**
   * Get agent by ID
   */
  async getAgentById(agentId: string) {
    return prisma.agent.findUnique({
      where: { id: agentId }
    });
  },
  
  /**
   * Get agent by API key
   */
  async getAgentByApiKey(apiKey: string) {
    const agent = await prisma.agent.findUnique({
      where: { apiKey }
    });
    
    return agent;
  },
  
  /**
   * List all verified agents
   */
  async listVerifiedAgents() {
    return prisma.agent.findMany({
      where: { verified: true }
    });
  }
};