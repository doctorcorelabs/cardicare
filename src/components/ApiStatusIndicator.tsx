import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiStatusIndicatorProps {
  status: 'online' | 'offline' | 'unknown' | 'fallback';
  onRefresh: () => void;
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ status, onRefresh }) => {
  // Different styling based on status
  const getBgColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'fallback':
        return 'bg-amber-100 text-amber-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status text
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'fallback':
        return 'Fallback Mode';
      case 'offline':
        return 'Offline';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {status === 'offline' && (
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
        </div>
      )}
      <div className={`text-xs px-2 py-1 rounded-full ${getBgColor()}`}>
        {getStatusText()}
      </div>
      {status !== 'online' && (
        <Button 
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRefresh}
          title="Refresh connection"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default ApiStatusIndicator;
