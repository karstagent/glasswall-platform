import { formatDistanceToNow } from 'date-fns';
import { Message, MessageStatus, MessageTier } from '@/types';

interface MessageItemProps {
  message: Message;
  isResponse?: boolean;
}

export default function MessageItem({ message, isResponse = false }: MessageItemProps) {
  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  // Determine status badge
  const getStatusBadge = () => {
    switch(message.status) {
      case MessageStatus.QUEUED:
        return <span className="badge badge-secondary">Queued</span>;
      case MessageStatus.PROCESSING:
        return <span className="badge badge-warning">Processing</span>;
      case MessageStatus.DELIVERED:
        return <span className="badge badge-success">Delivered</span>;
      case MessageStatus.FAILED:
        return <span className="badge badge-danger">Failed</span>;
      default:
        return null;
    }
  };
  
  // Determine tier badge
  const getTierBadge = () => {
    return message.tier === MessageTier.PAID 
      ? <span className="badge badge-primary">Priority</span>
      : <span className="badge badge-secondary">Standard</span>;
  };
  
  return (
    <div className={`p-4 rounded-lg mb-4 ${
      isResponse 
        ? 'bg-primary-50 border border-primary-100 ml-8'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            isResponse ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isResponse ? 'A' : 'U'}
          </div>
          <span className="ml-2 font-medium">
            {isResponse ? 'Agent' : `User ${message.userId.substring(0, 8)}`}
          </span>
        </div>
        <div className="flex space-x-2">
          {getTierBadge()}
          {getStatusBadge()}
        </div>
      </div>
      
      <p className="text-gray-700 mb-2">{message.content}</p>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{timestamp}</span>
        {message.processedAt && (
          <span>
            Processed in {
              Math.round(
                (new Date(message.processedAt).getTime() - new Date(message.createdAt).getTime()) / 1000
              )
            }s
          </span>
        )}
        {message.batchId && (
          <span>Batch: {message.batchId.substring(0, 8)}</span>
        )}
      </div>
    </div>
  );
}