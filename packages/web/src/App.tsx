import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard, TestRuns, TestRunDetails, Analytics } from './pages';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useConnectionNotifications } from './hooks';
import {
  PerformanceMonitorComponent,
  BundleSizeWarning,
  usePerformanceWarnings,
} from './components/dev/PerformanceMonitor';
import { env } from './config/env';

// Component to handle connection notifications and performance monitoring
function ConnectionNotificationHandler() {
  useConnectionNotifications();
  usePerformanceWarnings();
  return null;
}

function App() {
  return (
    <ErrorBoundary
      level="critical"
      onError={(error, errorInfo) => {
        // Log critical errors to monitoring service
        console.error('Critical app error:', { error, errorInfo });
      }}
    >
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter>
            <ConnectionNotificationHandler />
            <ErrorBoundary level="page">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <LoadingSpinner size="lg" color="white" />
                      <p className="mt-4 text-gray-400">Loading page...</p>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="runs" element={<TestRuns />} />
                    <Route path="runs/:id" element={<TestRunDetails />} />
                    <Route path="analytics" element={<Analytics />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>

      {/* Development-only performance monitoring */}
      {env.DEV_MODE && (
        <>
          <PerformanceMonitorComponent />
          <BundleSizeWarning />
        </>
      )}
    </ErrorBoundary>
  );
}

export default App;
