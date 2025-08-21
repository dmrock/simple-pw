import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
  showReportButton?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // Report error to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Integrate with error reporting service (e.g., Sentry)
      console.error('Production error:', { error, errorInfo });
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleAutoRetry = () => {
    // Auto retry with exponential backoff for component-level errors
    if (this.props.level === 'component' && this.state.retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
      this.retryTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    // Create error report
    const report = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy to clipboard for now (in production, send to error reporting service)
    navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
      alert('Error report copied to clipboard');
    });
  };

  getErrorSeverity = () => {
    const { error } = this.state;
    if (!error) return 'low';

    // Determine severity based on error type and message
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk')
    ) {
      return 'medium'; // Code splitting errors
    }
    if (
      error.message.includes('Network Error') ||
      error.message.includes('fetch')
    ) {
      return 'medium'; // Network errors
    }
    return 'high'; // Other errors
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        level = 'page',
        showDetails = true,
        showReportButton = true,
      } = this.props;
      const { error, errorInfo, retryCount } = this.state;
      const severity = this.getErrorSeverity();

      // Component-level error boundary (smaller, inline error)
      if (level === 'component') {
        return (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 m-2">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-300">
                  Component Error
                </h4>
                <p className="text-xs text-red-400 mt-1">
                  This component failed to render properly.
                </p>
                {retryCount < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleRetry}
                    className="mt-2 text-red-300 hover:text-red-200"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Page-level or critical error boundary (full error page)
      const minHeight = level === 'critical' ? 'min-h-screen' : 'min-h-[400px]';

      return (
        <div
          className={`${minHeight} flex items-center justify-center p-8 bg-gray-900`}
        >
          <div className="text-center max-w-lg">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/20 border border-red-800 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {level === 'critical'
                ? 'Application Error'
                : 'Something went wrong'}
            </h3>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {severity === 'medium'
                ? 'A temporary error occurred. This is usually resolved by refreshing the page.'
                : 'An unexpected error occurred. Please try the actions below or contact support if the problem persists.'}
            </p>

            {showDetails && import.meta.env.DEV && error && (
              <details className="text-left mb-6 p-4 bg-gray-800 border border-gray-700 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Message:
                    </p>
                    <pre className="text-xs text-red-400 whitespace-pre-wrap mt-1">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Stack:
                      </p>
                      <pre className="text-xs text-gray-500 whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Component Stack:
                      </p>
                      <pre className="text-xs text-gray-500 whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>

              {level !== 'critical' && (
                <Button
                  variant="ghost"
                  icon={Home}
                  onClick={() => (window.location.href = '/')}
                >
                  Go Home
                </Button>
              )}
            </div>

            {showReportButton && import.meta.env.PROD && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Bug}
                  onClick={this.handleReportError}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Report Error
                </Button>
              </div>
            )}

            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mt-4">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
