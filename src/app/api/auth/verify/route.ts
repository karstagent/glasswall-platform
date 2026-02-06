import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';
import { z } from 'zod';

const verifySchema = z.object({
  claimCode: z.string().min(1).max(20),
  twitterHandle: z.string().min(1).max(50)
});

/**
 * POST /api/auth/verify - Verify an agent with claim code
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the input
    const validation = verifySchema.safeParse(body);
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
    
    const { claimCode, twitterHandle } = validation.data;
    
    // Verify the agent
    const verified = await agentService.verifyAgent(claimCode, twitterHandle);
    
    if (!verified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification failed' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { verified: true } 
    });
  } catch (error) {
    console.error('Error verifying agent:', error);
    
    // Handle specific errors
    const err = error as Error;
    if (err.message.includes('Invalid claim code') ||
        err.message.includes('Claim code has expired') ||
        err.message.includes('Twitter handle does not match')) {
      return NextResponse.json(
        { 
          success: false, 
          error: err.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify agent' 
      },
      { status: 500 }
    );
  }
}