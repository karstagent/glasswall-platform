import React, { useState, useEffect } from 'react';
import BatchProcessingService, { 
  BatchProcessingConfig,
  BatchStatus,
  RetryPolicy
} from '@/services/BatchProcessingService';

interface BatchProcessingConfigComponentProps {
  queueName: string;
  onConfigChange?: (config: BatchProcessingConfig) => void;
}

export default function BatchProcessingConfigComponent({
  queueName,
  onConfigChange
}: BatchProcessingConfigComponentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<BatchProcessingConfig | null>(null);
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [retryPolicy, setRetryPolicy] = useState<RetryPolicy | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Form state
  const [formConfig, setFormConfig] = useState<Partial<BatchProcessingConfig>>({});
  const [formRetryPolicy, setFormRetryPolicy] = useState<Partial<RetryPolicy>>({});
  
  // Fetch data
  useEffect(() => {
    fetchData();
  }, [queueName]);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch batch configuration
      const configResponse = await BatchProcessingService.getBatchConfiguration(queueName);
      if (configResponse.success && configResponse.data) {
        setConfig(configResponse.data);
        setFormConfig(configResponse.data);
      } else if (configResponse.error) {
        setError(`Error loading batch configuration: ${configResponse.error}`);
      }
      
      // Fetch batch status
      const statusResponse = await BatchProcessingService.getBatchStatus(queueName);
      if (statusResponse.success && statusResponse.data) {
        setStatus(statusResponse.data);
      }
      
      // Fetch retry policy
      const retryPolicyResponse = await BatchProcessingService.getRetryPolicy(queueName);
      if (retryPolicyResponse.success && retryPolicyResponse.data) {
        setRetryPolicy(retryPolicyResponse.data);
        setFormRetryPolicy(retryPolicyResponse.data);
      }
    } catch (err) {
      console.error('Error fetching batch processing data:', err);
      setError('Failed to load batch processing configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfigChange = (field: keyof BatchProcessingConfig, value: any) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleRetryPolicyChange = (field: keyof RetryPolicy, value: any) => {
    setFormRetryPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update batch configuration
      const configResponse = await BatchProcessingService.updateBatchConfiguration(
        queueName, 
        formConfig
      );
      
      if (configResponse.success && configResponse.data) {
        setConfig(configResponse.data);
      } else if (configResponse.error) {
        setError(`Failed to update batch configuration: ${configResponse.error}`);
        setIsLoading(false);
        return;
      }
      
      // Update retry policy
      const retryPolicyResponse = await BatchProcessingService.updateRetryPolicy(
        queueName,
        formRetryPolicy
      );
      
      if (retryPolicyResponse.success && retryPolicyResponse.data) {
        setRetryPolicy(retryPolicyResponse.data);
      } else if (retryPolicyResponse.error) {
        setError(`Failed to update retry policy: ${retryPolicyResponse.error}`);
        setIsLoading(false);
        return;
      }
      
      // Fetch updated status
      const statusResponse = await BatchProcessingService.getBatchStatus(queueName);
      if (statusResponse.success && statusResponse.data) {
        setStatus(statusResponse.data);
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      // Notify parent component if callback is provided
      if (onConfigChange && configResponse.data) {
        onConfigChange(configResponse.data);
      }
    } catch (err) {
      console.error('Error saving batch processing configuration:', err);
      setError('Failed to save batch processing configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartBatch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BatchProcessingService.startBatchJob(queueName);
      
      if (response.success) {
        // Fetch updated status
        const statusResponse = await BatchProcessingService.getBatchStatus(queueName);
        if (statusResponse.success && statusResponse.data) {
          setStatus(statusResponse.data);
        }
      } else if (response.error) {
        setError(`Failed to start batch job: ${response.error}`);
      }
    } catch (err) {
      console.error('Error starting batch job:', err);
      setError('Failed to start batch job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 text-white">
          {error}
        </div>
      )}
      
      {isLoading && !config ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {isEditing ? (
            // Edit form
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Edit Batch Processing Configuration
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Batch Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enabled" className="block text-sm font-medium text-gray-300 mb-1">
                        Status
                      </label>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formConfig.enabled}
                            onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-white">
                            {formConfig.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="batchSize" className="block text-sm font-medium text-gray-300 mb-1">
                        Batch Size
                      </label>
                      <input
                        type="number"
                        id="batchSize"
                        value={formConfig.batchSize || 0}
                        onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="1"
                        max="1000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="batchInterval" className="block text-sm font-medium text-gray-300 mb-1">
                        Batch Interval (ms)
                      </label>
                      <input
                        type="number"
                        id="batchInterval"
                        value={formConfig.batchInterval || 0}
                        onChange={(e) => handleConfigChange('batchInterval', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="100"
                        step="100"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        How often to process batches (e.g., 5000 = every 5 seconds)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="maxConcurrentBatches" className="block text-sm font-medium text-gray-300 mb-1">
                        Max Concurrent Batches
                      </label>
                      <input
                        type="number"
                        id="maxConcurrentBatches"
                        value={formConfig.maxConcurrentBatches || 0}
                        onChange={(e) => handleConfigChange('maxConcurrentBatches', parseInt(e.target.value))}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                      Priority Strategy
                    </label>
                    <select
                      id="priority"
                      value={formConfig.priority || 'fifo'}
                      onChange={(e) => handleConfigChange('priority', e.target.value as any)}
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="fifo">First In, First Out (FIFO)</option>
                      <option value="priority-first">Priority Messages First</option>
                      <option value="time-sensitive-first">Time-Sensitive First</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      How to prioritize messages within a batch
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <h3 className="text-lg font-medium text-white">Retry Policy</h3>
                  
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formRetryPolicy.enabled}
                        onChange={(e) => handleRetryPolicyChange('enabled', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-white">
                        {formRetryPolicy.enabled ? 'Retries Enabled' : 'Retries Disabled'}
                      </span>
                    </label>
                  </div>
                  
                  {formRetryPolicy.enabled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-300 mb-1">
                            Maximum Retries
                          </label>
                          <input
                            type="number"
                            id="maxRetries"
                            value={formRetryPolicy.maxRetries || 0}
                            onChange={(e) => handleRetryPolicyChange('maxRetries', parseInt(e.target.value))}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            min="1"
                            max="10"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-1">
                            Backoff Strategy
                          </label>
                          <select
                            id="strategy"
                            value={formRetryPolicy.strategy || 'exponential'}
                            onChange={(e) => handleRetryPolicyChange('strategy', e.target.value as any)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          >
                            <option value="linear">Linear</option>
                            <option value="exponential">Exponential</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="initialDelayMs" className="block text-sm font-medium text-gray-300 mb-1">
                            Initial Delay (ms)
                          </label>
                          <input
                            type="number"
                            id="initialDelayMs"
                            value={formRetryPolicy.initialDelayMs || 0}
                            onChange={(e) => handleRetryPolicyChange('initialDelayMs', parseInt(e.target.value))}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            min="100"
                            step="100"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="maxDelayMs" className="block text-sm font-medium text-gray-300 mb-1">
                            Maximum Delay (ms)
                          </label>
                          <input
                            type="number"
                            id="maxDelayMs"
                            value={formRetryPolicy.maxDelayMs || 0}
                            onChange={(e) => handleRetryPolicyChange('maxDelayMs', parseInt(e.target.value))}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            min="1000"
                            step="1000"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormConfig(config || {});
                      setFormRetryPolicy(retryPolicy || {});
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Batch Processing Configuration
                    </h2>
                    <p className="text-gray-400 mt-1">
                      Configure how messages are processed in batches
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                  >
                    Edit Configuration
                  </button>
                </div>
                
                {config && (
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-sm text-gray-400 mb-1">Status</h3>
                        <div className={`text-white flex items-center ${
                          config.enabled ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            config.enabled ? 'bg-green-400' : 'bg-gray-400'
                          } mr-2`}></span>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-sm text-gray-400 mb-1">Batch Size</h3>
                        <p className="text-white">{config.batchSize} messages</p>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-sm text-gray-400 mb-1">Batch Interval</h3>
                        <p className="text-white">{config.batchInterval} ms</p>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-sm text-gray-400 mb-1">Priority Strategy</h3>
                        <p className="text-white capitalize">
                          {config.priority.replace(/-/g, ' ')}
                        </p>
                      </div>
                    </div>
                    
                    {retryPolicy && (
                      <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-lg font-medium text-white mb-4">Retry Policy</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Status</h3>
                            <div className={`text-white flex items-center ${
                              retryPolicy.enabled ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                retryPolicy.enabled ? 'bg-green-400' : 'bg-gray-400'
                              } mr-2`}></span>
                              {retryPolicy.enabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                          
                          {retryPolicy.enabled && (
                            <>
                              <div className="bg-gray-700/30 rounded-lg p-4">
                                <h3 className="text-sm text-gray-400 mb-1">Maximum Retries</h3>
                                <p className="text-white">{retryPolicy.maxRetries}</p>
                              </div>
                              
                              <div className="bg-gray-700/30 rounded-lg p-4">
                                <h3 className="text-sm text-gray-400 mb-1">Backoff Strategy</h3>
                                <p className="text-white capitalize">
                                  {retryPolicy.strategy}
                                </p>
                              </div>
                              
                              <div className="bg-gray-700/30 rounded-lg p-4">
                                <h3 className="text-sm text-gray-400 mb-1">Delay Range</h3>
                                <p className="text-white">
                                  {retryPolicy.initialDelayMs} - {retryPolicy.maxDelayMs} ms
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {status && (
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Batch Processing Status
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Current Batches</h3>
                      <p className="text-white text-xl font-medium">
                        {status.activeBatches}
                        <span className="text-sm text-gray-400 ml-1">/ {status.maxConcurrentBatches}</span>
                      </p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Current Batch Progress</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${status.currentBatchProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-white">{status.currentBatchProgress}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Last Batch Completed</h3>
                      <p className="text-white">
                        {status.lastBatchCompleted
                          ? new Date(status.lastBatchCompleted).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Avg. Batch Duration</h3>
                      <p className="text-white">
                        {status.averageBatchDuration.toFixed(2)} seconds
                      </p>
                    </div>
                  </div>
                  
                  {config?.enabled && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleStartBatch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        disabled={isLoading || status.activeBatches >= status.maxConcurrentBatches}
                      >
                        {isLoading ? 'Starting...' : 'Start Batch Now'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}