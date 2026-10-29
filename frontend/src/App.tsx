import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/ui/toast';
import { PortsProvider } from './providers/PortsProvider';
import { AuthProvider } from './providers/AuthProvider';

const App: React.FC = () => {
  return (
    <PortsProvider>
      <AuthProvider>
        <ToastProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </ToastProvider>
      </AuthProvider>
    </PortsProvider>
  );
};

export default App;
