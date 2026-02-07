import React, { useState, useEffect } from 'react';
import BatchProcessingService from '@/services/BatchProcessingService';

interface FailedMessage {
  id: string;
  queueName: string;
  retries: number;
  lastErrorMessage: string;
  lastErrorTimestamp: string;
  payload: any;
}

interface FailedMessagesViewProps {
  queueName: string;
  onMessageAction?: (messageId: string, action: 'requeue' | 'delete') => void;
}

export default function FailedMessagesView({
  queueName,
  onMessageAction
}: FailedMessagesViewProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [selectedMessage, setSelectedMessage] = useState<FailedMessage | null>(null);
  const [page, setPage] = useState<number>(1);
  const [expandedPayload, setExpandedPayload] = useState<boolean>(false);
  
  const pageSize = 10;
  
  useEffect(() => {
    fetchFailedMessages();
  }, [queueName, page]);
  
  const fetchFailedMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * pageSize;
      const response = await BatchProcessingService.getFailedMessages(
        queueName,
        pageSize,
        offset
      );
      
      if (response.success && response.data) {
        setFailedMessages(response.data.messages);
        setTotalMessages(response.data.total);
        
        // Auto-select first message if none selected
        if (!selectedMessage && response.data.messages.length > 0) {
          setSelectedMessage(response.data.messages[0]);
        }
      } else if (response.error) {
        setError(`Error loading failed messages: ${response.error}`);
      }
    } catch (err) {
      console.error('Error fetching failed messages:', err);
      setError('Failed to load failed messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequeueMessage = async (messageId: string, resetRetries: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BatchProcessingService.requeueFailedMessage(
        queueName,
        messageId,
        resetRetries
      );
      
      if (response.success) {
        // Remove the message from the list
        setFailedMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== messageId)
        );
        
        // Clear selected message if it was requeued
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
        
        // Update total count
        setTotalMessages(prev => prev - 1);
        
        // Notify parent if callback provided
        if (onMessageAction) {
          onMessageAction(messageId, 'requeue');
        }
      } else if (response.error) {
        setError(`Failed to requeue message: ${response.error}`);
      }
    } catch (err) {
      console.error('Error requeuing message:', err);
      setError('Failed to requeue message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetRetries = async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BatchProcessingService.resetMessageRetries(
        queueName,
        messageId
      );
      
      if (response.success) {
        // Update the message in the list
        setFailedMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, retries: 0 } 
              : msg
          )
        );
        
        // Update selected message if it was reset
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage({ ...selectedMessage, retries: 0 });
        }
      } else if (response.error) {
        setError(`Failed to reset retries: ${response.error}`);
      }
    } catch (err) {
      console.error('Error resetting retries:', err);
      setError('Failed to reset retries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getErrorTypeFromMessage = (errorMessage: string): string => {
    if (errorMessage.includes('timeout')) {
      return 'Timeout';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Network';
    } else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return 'Authentication';
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'Validation';
    } else {
      return 'Unknown';
    }
  };
  
  const getErrorBadgeClass = (errorType: string): string => {
    switch (errorType) {
      case 'Timeout':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'Network':
        return 'bg-red-600/20 text-red-400';
      case 'Authentication':
        return 'bg-purple-600/20 text-purple-400';
      case 'Validation':
        return 'bg-blue-600/20 text-blue-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };
  
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatPayload = (payload: any): string => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch (e) {
      return 'Unable to format payload';
    }
  };
  
  const totalPages = Math.ceil(totalMessages / pageSize);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Failed Messages</h2>
        <p className="text-gray-400">
          {totalMessages} message{totalMessages !== 1 ? 's' : ''} failed after maximum retry attempts
        </p>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 text-white">
          {error}
        </div>
      )}
      
      {isLoading && failedMessages.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {failedMessages.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400">No failed messages found.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {failedMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 ${
                          selectedMessage?.id === message.id ? 'bg-gray-700/70' : ''
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            getErrorBadgeClass(getErrorTypeFromMessage(message.lastErrorMessage))
                          }`}>
                            {getErrorTypeFromMessage(message.lastErrorMessage)}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {message.retries} retries
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-sm text-white truncate">
                            {message.lastErrorMessage}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span title={formatTimestamp(message.lastErrorTimestamp)}>
                            {new Date(message.lastErrorTimestamp).toLocaleDateString()}
                          </span>
                          <span className="truncate max-w-[100px]" title={message.id}>
                            ID: {message.id.slice(0, 6)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center bg-gray-800 p-3 border-t border-gray-700">
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded text-sm ${
                          page === 1
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-white bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <span className="text-gray-400 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`px-3 py-1 rounded text-sm ${
                          page === totalPages
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-white bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={fetchFailedMessages}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Refresh List
                  </button>
                  
                  <div className="text-xs text-gray-400">
                    Showing {failedMessages.length} of {totalMessages} messages
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      getErrorBadgeClass(getErrorTypeFromMessage(selectedMessage.lastErrorMessage))
                    }`}>
                      {getErrorTypeFromMessage(selectedMessage.lastErrorMessage)}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-2">
                      Failed Message Details
                    </h3>
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {selectedMessage.retries} retries
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm text-gray-400">Error Message</h4>
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                      <p className="text-white">{selectedMessage.lastErrorMessage}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Message Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Message ID:</span>
                          <span className="text-white">{selectedMessage.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Queue:</span>
                          <span className="text-white">{selectedMessage.queueName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Error:</span>
                          <span className="text-white">{formatTimestamp(selectedMessage.lastErrorTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Retry Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Retry Count:</span>
                          <span className="text-white">{selectedMessage.retries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Error Type:</span>
                          <span className="text-white">{getErrorTypeFromMessage(selectedMessage.lastErrorMessage)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Retry Status:</span>
                          <span className="text-red-400">Failed (Max Retries Reached)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm text-gray-400">Message Payload</h4>
                      <button
                        onClick={() => setExpandedPayload(prev => !prev)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {expandedPayload ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                    <div className={`bg-gray-900 rounded-lg overflow-auto ${
                      expandedPayload ? 'max-h-96' : 'max-h-32'
                    }`}>
                      <pre className="p-3 text-sm text-white whitespace-pre-wrap">
                        {formatPayload(selectedMessage.payload)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleResetRetries(selectedMessage.id)}
                      className="px-3 py-1.5 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 rounded-lg text-sm"
                      disabled={isLoading}
                    >
                      Reset Retry Count
                    </button>
                    
                    <div className="relative group">
                      <button
                        onClick={() => handleRequeueMessage(selectedMessage.id, false)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-400 hover:bg-blue-600/20 rounded-lg text-sm"
                        disabled={isLoading}
                      >
                        Requeue (Keep Retries)
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRequeueMessage(selectedMessage.id, true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
                      disabled={isLoading}
                    >
                      Requeue with Reset
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 h-full flex items-center justify-center">
                <p className="text-gray-400">Select a failed message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}