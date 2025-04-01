
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { getIconByName } from '@/frontend/utils/iconMap';

export type HistoryItemStatus = 'completed' | 'in-progress' | 'error' | 'pending';

export interface HistoryItemProps {
  id: string;
  title: string;
  iconName?: string;
  timestamp: Date;
  status: HistoryItemStatus;
  onClick?: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  id,
  title,
  iconName = 'MessageSquare',
  timestamp,
  status,
  onClick
}) => {
  const Icon = getIconByName(iconName);
  
  const getStatusColor = (status: HistoryItemStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: HistoryItemStatus) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'error': return 'Error';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card 
      className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${status === 'error' ? 'border-red-300' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(status)}>
          {getStatusText(status)}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default HistoryItem;
