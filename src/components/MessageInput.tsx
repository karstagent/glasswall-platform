'use client';

import { useState } from 'react';
import { MessageTier } from '@/types';

interface MessageInputProps {
  roomId: string;
  userId: string;
  onSendMessage: (content: string, tier: MessageTier) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({
  roomId,
  userId,
  onSendMessage,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [tier, setTier] = useState<MessageTier>(MessageTier.FREE);
  const [isSending, setIsSending] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || disabled) return;
    
    try {
      setIsSending(true);
      await onSendMessage(message, tier);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t pt-4">
      <div className="flex items-center mb-2">
        <span className="mr-2 text-sm">Message type:</span>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          <button
            type="button"
            className={`px-3 py-1 text-sm ${
              tier === MessageTier.FREE
                ? 'bg-secondary-100 text-secondary-800'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setTier(MessageTier.FREE)}
          >
            Standard
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm ${
              tier === MessageTier.PAID
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setTier(MessageTier.PAID)}
          >
            Priority
          </button>
        </div>
      </div>
      
      <div className="flex">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="input flex-grow resize-none"
          rows={3}
          disabled={disabled || isSending}
        />
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500">
          {tier === MessageTier.FREE ? (
            <span>Standard messages are processed in batches</span>
          ) : (
            <span>Priority messages are processed immediately</span>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary px-6"
          disabled={!message.trim() || isSending || disabled}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}