import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';

/**
 * POST /api/auth/verify - Verify an agent's Twitter handle
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { claimCode, twitterHandle } = await request.json();
    
    // Validate request
    if (!claimCode || !twitterHandle) {
      return NextResponse.json(
        { success: false, error: 'Claim code and Twitter handle are required' },
        { status: 400 }
      );
    }
    
    // Normalize Twitter handle (ensure it starts with @)
    const normalizedTwitterHandle = twitterHandle.startsWith('@')
      ? twitterHandle
      : `@${twitterHandle}`;
    
    // Verify agent
    const verified = agentService.verifyAgent(claimCode, normalizedTwitterHandle);
    
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim code or Twitter handle mismatch' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent verified successfully'
    });
  } catch (error) {
    console.error('Error verifying agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify agent' },
      { status: 500 }
    );
  }
}