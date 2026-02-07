import React, { useState, useEffect } from 'react';
import alertService, { 
  AlertThreshold, 
  Alert, 
  MetricType, 
  AlertSeverity, 
  AlertStatus,
  ComparisonOperator,
  NotificationChannel,
  MetricDefinition
} from './AlertService';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AlertDashboard() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'thresholds' | 'metrics'>('alerts');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedThreshold, setSelectedThreshold] = useState<AlertThreshold | null>(null);
  const [isEditingThreshold, setIsEditingThreshold] = useState<boolean>(false);
  const [isCreatingThreshold, setIsCreatingThreshold] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('active');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  
  // Form state for creating/editing thresholds
  const [thresholdForm, setThresholdForm] = useState<Partial<AlertThreshold>>({
    name: '',
    description: '',
    metricType: 'system.cpu',
    comparisonOperator: '>',
    thresholdValue: 80,
    duration: 60,
    severity: 'warning',
    enabled: true,
    notifications: {
      channels: ['in-app']
    }
  });
  
  // For metric visualization
  const [selectedMetricType, setSelectedMetricType] = useState<MetricType>('system.cpu');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const [metricData, setMetricData] = useState<Array<{ value: number; timestamp: string }>>([]);
  
  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket(['alert_update', 'metric_update'], {
    autoConnect: true
  });
  
  // Fetch initial data
  useEffect(() => {
    fetchAlerts();
    fetchThresholds();
  }, []);
  
  // Process WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    const { type, data } = lastMessage;
    
    if (type === 'alert_update') {
      // Refresh alerts when a new one comes in
      fetchAlerts();
    } else if (type === 'metric_update' && data.metricType === selectedMetricType) {
      // Update metric data when new values come in
      setMetricData(prevData => {
        const newData = [...prevData, { value: data.value, timestamp: data.timestamp }];
        // Keep only the last 60 data points
        if (newData.length > 60) {
          return newData.slice(newData.length - 60);
        }
        return newData;
      });
    }
  }, [lastMessage, selectedMetricType]);
  
  // Fetch metric data when metric type changes
  useEffect(() => {
    fetchMetricData();
  }, [selectedMetricType, selectedTimeRange]);
  
  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const statusFilter = filterStatus === 'all' ? undefined : filterStatus;
      const severityFilter = filterSeverity === 'all' ? undefined : filterSeverity;
      
      const response = await alertService.getAllAlerts(100, 0, statusFilter, severityFilter);
      
      if (response.success && response.data) {
        setAlerts(response.data);
      } else {
        setError(response.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchThresholds = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await alertService.getAlertThresholds();
      
      if (response.success && response.data) {
        setThresholds(response.data);
      } else {
        setError(response.error || 'Failed to fetch alert thresholds');
      }
    } catch (err) {
      console.error('Error fetching thresholds:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMetricData = async () => {
    try {
      const response = await alertService.getMetricHistory(selectedMetricType, selectedTimeRange);
      
      if (response.success && response.data) {
        setMetricData(response.data);
      }
    } catch (err) {
      console.error('Error fetching metric data:', err);
    }
  };
  
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await alertService.acknowledgeAlert(alertId);
      
      if (response.success) {
        // Update the alert in the list
        setAlerts(prevAlerts => prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date().toISOString() } 
            : alert
        ));
        
        // If this is the selected alert, update that too
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert({
            ...selectedAlert,
            status: 'acknowledged',
            acknowledgedAt: new Date().toISOString()
          });
        }
      } else {
        setError(response.error || 'Failed to acknowledge alert');
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await alertService.resolveAlert(alertId);
      
      if (response.success) {
        // Update the alert in the list
        setAlerts(prevAlerts => prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() } 
            : alert
        ));
        
        // If this is the selected alert, update that too
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert({
            ...selectedAlert,
            status: 'resolved',
            resolvedAt: new Date().toISOString()
          });
        }
      } else {
        setError(response.error || 'Failed to resolve alert');
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleToggleThreshold = async (thresholdId: string, enabled: boolean) => {
    try {
      const response = await alertService.toggleAlertThreshold(thresholdId, enabled);
      
      if (response.success) {
        // Update the threshold in the list
        setThresholds(prevThresholds => prevThresholds.map(threshold => 
          threshold.id === thresholdId 
            ? { ...threshold, enabled } 
            : threshold
        ));
      } else {
        setError(response.error || `Failed to ${enabled ? 'enable' : 'disable'} threshold`);
      }
    } catch (err) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} threshold:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleDeleteThreshold = async (thresholdId: string) => {
    if (!confirm('Are you sure you want to delete this threshold?')) {
      return;
    }
    
    try {
      const response = await alertService.deleteAlertThreshold(thresholdId);
      
      if (response.success) {
        // Remove the threshold from the list
        setThresholds(prevThresholds => prevThresholds.filter(threshold => threshold.id !== thresholdId));
        
        // If this is the selected threshold, clear it
        if (selectedThreshold && selectedThreshold.id === thresholdId) {
          setSelectedThreshold(null);
        }
      } else {
        setError(response.error || 'Failed to delete threshold');
      }
    } catch (err) {
      console.error('Error deleting threshold:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleTestThreshold = async (thresholdId: string) => {
    try {
      await alertService.testAlertThreshold(thresholdId);
      // No need to handle the response, as we'll get a WebSocket notification
      // when the test alert is created
    } catch (err) {
      console.error('Error testing threshold:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleSaveThreshold = async () => {
    if (!thresholdForm.name || !thresholdForm.metricType || thresholdForm.thresholdValue === undefined) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      let response;
      
      if (isEditingThreshold && selectedThreshold) {
        // Update existing threshold
        response = await alertService.updateAlertThreshold(selectedThreshold.id, thresholdForm);
      } else {
        // Create new threshold
        response = await alertService.createAlertThreshold(thresholdForm as any);
      }
      
      if (response.success) {
        // Refresh thresholds
        fetchThresholds();
        
        // Clear form and reset state
        setThresholdForm({
          name: '',
          description: '',
          metricType: 'system.cpu',
          comparisonOperator: '>',
          thresholdValue: 80,
          duration: 60,
          severity: 'warning',
          enabled: true,
          notifications: {
            channels: ['in-app']
          }
        });
        setIsEditingThreshold(false);
        setIsCreatingThreshold(false);
        setSelectedThreshold(null);
      } else {
        setError(response.error || 'Failed to save threshold');
      }
    } catch (err) {
      console.error('Error saving threshold:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleEditThreshold = (threshold: AlertThreshold) => {
    setSelectedThreshold(threshold);
    setThresholdForm({
      name: threshold.name,
      description: threshold.description,
      metricType: threshold.metricType,
      customMetricName: threshold.customMetricName,
      comparisonOperator: threshold.comparisonOperator,
      thresholdValue: threshold.thresholdValue,
      duration: threshold.duration,
      severity: threshold.severity,
      enabled: threshold.enabled,
      notifications: {
        channels: threshold.notifications.channels,
        recipients: threshold.notifications.recipients
      }
    });
    setIsEditingThreshold(true);
    setIsCreatingThreshold(false);
  };
  
  const handleCreateThreshold = () => {
    setSelectedThreshold(null);
    setThresholdForm({
      name: '',
      description: '',
      metricType: 'system.cpu',
      comparisonOperator: '>',
      thresholdValue: 80,
      duration: 60,
      severity: 'warning',
      enabled: true,
      notifications: {
        channels: ['in-app']
      }
    });
    setIsEditingThreshold(false);
    setIsCreatingThreshold(true);
  };
  
  const handleFormChange = (field: string, value: any) => {
    setThresholdForm(prev => {
      // Handle nested fields
      if (field === 'notifications.channels') {
        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            channels: value
          }
        };
      } else if (field === 'notifications.recipients') {
        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            recipients: value
          }
        };
      }
      
      // Handle top-level fields
      return {
        ...prev,
        [field]: value
      };
    });
  };
  
  const getMetricName = (metricType: MetricType, customMetricName?: string): string => {
    if (metricType === 'custom' && customMetricName) {
      return customMetricName;
    }
    
    const metricDefinition = alertService.getMetricDefinitions().find(m => m.type === metricType);
    return metricDefinition?.name || metricType;
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    }
  };
  
  // Demo alerts for development
  const demoAlerts: Alert[] = [
    {
      id: '1',
      thresholdId: '1',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      metricType: 'system.cpu',
      metricValue: 92.5,
      thresholdValue: 90,
      comparisonOperator: '>',
      severity: 'error',
      message: 'CPU usage is above 90% (current: 92.5%)',
      status: 'active'
    },
    {
      id: '2',
      thresholdId: '2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      metricType: 'api.latency',
      metricValue: 1250,
      thresholdValue: 1000,
      comparisonOperator: '>',
      severity: 'warning',
      message: 'API latency is above 1000ms (current: 1250ms)',
      status: 'acknowledged',
      acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      acknowledgedBy: 'admin'
    },
    {
      id: '3',
      thresholdId: '3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metricType: 'db.queries',
      metricValue: 750,
      thresholdValue: 500,
      comparisonOperator: '>',
      severity: 'warning',
      message: 'Database query rate is above 500 queries/s (current: 750 queries/s)',
      status: 'resolved',
      acknowledgedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
      acknowledgedBy: 'admin',
      resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // Demo thresholds for development
  const demoThresholds: AlertThreshold[] = [
    {
      id: '1',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds 90%',
      metricType: 'system.cpu',
      comparisonOperator: '>',
      thresholdValue: 90,
      duration: 60, // 1 minute
      severity: 'error',
      enabled: true,
      notifications: {
        channels: ['in-app', 'email']
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'API Latency Warning',
      description: 'Alert when API latency exceeds 1000ms',
      metricType: 'api.latency',
      comparisonOperator: '>',
      thresholdValue: 1000,
      duration: 120, // 2 minutes
      severity: 'warning',
      enabled: true,
      notifications: {
        channels: ['in-app']
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Database Query Rate',
      description: 'Alert when database query rate exceeds 500 queries/s',
      metricType: 'db.queries',
      comparisonOperator: '>',
      thresholdValue: 500,
      duration: 180, // 3 minutes
      severity: 'warning',
      enabled: true,
      notifications: {
        channels: ['in-app', 'email']
      },
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // Use demo data if API calls haven't completed
  const displayAlerts = alerts.length > 0 ? alerts : demoAlerts;
  const displayThresholds = thresholds.length > 0 ? thresholds : demoThresholds;
  
  // Demo metric data for development
  const demoMetricData = Array.from({ length: 60 }, (_, i) => ({
    value: 70 + Math.random() * 15,
    timestamp: new Date(Date.now() - (59 - i) * 60 * 1000).toISOString() // Last 60 minutes
  }));
  
  // Use demo data if API calls haven't completed
  const displayMetricData = metricData.length > 0 ? metricData : demoMetricData;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">System Monitoring</h1>
        <p className="text-gray-400">
          Monitor system performance, set alert thresholds, and manage notifications.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 text-white">
          {error}
        </div>
      )}
      
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'alerts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'thresholds'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('thresholds')}
        >
          Thresholds
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'metrics'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
      </div>
      
      {activeTab === 'alerts' && (
        <div>
          <div className="flex flex-wrap gap-4 justify-between mb-6">
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as AlertStatus | 'all')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
              
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {displayAlerts.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-400">No alerts found matching your filters.</p>
                </div>
              ) : (
                displayAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4 cursor-pointer ${
                      selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${alertService.getSeverityColorClass(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        alert.status === 'active'
                          ? 'bg-red-600/20 text-red-400'
                          : alert.status === 'acknowledged'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {alert.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-white">{alert.message}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      <span>{getMetricName(alert.metricType, alert.customMetricName)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="lg:col-span-2">
              {selectedAlert ? (
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${alertService.getSeverityColorClass(selectedAlert.severity)}`}>
                        {selectedAlert.severity.toUpperCase()}
                      </div>
                      <h3 className="text-xl font-bold text-white mt-2">
                        {getMetricName(selectedAlert.metricType, selectedAlert.customMetricName)} Alert
                      </h3>
                    </div>
                    
                    <div className={`px-2 py-1 rounded text-xs ${
                      selectedAlert.status === 'active'
                        ? 'bg-red-600/20 text-red-400'
                        : selectedAlert.status === 'acknowledged'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-green-600/20 text-green-400'
                    }`}>
                      {selectedAlert.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-gray-400 mb-1">Alert Message</h4>
                      <p className="text-white">{selectedAlert.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-sm text-gray-400 mb-1">Metric Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Metric Type:</span>
                            <span className="text-white">{getMetricName(selectedAlert.metricType, selectedAlert.customMetricName)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Value:</span>
                            <span className="text-white">{selectedAlert.metricValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Threshold:</span>
                            <span className="text-white">{selectedAlert.comparisonOperator} {selectedAlert.thresholdValue}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-sm text-gray-400 mb-1">Alert Timeline</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Triggered:</span>
                            <span className="text-white">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                          </div>
                          
                          {selectedAlert.acknowledgedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Acknowledged:</span>
                              <span className="text-white">{new Date(selectedAlert.acknowledgedAt).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {selectedAlert.resolvedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Resolved:</span>
                              <span className="text-white">{new Date(selectedAlert.resolvedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedAlert.status !== 'resolved' && (
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        {selectedAlert.status === 'active' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(selectedAlert.id)}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
                          >
                            Acknowledge
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleResolveAlert(selectedAlert.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 h-full flex items-center justify-center">
                  <p className="text-gray-400">Select an alert to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'thresholds' && (
        <div>
          {(isEditingThreshold || isCreatingThreshold) ? (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {isEditingThreshold ? 'Edit Threshold' : 'Create Threshold'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm text-gray-300">
                    Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={thresholdForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    placeholder="E.g., High CPU Usage"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block mb-2 text-sm text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={thresholdForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    rows={2}
                    placeholder="E.g., Alert when CPU usage exceeds 90%"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="metricType" className="block mb-2 text-sm text-gray-300">
                      Metric Type*
                    </label>
                    <select
                      id="metricType"
                      value={thresholdForm.metricType}
                      onChange={(e) => handleFormChange('metricType', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      {alertService.getMetricDefinitions().map(metric => (
                        <option key={metric.type} value={metric.type}>
                          {metric.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {thresholdForm.metricType === 'custom' && (
                    <div>
                      <label htmlFor="customMetricName" className="block mb-2 text-sm text-gray-300">
                        Custom Metric Name*
                      </label>
                      <input
                        type="text"
                        id="customMetricName"
                        value={thresholdForm.customMetricName || ''}
                        onChange={(e) => handleFormChange('customMetricName', e.target.value)}
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="E.g., kafka.lag"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="comparisonOperator" className="block mb-2 text-sm text-gray-300">
                      Operator*
                    </label>
                    <select
                      id="comparisonOperator"
                      value={thresholdForm.comparisonOperator}
                      onChange={(e) => handleFormChange('comparisonOperator', e.target.value as ComparisonOperator)}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value=">">Greater than (&gt;)</option>
                      <option value=">=">Greater than or equal to (&gt;=)</option>
                      <option value="<">Less than (&lt;)</option>
                      <option value="<=">Less than or equal to (&lt;=)</option>
                      <option value="==">Equal to (==)</option>
                      <option value="!=">Not equal to (!=)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="thresholdValue" className="block mb-2 text-sm text-gray-300">
                      Threshold Value*
                    </label>
                    <input
                      type="number"
                      id="thresholdValue"
                      value={thresholdForm.thresholdValue}
                      onChange={(e) => handleFormChange('thresholdValue', parseFloat(e.target.value))}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block mb-2 text-sm text-gray-300">
                      Duration (seconds)*
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={thresholdForm.duration}
                      onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      min="0"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time the condition must persist before alerting
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="severity" className="block mb-2 text-sm text-gray-300">
                      Severity*
                    </label>
                    <select
                      id="severity"
                      value={thresholdForm.severity}
                      onChange={(e) => handleFormChange('severity', e.target.value as AlertSeverity)}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm text-gray-300">
                      Notification Channels*
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['in-app', 'email', 'sms', 'webhook'] as NotificationChannel[]).map(channel => (
                        <div key={channel} className="flex items-center">
                          <input
                            id={`channel-${channel}`}
                            type="checkbox"
                            checked={(thresholdForm.notifications?.channels || []).includes(channel)}
                            onChange={(e) => {
                              const currentChannels = thresholdForm.notifications?.channels || [];
                              const newChannels = e.target.checked
                                ? [...currentChannels, channel]
                                : currentChannels.filter(c => c !== channel);
                              handleFormChange('notifications.channels', newChannels);
                            }}
                            className="h-4 w-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                          />
                          <label htmlFor={`channel-${channel}`} className="ml-2 text-sm text-gray-300 capitalize">
                            {channel.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {(thresholdForm.notifications?.channels || []).some(c => ['email', 'sms', 'webhook'].includes(c)) && (
                  <div>
                    <label htmlFor="recipients" className="block mb-2 text-sm text-gray-300">
                      Recipients (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="recipients"
                      value={(thresholdForm.notifications?.recipients || []).join(', ')}
                      onChange={(e) => {
                        const recipients = e.target.value
                          .split(',')
                          .map(r => r.trim())
                          .filter(Boolean);
                        handleFormChange('notifications.recipients', recipients);
                      }}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      placeholder="email@example.com, +1234567890, https://webhook.example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email addresses, phone numbers, or webhook URLs
                    </p>
                  </div>
                )}
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={thresholdForm.enabled}
                    onChange={(e) => handleFormChange('enabled', e.target.checked)}
                    className="h-4 w-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="ml-2 text-sm text-gray-300">
                    Enable this threshold
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingThreshold(false);
                      setIsCreatingThreshold(false);
                    }}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSaveThreshold}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                  >
                    {isEditingThreshold ? 'Update Threshold' : 'Create Threshold'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCreateThreshold}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Create Threshold
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {displayThresholds.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 text-center">
                    <p className="text-gray-400">No alert thresholds found.</p>
                  </div>
                ) : (
                  displayThresholds.map(threshold => (
                    <div
                      key={threshold.id}
                      className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6"
                    >
                      <div className="flex flex-wrap justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{threshold.name}</h3>
                          <p className="text-gray-400">{threshold.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs font-bold ${alertService.getSeverityColorClass(threshold.severity)}`}>
                            {threshold.severity.toUpperCase()}
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={threshold.enabled}
                              onChange={(e) => handleToggleThreshold(threshold.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <h4 className="text-sm text-gray-400 mb-1">Metric</h4>
                          <p className="text-white">{getMetricName(threshold.metricType, threshold.customMetricName)}</p>
                        </div>
                        
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <h4 className="text-sm text-gray-400 mb-1">Condition</h4>
                          <p className="text-white">{threshold.comparisonOperator} {threshold.thresholdValue}</p>
                        </div>
                        
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <h4 className="text-sm text-gray-400 mb-1">Duration</h4>
                          <p className="text-white">{formatDuration(threshold.duration)}</p>
                        </div>
                        
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <h4 className="text-sm text-gray-400 mb-1">Notifications</h4>
                          <div className="flex flex-wrap gap-1">
                            {threshold.notifications.channels.map(channel => (
                              <span key={channel} className="px-2 py-0.5 text-xs rounded bg-blue-600/20 text-blue-400 capitalize">
                                {channel.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(threshold.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTestThreshold(threshold.id)}
                            className="px-3 py-1 text-sm bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded"
                          >
                            Test
                          </button>
                          
                          <button
                            onClick={() => handleEditThreshold(threshold)}
                            className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                          >
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleDeleteThreshold(threshold.id)}
                            className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'metrics' && (
        <div>
          <div className="flex flex-wrap gap-4 justify-between mb-6">
            <div className="flex gap-4">
              <select
                value={selectedMetricType}
                onChange={e => setSelectedMetricType(e.target.value as MetricType)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {alertService.getMetricDefinitions().map(metric => (
                  <option key={metric.type} value={metric.type}>
                    {metric.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedTimeRange}
                onChange={e => setSelectedTimeRange(e.target.value as 'hour' | 'day' | 'week')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="hour">Last Hour</option>
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
              </select>
            </div>
            
            <button
              onClick={fetchMetricData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Refresh
            </button>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {getMetricName(selectedMetricType)} Trend
            </h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayMetricData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    tick={{ fill: '#aaa' }}
                  />
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#222', 
                      borderColor: '#555',
                      color: '#fff'
                    }}
                    labelFormatter={timestamp => new Date(timestamp).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={getMetricName(selectedMetricType)} 
                    stroke="#0088FE" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-gray-400 text-sm">Current Value:</span>
                <span className="text-white text-sm ml-2">
                  {displayMetricData.length > 0 ? displayMetricData[displayMetricData.length - 1].value.toFixed(2) : 'N/A'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Average:</span>
                <span className="text-white text-sm ml-2">
                  {displayMetricData.length > 0 
                    ? (displayMetricData.reduce((sum, d) => sum + d.value, 0) / displayMetricData.length).toFixed(2) 
                    : 'N/A'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Last Updated:</span>
                <span className="text-white text-sm ml-2">
                  {displayMetricData.length > 0 
                    ? new Date(displayMetricData[displayMetricData.length - 1].timestamp).toLocaleTimeString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Active Thresholds for this Metric */}
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Active Thresholds</h3>
              
              {displayThresholds.filter(t => t.metricType === selectedMetricType && t.enabled).length === 0 ? (
                <p className="text-gray-400">No active thresholds for this metric.</p>
              ) : (
                <div className="space-y-4">
                  {displayThresholds
                    .filter(t => t.metricType === selectedMetricType && t.enabled)
                    .map(threshold => (
                      <div key={threshold.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <span className="text-white">{threshold.name}</span>
                          <div className="flex items-center mt-1">
                            <span className={`mr-2 px-2 py-0.5 text-xs rounded ${alertService.getSeverityColorClass(threshold.severity)}`}>
                              {threshold.severity}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {threshold.comparisonOperator} {threshold.thresholdValue}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleEditThreshold(threshold)}
                          className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
              
              <div className="mt-4">
                <button
                  onClick={() => {
                    setThresholdForm({
                      ...thresholdForm,
                      metricType: selectedMetricType
                    });
                    handleCreateThreshold();
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Threshold for this Metric
                </button>
              </div>
            </div>
            
            {/* Recent Alerts for this Metric */}
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Alerts</h3>
              
              {displayAlerts.filter(a => a.metricType === selectedMetricType).length === 0 ? (
                <p className="text-gray-400">No recent alerts for this metric.</p>
              ) : (
                <div className="space-y-4">
                  {displayAlerts
                    .filter(a => a.metricType === selectedMetricType)
                    .slice(0, 5) // Show only the 5 most recent
                    .map(alert => (
                      <div key={alert.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <div className="flex items-center">
                            <span className={`mr-2 px-2 py-0.5 text-xs rounded ${alertService.getSeverityColorClass(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              alert.status === 'active'
                                ? 'bg-red-600/20 text-red-400'
                                : alert.status === 'acknowledged'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-green-600/20 text-green-400'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <div className="mt-1 text-white text-sm">{alert.message}</div>
                        </div>
                        
                        <div className="text-gray-400 text-xs">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
              
              <div className="mt-4">
                <button
                  onClick={() => {
                    setActiveTab('alerts');
                    setFilterStatus('all');
                    setFilterSeverity('all');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </span>
        </div>
        
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}