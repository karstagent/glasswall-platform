import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/services/NotificationService';

/**
 * API endpoint to test notification delivery
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  // Check if user has permission (user can only test their own notifications unless admin)
  if (userId !== auth.user.id && auth.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Get channel from request body
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: 'Channel is required' });
  }

  try {
    // Get user info to personalize the test notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        devices: true,
        webhookEndpoints: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a test notification based on the channel
    const testMessage = {
      title: 'Test Notification',
      message: `This is a test notification sent to ${user.displayName} via ${channel}`,
      severity: 'LOW',
      category: 'SYSTEM',
    };

    // Send the test notification
    let result: { success: boolean; message: string } = {
      success: false,
      message: 'Unknown error',
    };

    switch (channel.toUpperCase()) {
      case 'EMAIL':
        if (!user.email) {
          result = { success: false, message: 'User has no email address configured' };
        } else {
          await NotificationService.sendEmail(user.email, testMessage.title, testMessage.message);
          result = { success: true, message: `Test email sent to ${user.email}` };
        }
        break;

      case 'SMS':
        if (!user.phone) {
          result = { success: false, message: 'User has no phone number configured' };
        } else {
          await NotificationService.sendSms(user.phone, testMessage.message);
          result = { success: true, message: `Test SMS sent to ${user.phone}` };
        }
        break;

      case 'PUSH':
        if (!user.devices || user.devices.length === 0) {
          result = { success: false, message: 'User has no devices registered for push notifications' };
        } else {
          await NotificationService.sendPush(user.id, testMessage.title, testMessage.message);
          result = { success: true, message: `Test push notification sent to ${user.devices.length} device(s)` };
        }
        break;

      case 'IN_APP':
        await NotificationService.sendInApp(user.id, testMessage.title, testMessage.message);
        result = { success: true, message: 'Test in-app notification created' };
        break;

      case 'WEBHOOK':
        if (!user.webhookEndpoints || user.webhookEndpoints.length === 0) {
          result = { success: false, message: 'User has no webhook endpoints configured' };
        } else {
          await NotificationService.sendWebhook(user.id, testMessage);
          result = { 
            success: true, 
            message: `Test webhook notification sent to ${user.webhookEndpoints.length} endpoint(s)` 
          };
        }
        break;

      default:
        result = { success: false, message: `Unsupported channel: ${channel}` };
    }

    // Create a record of the test in the database
    await prisma.notificationTest.create({
      data: {
        userId,
        channel: channel.toUpperCase(),
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error testing notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
}