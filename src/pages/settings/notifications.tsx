import React from 'react';
import { NextPage } from 'next';
import { MainLayout } from '@/components/layouts/MainLayout';
import { NotificationPreferences } from '@/components/alerts/NotificationPreferences';
import { PageHeader } from '@/components/ui/PageHeader';

const NotificationsSettingsPage: NextPage = () => {
  const handleSaveComplete = () => {
    // Show success toast or confirmation message
    console.log('Notification preferences saved successfully');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Notification Settings"
          description="Configure how and when you receive alerts and notifications."
          icon="bell"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Settings', href: '/settings' },
            { label: 'Notifications', href: '/settings/notifications' },
          ]}
        />
        
        <div className="mt-6">
          <NotificationPreferences onSave={handleSaveComplete} />
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsSettingsPage;