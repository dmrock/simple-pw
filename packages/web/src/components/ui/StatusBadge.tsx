import React from 'react';
import { CheckCircle, XCircle, Clock, Minus } from 'lucide-react';

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut';

export interface StatusBadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const statusConfig = {
    passed: {
      label: 'Passed',
      icon: CheckCircle,
      classes: 'bg-green-100 text-green-800 border-green-200',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      classes: 'bg-red-100 text-red-800 border-red-200',
    },
    skipped: {
      label: 'Skipped',
      icon: Minus,
      classes: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    timedOut: {
      label: 'Timed Out',
      icon: Clock,
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const classes = [
    'inline-flex items-center font-medium rounded-full border',
    config.classes,
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {showIcon && <Icon className={`${iconSizeClasses[size]} mr-1.5`} />}
      {config.label}
    </span>
  );
};

export { StatusBadge };
