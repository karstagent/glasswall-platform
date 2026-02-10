import { NextApiRequest, NextApiResponse } from 'next';
import { OnboardingController } from '@/controllers/OnboardingController';

/**
 * API route for getting and managing user onboarding progress
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Route protection - only handle GET and DELETE methods
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  switch (req.method) {
    case 'GET':
      // Get user onboarding progress
      return OnboardingController.getUserProgress(req, res);

    case 'DELETE':
      // Reset user onboarding progress (for testing or admin use)
      try {
        // Implementation for deleting progress
        // This would need authentication and permission checks
        
        return res.status(501).json({ error: 'Not implemented yet' });
      } catch (error) {
        console.error('Error resetting onboarding progress:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}