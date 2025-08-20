import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Wifi } from 'lucide-react';
import { Button } from './Button';

interface RealTimeIndicatorProps {
  isPolling?: boolean;
  lastUpdate?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function RealTimeIndicator({
  isPolling = false,
  lastUpdate,
  onRefresh,
  isRefreshing = false,
  className = '',
}: RealTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else if (seconds > 0) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        setTimeAgo('Just now');
      }
    };

    updateTimeAgo();
    const interval = window.setInterval(updateTimeAgo, 1000);

    return () => window.clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Polling indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className="flex items-center space-x-1">
          <Wifi
            className={`h-4 w-4 ${
              isPolling ? 'text-green-400' : 'text-gray-500'
            }`}
          />
          <span className={isPolling ? 'text-green-400' : 'text-gray-500'}>
            {isPolling ? 'Live' : 'Paused'}
          </span>
        </div>

        {lastUpdate && (
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{timeAgo}</span>
          </div>
        )}
      </div>

      {/* Manual refresh button */}
      {onRefresh && (
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      )}
    </div>
  );
}
