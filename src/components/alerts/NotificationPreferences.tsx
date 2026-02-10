import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { BellIcon, ClockIcon, BuildingOfficeIcon, DevicePhoneMobileIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { AlertService } from '@/services/AlertService';
import { UserService } from '@/services/UserService';
import { NotificationChannel, AlertSeverity, AlertCategory, NotificationPreference, DeliverySchedule } from '@/types/alerts';

interface NotificationPreferencesProps {
  userId?: string; // If not provided, uses the current user
  onSave?: () => void;
  onCancel?: () => void;
  compact?: boolean; // For compact view in modals/sidebars
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
  onSave,
  onCancel,
  compact = false,
}) => {
  // State for user preferences
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Channel options
  const channels: NotificationChannel[] = ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK'];
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the target user ID
        let targetUserId = userId;
        if (!targetUserId) {
          const currentUser = await UserService.getCurrentUser();
          if (!currentUser) {
            throw new Error('User not found');
          }
          targetUserId = currentUser.id;
        }
        
        // Load notification preferences
        const userPreferences = await AlertService.getNotificationPreferences(targetUserId);
        
        // If preferences don't exist, create default ones
        if (!userPreferences || userPreferences.length === 0) {
          const defaultPreferences = createDefaultPreferences();
          setPreferences(defaultPreferences);
        } else {
          setPreferences(userPreferences);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load notification preferences');
        setLoading(false);
        console.error('Error loading notification preferences:', err);
      }
    };
    
    loadPreferences();
  }, [userId]);
  
  // Create default preferences for a new user
  const createDefaultPreferences = (): NotificationPreference[] => {
    return [
      {
        severity: 'CRITICAL',
        enabled: true,
        channels: ['EMAIL', 'PUSH', 'IN_APP'],
        minInterval: 0, // Immediately
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        categories: ['SYSTEM', 'SECURITY', 'PERFORMANCE'],
      },
      {
        severity: 'HIGH',
        enabled: true,
        channels: ['PUSH', 'IN_APP'],
        minInterval: 5, // 5 minutes
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        categories: ['SYSTEM', 'SECURITY', 'PERFORMANCE', 'QUEUE'],
      },
      {
        severity: 'MEDIUM',
        enabled: true,
        channels: ['IN_APP'],
        minInterval: 15, // 15 minutes
        quietHoursEnabled: true,
        quietHoursStart: '20:00',
        quietHoursEnd: '08:00',
        categories: ['SYSTEM', 'PERFORMANCE', 'QUEUE', 'USER'],
      },
      {
        severity: 'LOW',
        enabled: false,
        channels: ['IN_APP'],
        minInterval: 60, // 1 hour
        quietHoursEnabled: true,
        quietHoursStart: '18:00',
        quietHoursEnd: '09:00',
        categories: [],
      },
    ];
  };
  
  // Handle saving preferences
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Get the target user ID
      let targetUserId = userId;
      if (!targetUserId) {
        const currentUser = await UserService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not found');
        }
        targetUserId = currentUser.id;
      }
      
      // Save preferences
      await AlertService.saveNotificationPreferences(targetUserId, preferences);
      
      setSaving(false);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError('Failed to save notification preferences');
      setSaving(false);
      console.error('Error saving notification preferences:', err);
    }
  };
  
  // Update a specific preference
  const updatePreference = (severity: AlertSeverity, updates: Partial<NotificationPreference>) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.severity === severity ? { ...pref, ...updates } : pref
      )
    );
  };
  
  // Toggle a channel for a severity
  const toggleChannel = (severity: AlertSeverity, channel: NotificationChannel) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return;
    
    const updatedChannels = preference.channels.includes(channel)
      ? preference.channels.filter(c => c !== channel)
      : [...preference.channels, channel];
    
    updatePreference(severity, { channels: updatedChannels });
  };
  
  // Toggle a category for a severity
  const toggleCategory = (severity: AlertSeverity, category: AlertCategory) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return;
    
    const updatedCategories = preference.categories.includes(category)
      ? preference.categories.filter(c => c !== category)
      : [...preference.categories, category];
    
    updatePreference(severity, { categories: updatedCategories });
  };
  
  // Render a channel button
  const renderChannelButton = (severity: AlertSeverity, channel: NotificationChannel) => {
    const preference = preferences.find(p => p.severity === severity);
    const isActive = preference?.channels.includes(channel);
    
    const icons = {
      EMAIL: <EnvelopeIcon className="w-5 h-5" />,
      SMS: <DevicePhoneMobileIcon className="w-5 h-5" />,
      PUSH: <BellIcon className="w-5 h-5" />,
      IN_APP: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      WEBHOOK: <BuildingOfficeIcon className="w-5 h-5" />,
    };
    
    const labels = {
      EMAIL: 'Email',
      SMS: 'SMS',
      PUSH: 'Push',
      IN_APP: 'In-App',
      WEBHOOK: 'Webhook',
    };
    
    return (
      <button
        type="button"
        onClick={() => toggleChannel(severity, channel)}
        className={`flex items-center px-3 py-2 rounded-md text-sm ${
          isActive 
            ? 'bg-primary text-primary-foreground'
            : 'bg-glass-background hover:bg-glass-highlight'
        } transition-colors`}
        disabled={!preference?.enabled}
      >
        {icons[channel]}
        <span className="ml-2">{labels[channel]}</span>
      </button>
    );
  };
  
  // Render the time interval selector
  const renderIntervalSelector = (severity: AlertSeverity) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return null;
    
    const intervalOptions = [
      { label: 'Immediately', value: 0 },
      { label: '5 minutes', value: 5 },
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30 },
      { label: '1 hour', value: 60 },
      { label: '4 hours', value: 240 },
      { label: 'Daily digest', value: 1440 },
    ];
    
    return (
      <Select
        value={preference.minInterval.toString()}
        onChange={(value) => updatePreference(severity, { minInterval: parseInt(value) })}
        disabled={!preference.enabled}
        options={intervalOptions.map(opt => ({
          label: opt.label,
          value: opt.value.toString(),
        }))}
      />
    );
  };
  
  // Render the quiet hours section
  const renderQuietHours = (severity: AlertSeverity) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-muted-foreground" />
            <span>Quiet Hours</span>
          </div>
          <Switch
            checked={preference.quietHoursEnabled}
            onChange={(checked) => updatePreference(severity, { quietHoursEnabled: checked })}
            disabled={!preference.enabled}
          />
        </div>
        
        {preference.quietHoursEnabled && (
          <div className="flex space-x-3 items-center mt-2">
            <input
              type="time"
              className="glass-input py-1 px-2"
              value={preference.quietHoursStart}
              onChange={(e) => updatePreference(severity, { quietHoursStart: e.target.value })}
              disabled={!preference.enabled}
            />
            <span>to</span>
            <input
              type="time"
              className="glass-input py-1 px-2"
              value={preference.quietHoursEnd}
              onChange={(e) => updatePreference(severity, { quietHoursEnd: e.target.value })}
              disabled={!preference.enabled}
            />
          </div>
        )}
      </div>
    );
  };
  
  // Available categories
  const categories: AlertCategory[] = ['SYSTEM', 'SECURITY', 'PERFORMANCE', 'QUEUE', 'USER', 'INTEGRATION'];
  
  // Render the categories section
  const renderCategories = (severity: AlertSeverity) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return null;
    
    const categoryLabels = {
      SYSTEM: 'System',
      SECURITY: 'Security',
      PERFORMANCE: 'Performance',
      QUEUE: 'Queue',
      USER: 'User',
      INTEGRATION: 'Integration',
    };
    
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Alert Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(severity, category)}
              className={`px-3 py-1 rounded-full text-xs ${
                preference.categories.includes(category)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-glass-background hover:bg-glass-highlight'
              } transition-colors`}
              disabled={!preference.enabled}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render a preference panel for a severity level
  const renderPreferencePanel = (severity: AlertSeverity) => {
    const preference = preferences.find(p => p.severity === severity);
    if (!preference) return null;
    
    const severityColors = {
      CRITICAL: 'border-destructive',
      HIGH: 'border-warning',
      MEDIUM: 'border-info',
      LOW: 'border-muted',
    };
    
    const severityTitles = {
      CRITICAL: 'Critical Alerts',
      HIGH: 'High Priority Alerts',
      MEDIUM: 'Medium Priority Alerts',
      LOW: 'Low Priority Alerts',
    };
    
    return (
      <div className={`glass-panel p-4 ${severityColors[severity]} border-l-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{severityTitles[severity]}</h3>
          <Switch
            checked={preference.enabled}
            onChange={(checked) => updatePreference(severity, { enabled: checked })}
          />
        </div>
        
        {preference.enabled && (
          <>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Notification Channels</h4>
              <div className="flex flex-wrap gap-2">
                {channels.map(channel => renderChannelButton(severity, channel))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Minimum Time Between Alerts</h4>
              {renderIntervalSelector(severity)}
            </div>
            
            {renderQuietHours(severity)}
            
            {renderCategories(severity)}
          </>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="h-6 w-48 bg-glass-background rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-glass-background rounded"></div>
          <div className="h-32 bg-glass-background rounded"></div>
          <div className="h-32 bg-glass-background rounded"></div>
          <div className="h-32 bg-glass-background rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={compact ? '' : 'glass-panel p-6'}>
      <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mb-6`}>Notification Preferences</h2>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => 
          renderPreferencePanel(severity as AlertSeverity)
        )}
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} loading={saving}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
};