import React, { useState } from 'react';
import { AlertService } from '@/services/AlertService';
import { UserService } from '@/services/UserService';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  ChatBubbleLeftRightIcon, 
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface NotificationTestPanelProps {
  compact?: boolean;
  onTestComplete?: (result: { success: boolean; message: string }) => void;
}

export const NotificationTestPanel: React.FC<NotificationTestPanelProps> = ({
  compact = false,
  onTestComplete,
}) => {
  const [channel, setChannel] = useState<string>('IN_APP');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const channels = [
    { value: 'IN_APP', label: 'In-App Notification', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { value: 'EMAIL', label: 'Email', icon: <EnvelopeIcon className="w-5 h-5" /> },
    { value: 'SMS', label: 'SMS', icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
    { value: 'PUSH', label: 'Push Notification', icon: <BellIcon className="w-5 h-5" /> },
    { value: 'WEBHOOK', label: 'Webhook', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
  ];
  
  const handleChannelChange = (value: string) => {
    setChannel(value);
    // Reset result when changing channel
    setResult(null);
  };
  
  const handleTestClick = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // Get current user
      const user = await UserService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }
      
      // Send test notification
      const testResult = await AlertService.testNotificationChannel(user.id, channel);
      
      // Update state with result
      setResult(testResult);
      
      // Call callback if provided
      if (onTestComplete) {
        onTestComplete(testResult);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error testing notification:', error);
      
      // Set error result
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      
      setResult(errorResult);
      
      // Call callback if provided
      if (onTestComplete) {
        onTestComplete(errorResult);
      }
      
      setIsLoading(false);
    }
  };
  
  return (
    <div className={compact ? '' : 'glass-panel p-6'}>
      <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold mb-4`}>
        Test Notification Delivery
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6">
        Send a test notification to verify your notification settings are working correctly.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Notification Channel
          </label>
          <Select
            value={channel}
            onChange={handleChannelChange}
            options={channels.map(c => ({ label: c.label, value: c.value }))}
            renderOption={(option) => {
              const channelItem = channels.find(c => c.value === option.value);
              return (
                <div className="flex items-center">
                  {channelItem?.icon}
                  <span className="ml-2">{option.label}</span>
                </div>
              );
            }}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleTestClick} 
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            Send Test Notification
          </Button>
        </div>
      </div>
      
      {result && (
        <div className={`p-4 rounded-md mt-4 ${
          result.success 
            ? 'bg-success/10 text-success-foreground'
            : 'bg-destructive/10 text-destructive'
        }`}>
          <div className="flex items-center">
            {result.success 
              ? <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              : <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            }
            <span>{result.message}</span>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Channel Requirements</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Email: Valid email address in your profile</li>
          <li>• SMS: Valid phone number in your profile</li>
          <li>• Push: At least one registered device</li>
          <li>• Webhook: Configured webhook endpoint</li>
          <li>• In-App: No additional requirements</li>
        </ul>
      </div>
    </div>
  );
};