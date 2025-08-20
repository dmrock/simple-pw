import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard, TestRuns, TestRunDetails, Analytics } from './pages';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useConnectionNotifications } from './hooks';

// Component to handle connection notifications
function ConnectionNotificationHandler() {
  useConnectionNotifications();
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
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="runs" element={<TestRuns />} />
                  <Route path="runs/:id" element={<TestRunDetails />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
