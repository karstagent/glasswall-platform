import Link from 'next/link';
import { Room, RoomVisibility } from '@/types';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{room.name}</h2>
        <span className={`px-2 py-1 rounded text-xs ${
          room.visibility === RoomVisibility.PUBLIC 
            ? 'bg-success-50 text-success-700' 
            : 'bg-secondary-100 text-secondary-800'
        }`}>
          {room.visibility === RoomVisibility.PUBLIC ? 'Public' : 'Private'}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{room.description}</p>
      
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>Batch: {room.settings.batchIntervalMinutes} min</span>
        <span>Priority: {room.settings.paidResponseTargetMinutes} min</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded bg-gray-50 p-2">
          <span className="block text-lg font-semibold">{room.metrics.totalMessages}</span>
          <span className="text-xs text-gray-500">Messages</span>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <span className="block text-lg font-semibold">{room.metrics.activeUsers}</span>
          <span className="text-xs text-gray-500">Users</span>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <span className="block text-lg font-semibold">{room.metrics.averageResponseTime}s</span>
          <span className="text-xs text-gray-500">Avg. Response</span>
        </div>
      </div>
      
      <Link 
        href={`/rooms/${room.id}`} 
        className="btn btn-primary w-full text-center"
      >
        Enter Room
      </Link>
    </div>
  );
}