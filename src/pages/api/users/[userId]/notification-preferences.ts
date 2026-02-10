import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user ID from URL
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Check if user has permission (user can only access their own preferences unless admin)
  if (userId !== auth.user.id && auth.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPreferences(userId, res);
    case 'PUT':
      return updatePreferences(userId, req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get notification preferences for a user
 */
async function getPreferences(userId: string, res: NextApiResponse) {
  try {
    // Get user's notification preferences
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    // If no preferences found, return an empty array (will trigger default preferences)
    if (!preferences || preferences.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(preferences);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return res.status(500).json({ error: 'Failed to get notification preferences' });
  }
}

/**
 * Update notification preferences for a user
 */
async function updatePreferences(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const preferences = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences must be an array' });
    }

    // Validate preferences
    for (const pref of preferences) {
      if (!pref.severity) {
        return res.status(400).json({ error: 'Each preference must have a severity level' });
      }
    }

    // Delete existing preferences for this user
    await prisma.notificationPreference.deleteMany({
      where: { userId },
    });

    // Create new preferences
    await Promise.all(
      preferences.map((pref) =>
        prisma.notificationPreference.create({
          data: {
            userId,
            severity: pref.severity,
            enabled: pref.enabled,
            channels: pref.channels,
            minInterval: pref.minInterval,
            quietHoursEnabled: pref.quietHoursEnabled,
            quietHoursStart: pref.quietHoursStart,
            quietHoursEnd: pref.quietHoursEnd,
            categories: pref.categories,
          },
        })
      )
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ error: 'Failed to update notification preferences' });
  }
}