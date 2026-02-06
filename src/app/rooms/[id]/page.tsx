'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Message, MessageTier, Room, QueueStatus } from '@/types';
import MessageItem from '@/components/MessageItem';
import QueueStatusDisplay from '@/components/QueueStatus';
import MessageInput from '@/components/MessageInput';

export default function RoomPage() {
  const { id } = useParams();
  const roomId = id as string;
  
  // In a real app, this would be from authentication
  const userId = 'user-' + Math.random().toString(36).substring(2, 10);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [queueStatus, setQueueStatus] = useState<{
    free: QueueStatus;
    paid: QueueStatus;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load room');
        }
        
        const { success, data, error } = await response.json();
        
        if (!success) {
          throw new Error(error || 'Failed to load room');
        }
        
        setRoom(data);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details');
      }
    };
    
    fetchRoom();
  }, [roomId]);
  
  // Fetch messages and queue status
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/rooms/${roomId}/messages?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        
        const { success, data, error } = await response.json();
        
        if (!success) {
          throw new Error(error || 'Failed to load messages');
        }
        
        setMessages(data.messages);
        setQueueStatus(data.queueStatus);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchMessages();
      
      // Poll for updates every 10 seconds
      const intervalId = setInterval(fetchMessages, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [roomId, userId]);
  
  // Send message handler
  const handleSendMessage = async (content: string, tier: MessageTier) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          content,
          tier
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const { success, data, error } = await response.json();
      
      if (!success) {
        throw new Error(error || 'Failed to send message');
      }
      
      // Add the new message to the list
      setMessages(prev => [...prev, data.message]);
      
      // Update queue status
      setQueueStatus(prev => ({
        ...prev!,
        [tier]: data.queueStatus
      }));
      
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error}</p>
          <Link href="/rooms" className="text-danger-700 underline mt-4 inline-block">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/rooms" className="text-primary-600 hover:underline mb-2 inline-block">
            ← Back to Rooms
          </Link>
          <h1 className="text-2xl font-bold">{room?.name || 'Loading...'}</h1>
          {room && (
            <p className="text-gray-600">{room.description}</p>
          )}
        </div>
        
        {room && (
          <span className={`px-3 py-1 rounded-full text-sm ${
            room.visibility === 'public' 
              ? 'bg-success-50 text-success-700' 
              : 'bg-secondary-100 text-secondary-800'
          }`}>
            {room.visibility === 'public' ? 'Public' : 'Private'}
          </span>
        )}
      </div>
      
      {queueStatus && (
        <QueueStatusDisplay 
          free={queueStatus.free} 
          paid={queueStatus.paid} 
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        
        {loading && messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Be the first to send a message!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {messages.map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
        
        <MessageInput 
          roomId={roomId} 
          userId={userId} 
          onSendMessage={handleSendMessage} 
          disabled={loading && messages.length === 0} 
        />
      </div>
    </div>
  );
}