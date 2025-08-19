import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto remove toast after duration
      if (newToast.duration && newToast.duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleRemove = () => {
    setShow(false);
    window.setTimeout(() => onRemove(toast.id), 150);
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-400',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-400',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
        };
    }
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm ${config.messageColor}`}>
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  type="button"
                  className={`text-sm font-medium ${config.titleColor} hover:underline`}
                  onClick={toast.action.onClick}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${config.messageColor} hover:${config.titleColor} focus:outline-none focus:${config.titleColor}`}
              onClick={handleRemove}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export { ToastItem };
