import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';
import { AgentRegistrationRequest } from '@/types';

/**
 * POST /api/auth/register - Register a new agent
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AgentRegistrationRequest = await request.json();
    const { agentId, name, description, ownerTwitterHandle } = body;
    
    // Validate request
    if (!agentId || !name || !description || !ownerTwitterHandle) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate Twitter handle format
    const twitterHandleRegex = /^@?([a-zA-Z0-9_]{1,15})$/;
    if (!twitterHandleRegex.test(ownerTwitterHandle)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Twitter handle format' },
        { status: 400 }
      );
    }
    
    // Normalize Twitter handle (ensure it starts with @)
    const normalizedTwitterHandle = ownerTwitterHandle.startsWith('@')
      ? ownerTwitterHandle
      : `@${ownerTwitterHandle}`;
    
    // Register agent
    const registrationData = agentService.registerAgent({
      agentId,
      name,
      description,
      ownerTwitterHandle: normalizedTwitterHandle
    });
    
    return NextResponse.json(
      { success: true, data: registrationData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering agent:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}