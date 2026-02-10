/**
 * Onboarding Controller
 * 
 * Handles API endpoints related to onboarding functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export class OnboardingController {
  /**
   * Get user's onboarding progress
   */
  static async getUserProgress(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if userId is provided or use the authenticated user's ID
      const userId = req.query.userId as string || auth.user.id;
      
      // Check permission - only allow self or admins
      if (userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Get onboarding progress
      const progress = await prisma.onboardingProgress.findUnique({
        where: { userId },
      });

      // If no progress found, create new entry
      if (!progress) {
        const newProgress = await prisma.onboardingProgress.create({
          data: {
            userId,
            completedSteps: [],
            skippedSteps: [],
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          },
        });
        
        return res.status(200).json(newProgress);
      }

      return res.status(200).json(progress);
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user's onboarding preferences
   */
  static async getUserPreferences(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if userId is provided or use the authenticated user's ID
      const userId = req.query.userId as string || auth.user.id;
      
      // Check permission - only allow self or admins
      if (userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Get onboarding preferences
      const preferences = await prisma.onboardingPreference.findUnique({
        where: { userId },
      });

      // If no preferences found, create default entry
      if (!preferences) {
        const newPreferences = await prisma.onboardingPreference.create({
          data: {
            userId,
            experienceLevel: 'BEGINNER',
            interests: [],
            preferredTutorialStyle: 'INTERACTIVE',
          },
        });
        
        return res.status(200).json(newPreferences);
      }

      return res.status(200).json(preferences);
    } catch (error) {
      console.error('Error getting onboarding preferences:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Mark a step as completed
   */
  static async markStepCompleted(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { stepId } = req.body;
      if (!stepId) {
        return res.status(400).json({ error: 'Step ID is required' });
      }

      // Get current progress
      let progress = await prisma.onboardingProgress.findUnique({
        where: { userId: auth.user.id },
      });

      // If no progress found, create new entry
      if (!progress) {
        progress = await prisma.onboardingProgress.create({
          data: {
            userId: auth.user.id,
            completedSteps: [stepId],
            skippedSteps: [],
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Update progress
        progress = await prisma.onboardingProgress.update({
          where: { userId: auth.user.id },
          data: {
            completedSteps: {
              push: stepId,
            },
            lastUpdatedAt: new Date().toISOString(),
          },
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking step as completed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Mark a step as skipped
   */
  static async markStepSkipped(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { stepId } = req.body;
      if (!stepId) {
        return res.status(400).json({ error: 'Step ID is required' });
      }

      // Get current progress
      let progress = await prisma.onboardingProgress.findUnique({
        where: { userId: auth.user.id },
      });

      // If no progress found, create new entry
      if (!progress) {
        progress = await prisma.onboardingProgress.create({
          data: {
            userId: auth.user.id,
            completedSteps: [],
            skippedSteps: [stepId],
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Update progress
        progress = await prisma.onboardingProgress.update({
          where: { userId: auth.user.id },
          data: {
            skippedSteps: {
              push: stepId,
            },
            lastUpdatedAt: new Date().toISOString(),
          },
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking step as skipped:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Set user experience level
   */
  static async setExperienceLevel(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId, level } = req.body;
      if (!userId || !level) {
        return res.status(400).json({ error: 'User ID and experience level are required' });
      }
      
      // Check permission - only allow self or admins
      if (userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Validate experience level
      if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
        return res.status(400).json({ error: 'Invalid experience level' });
      }

      // Update preferences
      await prisma.onboardingPreference.upsert({
        where: { userId },
        update: {
          experienceLevel: level,
        },
        create: {
          userId,
          experienceLevel: level,
          interests: [],
          preferredTutorialStyle: 'INTERACTIVE',
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error setting experience level:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get personalized content
   */
  static async getPersonalizedContent(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const contentId = req.query.contentId as string;
      if (!contentId) {
        return res.status(400).json({ error: 'Content ID is required' });
      }

      // Get the content
      const content = await prisma.onboardingContent.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      return res.status(200).json(content);
    } catch (error) {
      console.error('Error getting personalized content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get role-specific tips
   */
  static async getRoleTips(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const role = req.query.role as string || auth.user.role;
      
      // Get tips based on role
      let tips: string[] = [];
      
      switch (role) {
        case 'USER':
          tips = [
            "Explore different agent chat rooms to find ones that match your interests.",
            "Set up notification preferences to be alerted when agents respond.",
            "Use batch messaging to send multiple questions at once.",
          ];
          break;
        case 'AGENT':
          tips = [
            "Set up your agent profile with detailed capabilities to attract users.",
            "Configure queue settings to optimize your message processing.",
            "Use webhooks to integrate with your backend services.",
            "Create a verification request to increase user trust.",
          ];
          break;
        case 'ADMIN':
          tips = [
            "Check the analytics dashboard for system health and usage metrics.",
            "Manage user and agent accounts through the admin portal.",
            "Configure global platform settings for optimal performance.",
            "Review and approve agent verification requests.",
          ];
          break;
        case 'VERIFIED_USER':
          tips = [
            "Your messages get priority processing in agent queues.",
            "Look for verified agents for highest quality responses.",
            "Customize your notification settings for faster alerts.",
            "Access exclusive chat rooms only available to verified users.",
          ];
          break;
        default:
          tips = [
            "Welcome to GlassWall! Explore agent chat rooms to get started.",
            "Set up your profile to customize your experience.",
            "Check out the help center for detailed guides and tutorials.",
          ];
      }

      return res.status(200).json(tips);
    } catch (error) {
      console.error('Error getting role tips:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Track onboarding interaction
   */
  static async trackInteraction(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Verify authentication
      const auth = await verifyAuth(req);
      if (!auth.success) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { stepId, action, timestamp, metadata } = req.body;
      if (!stepId || !action) {
        return res.status(400).json({ error: 'Step ID and action are required' });
      }

      // Log the interaction
      await prisma.onboardingInteraction.create({
        data: {
          userId: auth.user.id,
          stepId,
          action,
          timestamp: timestamp || new Date().toISOString(),
          metadata: metadata || {},
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}