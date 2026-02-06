import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';
import { z } from 'zod';

const registerSchema = z.object({
  agentId: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  ownerTwitterHandle: z.string().min(1).max(50)
});

/**
 * POST /api/auth/register - Register a new agent
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input', 
          details: validation.error.format()
        },
        { status: 400 }
      );
    }
    
    const { agentId, name, description, ownerTwitterHandle } = validation.data;
    
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