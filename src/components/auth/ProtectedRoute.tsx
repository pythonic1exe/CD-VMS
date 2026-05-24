import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { type PermissionRole } from "@/lib/cd-vms";

export function ProtectedRoute({
  allowedRoles,
  children
}: {
  allowedRoles: PermissionRole[];
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { loading, profile, session } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="rounded-2xl border border-border bg-white px-6 py-5 text-center shadow-soft">
          <p className="text-sm font-semibold text-primary">Loading workspace</p>
          <p className="mt-2 text-sm text-muted-foreground">Checking your session and permissions.</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (!allowedRoles.includes(profile.permissionRole)) {
    return <Navigate to={profile.permissionRole === "admin" ? "/admin" : "/host"} replace />;
  }

  return <>{children}</>;
}
