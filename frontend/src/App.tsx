import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/ui/toast';
import { PortsProvider } from './providers/PortsProvider';
import { AuthProvider } from './providers/AuthProvider';
import { CookieConsentBanner } from './components/CookieConsentBanner';

const App: React.FC = () => {
  return (
    <PortsProvider>
      <AuthProvider>
        <ToastProvider>
          <MainLayout>
            <AppRoutes />
            <CookieConsentBanner />
          </MainLayout>
        </ToastProvider>
      </AuthProvider>
    </PortsProvider>
  );
};

export default App;
