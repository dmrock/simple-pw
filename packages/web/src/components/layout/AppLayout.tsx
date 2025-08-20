import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
