import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { HomePage } from "@/pages/HomePage";
import { HostDashboardPage } from "@/pages/HostDashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { QRPassPage } from "@/pages/QRPassPage";
import { RegisterVisitorPage } from "@/pages/RegisterVisitorPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterVisitorPage />} />
      <Route path="/pass" element={<QRPassPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/host"
        element={
          <ProtectedRoute allowedRoles={["host", "admin"]}>
            <HostDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
