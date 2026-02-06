import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentRegistrationRequest, AgentRegistrationResponse } from '@/types';

class AgentService {
  private agents: Map<string, Agent> = new Map();
  private apiKeys: Map<string, string> = new Map(); // apiKey -> agentId
  private claimCodes: Map<string, string> = new Map(); // claimCode -> agentId

  /**
   * Register a new agent
   */
  public registerAgent(request: AgentRegistrationRequest): AgentRegistrationResponse {
    const { agentId, name, description, ownerTwitterHandle } = request;
    
    // Check if agent already exists
    if (this.agents.has(agentId)) {
      throw new Error(`Agent with ID ${agentId} already exists`);
    }
    
    // Generate API key and claim code
    const apiKey = this.generateApiKey();
    const claimCode = this.generateClaimCode();
    
    // Create agent
    const agent: Agent = {
      id: agentId,
      name,
      description,
      apiKey,
      ownerTwitterHandle,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store agent
    this.agents.set(agentId, agent);
    this.apiKeys.set(apiKey, agentId);
    this.claimCodes.set(claimCode, agentId);
    
    // Return response
    return {
      apiKey,
      claimCode,
      verificationUrl: `https://glasswall.xyz/verify/${claimCode}`
    };
  }

  /**
   * Generate a unique API key
   */
  private generateApiKey(): string {
    return `gw_${uuidv4().replace(/-/g, '')}`;
  }

  /**
   * Generate a claim code for verification
   */
  private generateClaimCode(): string {
    // Generate a 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Verify an agent via claim code
   */
  public verifyAgent(claimCode: string, twitterHandle: string): boolean {
    const agentId = this.claimCodes.get(claimCode);
    
    if (!agentId) {
      return false;
    }
    
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      return false;
    }
    
    // Check if the Twitter handle matches
    if (agent.ownerTwitterHandle.toLowerCase() !== twitterHandle.toLowerCase()) {
      return false;
    }
    
    // Update agent
    agent.verified = true;
    agent.updatedAt = new Date().toISOString();
    
    // Clean up claim code
    this.claimCodes.delete(claimCode);
    
    return true;
  }

  /**
   * Get an agent by ID
   */
  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get an agent by API key
   */
  public getAgentByApiKey(apiKey: string): Agent | undefined {
    const agentId = this.apiKeys.get(apiKey);
    if (!agentId) {
      return undefined;
    }
    return this.agents.get(agentId);
  }

  /**
   * Check if an API key is valid
   */
  public isValidApiKey(apiKey: string): boolean {
    return this.apiKeys.has(apiKey);
  }

  /**
   * Update agent details
   */
  public updateAgent(
    agentId: string,
    updates: Partial<Pick<Agent, 'name' | 'description'>>
  ): Agent {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Update fields
    if (updates.name) agent.name = updates.name;
    if (updates.description) agent.description = updates.description;
    
    agent.updatedAt = new Date().toISOString();
    
    return agent;
  }

  /**
   * Regenerate API key for an agent
   */
  public regenerateApiKey(agentId: string): string {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Remove old API key
    if (agent.apiKey) {
      this.apiKeys.delete(agent.apiKey);
    }
    
    // Generate new API key
    const newApiKey = this.generateApiKey();
    
    // Update agent
    agent.apiKey = newApiKey;
    agent.updatedAt = new Date().toISOString();
    
    // Store new API key
    this.apiKeys.set(newApiKey, agentId);
    
    return newApiKey;
  }

  /**
   * Delete an agent
   */
  public deleteAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      return false;
    }
    
    // Remove API key
    if (agent.apiKey) {
      this.apiKeys.delete(agent.apiKey);
    }
    
    // Remove agent
    this.agents.delete(agentId);
    
    return true;
  }
}

// Export a singleton instance
export const agentService = new AgentService();
export default agentService;