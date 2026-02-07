import React from 'react';

interface MessageProps {
  id: string;
  content: string;
  time: string;
  sender: {
    name: string;
    avatar: string;
    isAgent: boolean;
  };
  isOwn: boolean;
  isPriority?: boolean;
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    thumbnail?: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
}

export default function MessageBubble({
  content,
  time,
  sender,
  isOwn,
  isPriority = false,
  attachments = [],
  reactions = [],
}: MessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <div className="flex-shrink-0 mr-3">
          <img
            src={sender.avatar}
            alt={sender.name}
            className={`w-10 h-10 rounded-full border ${
              sender.isAgent ? 'border-purple-500' : 'border-gray-700'
            }`}
          />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-300">{sender.name}</span>
            {sender.isAgent && (
              <span className="ml-2 px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">
                Agent
              </span>
            )}
            {isPriority && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-900/50 text-amber-300 rounded text-xs">
                Priority
              </span>
            )}
          </div>
        )}
        
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? isPriority
                ? 'bg-amber-600/20 text-amber-50 border border-amber-500/50'
                : 'bg-blue-600/20 text-blue-50 border border-blue-500/50'
              : 'bg-gray-800/70 text-gray-100 border border-gray-700'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
          
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="rounded overflow-hidden">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full h-auto rounded"
                    />
                  ) : attachment.type === 'file' ? (
                    <a
                      href={attachment.url}
                      className="flex items-center p-2 bg-gray-700/50 rounded hover:bg-gray-700 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z" />
                      </svg>
                      <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                    </a>
                  ) : (
                    <a
                      href={attachment.url}
                      className="flex items-center p-2 bg-gray-700/50 rounded hover:bg-gray-700 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                      </svg>
                      <span className="text-sm text-blue-300 truncate">{attachment.name}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex mt-1">
          <span className="text-xs text-gray-500">{time}</span>
          
          {isPriority && isOwn && (
            <span className="ml-2 text-xs text-amber-400">Priority</span>
          )}
        </div>
        
        {reactions.length > 0 && (
          <div className="flex mt-1 space-x-1">
            {reactions.map((reaction, index) => (
              <button
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${
                  reaction.reacted
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {isOwn && (
        <div className="flex-shrink-0 ml-3">
          <img
            src={sender.avatar}
            alt={sender.name}
            className={`w-10 h-10 rounded-full border ${
              sender.isAgent ? 'border-purple-500' : 'border-blue-500'
            }`}
          />
        </div>
      )}
    </div>
  );
}