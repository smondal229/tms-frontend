import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './routes/ProtectedRoute';

import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';

import ShipmentDetail from './components/ShipmentDetail';
import ShipmentsPage from './pages/shipments/ShipmentsPage';

import ErrorBoundary from './pages/shared/ErrorBoundary';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SignupPage from './pages/SignupPage';
import UserManagementPage from './pages/users/UserManagementPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import GuestRoute from './routes/GuestRoute';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* PUBLIC ROUTES (accessible always) */}
            <Route element={<PublicLayout />}>
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* GUEST ONLY ROUTES (only if NOT logged in) */}
            <Route element={<GuestRoute />}>
              <Route element={<PublicLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
            </Route>

            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/shipments" element={<ShipmentsPage />} />
                <Route path="/shipments/:shipmentId" element={<ShipmentDetail />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/" element={<Navigate to="/shipments" replace />} />
              </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
