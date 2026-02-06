import React, { useState, useEffect } from 'react';
import { Message, MessageStatus, MessageTier, QueueStatus } from '@/types';

type MessageQueueProps = {
  roomId: string;
  userId: string;
};

export default function MessageQueue({ roomId, userId }: MessageQueueProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [queueStatus, setQueueStatus] = useState<{
    free: QueueStatus;
    paid: QueueStatus;
  }>({
    free: { messageCount: 0, estimatedWait: 0 },
    paid: { messageCount: 0, estimatedWait: 0 }
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState<MessageTier>(MessageTier.FREE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch messages and queue status on load
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for updates
    const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [roomId, userId]);
  
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        setQueueStatus(data.data.queueStatus);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          content: newMessage,
          tier: selectedTier
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        setMessages(prevMessages => [result.data.message, ...prevMessages]);
        setQueueStatus(prevStatus => ({
          ...prevStatus,
          [selectedTier]: result.data.queueStatus
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };
  
  const getStatusLabel = (status: MessageStatus): { label: string; color: string } => {
    switch (status) {
      case MessageStatus.QUEUED:
        return { label: 'Queued', color: 'bg-yellow-600/20 text-yellow-400' };
      case MessageStatus.PROCESSING:
        return { label: 'Processing', color: 'bg-blue-600/20 text-blue-400' };
      case MessageStatus.DELIVERED:
        return { label: 'Delivered', color: 'bg-green-600/20 text-green-400' };
      case MessageStatus.FAILED:
        return { label: 'Failed', color: 'bg-red-600/20 text-red-400' };
      default:
        return { label: 'Unknown', color: 'bg-gray-600/20 text-gray-400' };
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Free Queue</h3>
            <div className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm">
              {queueStatus.free.messageCount} messages
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Estimated wait:</span>
              <span className="ml-2 text-white">{formatTime(queueStatus.free.estimatedWait)}</span>
            </div>
            {queueStatus.free.nextBatchAt && (
              <div>
                <span className="text-gray-400">Next batch:</span>
                <span className="ml-2 text-white">
                  {new Date(queueStatus.free.nextBatchAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Priority Queue</h3>
            <div className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-sm">
              {queueStatus.paid.messageCount} messages
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Estimated wait:</span>
              <span className="ml-2 text-white">{formatTime(queueStatus.paid.estimatedWait)}</span>
            </div>
            <div>
              <span className="text-gray-400">Processing:</span>
              <span className="ml-2 text-white">Immediate</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Message Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block mb-2 text-gray-300">
            New Message
          </label>
          <textarea
            id="message"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            rows={3}
            placeholder="Type your message here..."
            required
          />
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/30 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex w-full sm:w-auto">
            <button
              type="button"
              className={`px-4 py-2 rounded-l-lg ${
                selectedTier === MessageTier.FREE
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTier(MessageTier.FREE)}
            >
              Free Tier
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r-lg ${
                selectedTier === MessageTier.PAID
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTier(MessageTier.PAID)}
            >
              Priority Tier
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !newMessage.trim()}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium 
              ${isSubmitting || !newMessage.trim()
                ? 'bg-blue-800 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
      
      {/* Message History */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Your Messages</h3>
        
        {messages.length === 0 ? (
          <div className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl text-center text-gray-400">
            No messages yet. Send your first message above.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => {
              const status = getStatusLabel(message.status);
              
              return (
                <div 
                  key={message.id} 
                  className="p-4 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`px-3 py-1 rounded-full text-sm ${status.color}`}>
                      {status.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mb-2 text-white whitespace-pre-wrap">{message.content}</div>
                  <div className="flex justify-between items-center text-sm">
                    <div className={`px-3 py-1 rounded-full text-xs
                      ${message.tier === MessageTier.PAID 
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'bg-blue-600/20 text-blue-400'
                      }`}
                    >
                      {message.tier === MessageTier.PAID ? 'Priority' : 'Free'} Tier
                    </div>
                    {message.processedAt && (
                      <div className="text-gray-400">
                        Processed: {new Date(message.processedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}