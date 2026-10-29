import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { LimitsPage } from '@/pages/LimitsPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/limits" element={<LimitsPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ChatPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
