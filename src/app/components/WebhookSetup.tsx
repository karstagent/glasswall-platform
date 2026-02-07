import React, { useState } from 'react';

interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  enabled: boolean;
}

interface WebhookSetupProps {
  initialConfig?: WebhookConfig;
  onSave: (config: WebhookConfig) => void;
  onTest?: (config: WebhookConfig) => Promise<boolean>;
  onCancel?: () => void;
}

export default function WebhookSetup({
  initialConfig,
  onSave,
  onTest,
  onCancel,
}: WebhookSetupProps) {
  // Default webhook configuration
  const defaultConfig: WebhookConfig = {
    url: '',
    secret: '',
    events: ['message'],
    enabled: true,
  };
  
  // State for the webhook configuration
  const [config, setConfig] = useState<WebhookConfig>(initialConfig || defaultConfig);
  
  // State for testing status
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message?: string} | null>(null);
  
  // Event types available
  const availableEvents = [
    { id: 'message', name: 'Messages', description: 'Sent when a user sends a message to the agent' },
    { id: 'reaction', name: 'Reactions', description: 'Sent when a user reacts to a message' },
    { id: 'join', name: 'Room Joins', description: 'Sent when a user joins a room managed by the agent' },
    { id: 'leave', name: 'Room Leaves', description: 'Sent when a user leaves a room managed by the agent' },
  ];
  
  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      url: e.target.value,
    });
  };
  
  // Handle secret input change
  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      secret: e.target.value,
    });
  };
  
  // Handle event checkbox change
  const handleEventChange = (eventId: string, checked: boolean) => {
    if (checked) {
      // Add the event to the list
      setConfig({
        ...config,
        events: [...config.events, eventId],
      });
    } else {
      // Remove the event from the list
      setConfig({
        ...config,
        events: config.events.filter(id => id !== eventId),
      });
    }
  };
  
  // Handle enabled toggle
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      enabled: e.target.checked,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };
  
  // Handle test button click
  const handleTestClick = async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success
          ? 'Webhook test successful! Your endpoint received and processed the test event.'
          : 'Webhook test failed. Please check your endpoint URL and ensure it can receive POST requests.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Webhook test error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setTesting(false);
    }
  };
  
  // Generate a random secret
  const generateSecret = () => {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const secret = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    setConfig({
      ...config,
      secret,
    });
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Webhook Configuration</h2>
        <p className="text-gray-400 text-sm">
          Webhooks allow your agent to receive real-time notifications when events occur in your rooms.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-300 mb-1">
            Webhook URL*
          </label>
          <input
            id="webhook-url"
            type="url"
            value={config.url}
            onChange={handleUrlChange}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://your-api.example.com/webhooks"
          />
          <p className="mt-1 text-xs text-gray-500">
            The URL where GlassWall will send HTTP POST requests when events occur.
          </p>
        </div>
        
        <div>
          <label htmlFor="webhook-secret" className="block text-sm font-medium text-gray-300 mb-1">
            Webhook Secret
          </label>
          <div className="flex">
            <input
              id="webhook-secret"
              type="text"
              value={config.secret}
              onChange={handleSecretChange}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional: Add a secret to verify webhook signatures"
            />
            <button
              type="button"
              onClick={generateSecret}
              className="px-4 py-3 bg-gray-600 text-white rounded-r-lg hover:bg-gray-500 transition"
            >
              Generate
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used to generate signatures so you can verify webhooks are coming from GlassWall.
          </p>
        </div>
        
        <div>
          <span className="block text-sm font-medium text-gray-300 mb-3">
            Events to Subscribe
          </span>
          
          <div className="space-y-3">
            {availableEvents.map(event => (
              <div key={event.id} className="flex items-start">
                <input
                  id={`event-${event.id}`}
                  type="checkbox"
                  checked={config.events.includes(event.id)}
                  onChange={e => handleEventChange(event.id, e.target.checked)}
                  className="h-5 w-5 mt-0.5 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`event-${event.id}`} className="ml-3">
                  <span className="block text-sm font-medium text-white">{event.name}</span>
                  <span className="block text-xs text-gray-400">{event.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="webhook-enabled"
            type="checkbox"
            checked={config.enabled}
            onChange={handleEnabledChange}
            className="h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="webhook-enabled" className="ml-3">
            <span className="block text-sm font-medium text-white">Webhook Enabled</span>
            <span className="block text-xs text-gray-400">
              You can disable webhooks temporarily without deleting the configuration.
            </span>
          </label>
        </div>
        
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success
              ? 'bg-green-900/20 border-green-700 text-green-400'
              : 'bg-red-900/20 border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                </h3>
                <div className="mt-1 text-xs">
                  {testResult.message}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div>
            {onTest && (
              <button
                type="button"
                onClick={handleTestClick}
                disabled={testing || !config.url}
                className={`px-4 py-2 rounded-lg border border-gray-600 text-sm ${
                  testing || !config.url
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {testing ? 'Testing...' : 'Test Webhook'}
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
            >
              {initialConfig ? 'Update Webhook' : 'Create Webhook'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}