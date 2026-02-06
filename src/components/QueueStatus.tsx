import { formatDistance } from 'date-fns';
import { MessageTier, QueueStatus } from '@/types';

interface QueueStatusProps {
  free: QueueStatus;
  paid: QueueStatus;
}

export default function QueueStatusDisplay({ free, paid }: QueueStatusProps) {
  // Format next batch time if available
  const nextBatchFormatted = free.nextBatchAt 
    ? formatDistance(new Date(free.nextBatchAt), new Date(), { addSuffix: true })
    : 'unknown';
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-lg mb-4">Message Queue Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Free tier status */}
        <div className="border border-secondary-200 rounded p-3">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium text-secondary-800">Standard Messages</h4>
            <span className="badge badge-secondary">Batch</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Messages in queue:</span>
              <span className="font-medium">{free.messageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Batch interval:</span>
              <span className="font-medium">{free.estimatedWait} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next batch:</span>
              <span className="font-medium">{nextBatchFormatted}</span>
            </div>
          </div>
        </div>
        
        {/* Paid tier status */}
        <div className="border border-primary-200 rounded p-3">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium text-primary-800">Priority Messages</h4>
            <span className="badge badge-primary">Instant</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Messages in queue:</span>
              <span className="font-medium">{paid.messageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target response time:</span>
              <span className="font-medium">{paid.estimatedWait} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-success-700">
                {paid.messageCount > 0 ? 'Processing' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Standard messages are processed in batches every {free.estimatedWait} minutes. 
          Priority messages are processed immediately with a target response time of {paid.estimatedWait} minutes.
        </p>
      </div>
    </div>
  );
}