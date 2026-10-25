import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/ui/toast';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </ToastProvider>
  );
};

export default App;
