import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard, TestRuns, TestRunDetails, Analytics } from './pages';
import { ToastProvider } from './components/ui/Toast';
import { useConnectionNotifications } from './hooks';

// Component to handle connection notifications
function ConnectionNotificationHandler() {
  useConnectionNotifications();
  return null;
}

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <BrowserRouter>
          <ConnectionNotificationHandler />
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="runs" element={<TestRuns />} />
              <Route path="runs/:id" element={<TestRunDetails />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
