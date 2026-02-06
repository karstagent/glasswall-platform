import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';
import { AgentRegistrationRequest } from '@/types';

/**
 * POST /api/auth/register - Register a new agent
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { agentId, name, description, ownerTwitterHandle } = body as AgentRegistrationRequest;
    
    // Validate required fields
    if (!agentId || !name || !description || !ownerTwitterHandle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }
    
    // Validate agent ID format (lowercase alphanumeric with hyphens)
    const agentIdRegex = /^[a-z0-9-]+$/;
    if (!agentIdRegex.test(agentId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent ID must contain only lowercase letters, numbers, and hyphens' 
        },
        { status: 400 }
      );
    }
    
    // Register the agent
    const registrationResponse = await agentService.registerAgent({
      agentId,
      name,
      description,
      ownerTwitterHandle
    });
    
    return NextResponse.json(
      { 
        success: true, 
        data: registrationResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering agent:', error);
    
    // Handle specific errors
    const err = error as Error;
    if (err.message.includes('already taken')) {
      return NextResponse.json(
        { 
          success: false, 
          error: err.message 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register agent' 
      },
      { status: 500 }
    );
  }
}