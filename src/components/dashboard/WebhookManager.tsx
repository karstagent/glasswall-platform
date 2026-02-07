import React, { useState, useEffect } from 'react';
import apiService from '@/services/ApiService';
import WebhookSetup from '@/app/components/WebhookSetup';

interface Webhook {
  id: string;
  url: string;
  secret?: string;
  events: string[];
  enabled: boolean;
  retryCount: number;
  timeoutMs: number;
  createdAt: number;
  updatedAt: number;
}

interface WebhookDelivery {
  id: string;
  webhookUrl: string;
  agentId: string;
  payload: {
    event: string;
    timestamp: number;
  };
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  nextRetryAt?: number;
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    fetchWebhooks();
  }, []);
  
  const fetchWebhooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Webhook[]>('webhooks');
      
      if (response.success && response.data) {
        setWebhooks(response.data);
      } else {
        setError(response.error || 'Failed to fetch webhooks');
      }
    } catch (err) {
      console.error('Error fetching webhooks:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWebhookDeliveries = async (webhookId: string) => {
    try {
      const response = await apiService.get<WebhookDelivery[]>(`webhooks/${webhookId}/deliveries`);
      
      if (response.success && response.data) {
        setDeliveries(response.data);
      }
    } catch (err) {
      console.error(`Error fetching webhook deliveries for ${webhookId}:`, err);
    }
  };
  
  const handleSaveWebhook = async (webhookConfig: any) => {
    try {
      let response;
      
      if (editingWebhook) {
        // Update existing webhook
        response = await apiService.put(`webhooks/${editingWebhook.id}`, webhookConfig);
      } else {
        // Create new webhook
        response = await apiService.post('webhooks', webhookConfig);
      }
      
      if (response.success) {
        // Refresh webhook list
        fetchWebhooks();
        
        // Clear editing state
        setEditingWebhook(null);
        setIsCreating(false);
      } else {
        setError(response.error || 'Failed to save webhook');
      }
    } catch (err) {
      console.error('Error saving webhook:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleTestWebhook = async (webhookConfig: any): Promise<boolean> => {
    try {
      const response = await apiService.post('webhooks/test', webhookConfig);
      
      return response.success;
    } catch (err) {
      console.error('Error testing webhook:', err);
      return false;
    }
  };
  
  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    
    try {
      const response = await apiService.delete(`webhooks/${webhookId}`);
      
      if (response.success) {
        // Refresh webhook list
        fetchWebhooks();
      } else {
        setError(response.error || 'Failed to delete webhook');
      }
    } catch (err) {
      console.error('Error deleting webhook:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleToggleWebhook = async (webhookId: string, enabled: boolean) => {
    try {
      const response = await apiService.patch(`webhooks/${webhookId}`, { enabled });
      
      if (response.success) {
        // Update webhook in state
        setWebhooks(prevWebhooks =>
          prevWebhooks.map(webhook =>
            webhook.id === webhookId
              ? { ...webhook, enabled }
              : webhook
          )
        );
      } else {
        setError(response.error || `Failed to ${enabled ? 'enable' : 'disable'} webhook`);
      }
    } catch (err) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} webhook:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get event names as a string
  const getEventNames = (events: string[]): string => {
    if (events.length === 0) return 'None';
    if (events.length === 1) return events[0];
    if (events.length === 2) return events.join(' and ');
    return `${events.slice(0, -1).join(', ')}, and ${events.slice(-1)}`;
  };
  
  // Demo data for development purposes
  const demoWebhooks: Webhook[] = [
    {
      id: '1',
      url: 'https://api.example.com/webhooks/glasswall',
      secret: '8f7d9a6e5c4b3a2f1e0d',
      events: ['message', 'reaction'],
      enabled: true,
      retryCount: 3,
      timeoutMs: 5000,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: '2',
      url: 'https://hooks.zapier.com/12345/abcdef',
      events: ['message'],
      enabled: false,
      retryCount: 3,
      timeoutMs: 5000,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
    },
  ];
  
  // Use demo data if no real data is available
  const displayWebhooks = webhooks.length > 0 ? webhooks : demoWebhooks;
  
  if (editingWebhook || isCreating) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingWebhook(null);
              setIsCreating(false);
            }}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Webhooks
          </button>
        </div>
        
        <WebhookSetup
          initialConfig={editingWebhook ?? undefined}
          onSave={handleSaveWebhook}
          onTest={handleTestWebhook}
          onCancel={() => {
            setEditingWebhook(null);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }
  
  if (isLoading && webhooks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading webhooks...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Webhooks</h2>
        
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Add Webhook
        </button>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {displayWebhooks.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Webhooks Configured</h3>
          <p className="text-gray-400 mb-4">
            Add a webhook to receive notifications when events occur in your rooms.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Add Your First Webhook
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayWebhooks.map(webhook => (
            <div
              key={webhook.id}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="mb-2 md:mb-0">
                  <h3 className="text-xl font-semibold text-white">
                    {new URL(webhook.url).hostname}
                  </h3>
                  <p className="text-sm text-gray-400">{webhook.url}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-400 mr-2">Enabled</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={webhook.enabled}
                        onChange={(e) => handleToggleWebhook(webhook.id, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingWebhook(webhook)}
                      className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-gray-700"
                      title="Edit webhook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-gray-700"
                      title="Delete webhook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm text-gray-400 mb-1">Events</h4>
                  <p className="text-white text-sm">
                    {getEventNames(webhook.events)}
                  </p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm text-gray-400 mb-1">Security</h4>
                  <p className="text-white text-sm">
                    {webhook.secret ? 'Signed with secret' : 'No signing secret'}
                  </p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm text-gray-400 mb-1">Last Updated</h4>
                  <p className="text-white text-sm">
                    {formatTimestamp(webhook.updatedAt)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => fetchWebhookDeliveries(webhook.id)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View Delivery History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {deliveries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Recent Deliveries</h3>
          
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Event</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(delivery => (
                  <tr key={delivery.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4">{delivery.id.substring(0, 8)}</td>
                    <td className="px-6 py-4">{delivery.payload.event}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        delivery.status === 'success'
                          ? 'bg-green-600/20 text-green-400'
                          : delivery.status === 'pending'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatTimestamp(delivery.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}