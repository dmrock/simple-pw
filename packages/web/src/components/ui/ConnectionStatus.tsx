import { WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ConnectionStatusProps {
  isOnline: boolean;
  isConnected: boolean;
  lastConnected: Date | null;
  retryCount: number;
  onRetry?: () => void;
  className?: string;
}

export function ConnectionStatus({
  isOnline,
  isConnected,
  lastConnected,
  retryCount,
  onRetry,
  className = '',
}: ConnectionStatusProps) {
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        borderColor: 'border-red-500/50',
        message: 'No internet connection',
        showRetry: false,
      };
    }

    if (!isConnected) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        borderColor: 'border-yellow-500/50',
        message:
          retryCount > 0
            ? `Connection failed (${retryCount} attempts)`
            : 'Connection lost',
        showRetry: true,
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/50',
      message: 'Connected',
      showRetry: false,
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  // Don't show if everything is working fine
  if (isOnline && isConnected && retryCount === 0) {
    return null;
  }

  const formatLastConnected = () => {
    if (!lastConnected) return 'Never';

    const now = new Date();
    const diff = now.getTime() - lastConnected.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border
        ${status.bgColor} ${status.borderColor} ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${status.color}`} />
        <div>
          <p className={`text-sm font-medium ${status.color}`}>
            {status.message}
          </p>
          {lastConnected && !isConnected && (
            <p className="text-xs text-gray-400">
              Last connected: {formatLastConnected()}
            </p>
          )}
        </div>
      </div>

      {status.showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className={`border-current ${status.color} hover:bg-current hover:bg-opacity-10`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
