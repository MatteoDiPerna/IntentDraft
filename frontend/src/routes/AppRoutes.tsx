import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { GoogleOAuthPopupPage } from '@/pages/auth/GoogleOAuthPopupPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { LimitsPage } from '@/pages/LimitsPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import { AdminUsagePage } from '@/pages/admin/AdminUsagePage';
import { AdminPromptsPage } from '@/pages/admin/AdminPromptsPage';
import { AdminPlatformPage } from '@/pages/admin/AdminPlatformPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/google-popup" element={<GoogleOAuthPopupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        <Route
          path="/app/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="usage" element={<AdminUsagePage />} />
          <Route path="prompts" element={<AdminPromptsPage />} />
          <Route path="platform" element={<AdminPlatformPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
