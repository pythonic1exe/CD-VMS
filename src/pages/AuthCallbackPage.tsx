import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, profile, session } = useAuth();

  useEffect(() => {
    if (loading) return;

    const next = searchParams.get("next");

    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    if (next) {
      navigate(next, { replace: true });
      return;
    }

    if (profile?.permissionRole === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/host", { replace: true });
  }, [loading, navigate, profile?.permissionRole, searchParams, session]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="rounded-2xl border border-border bg-white px-6 py-5 text-center shadow-soft">
        <p className="text-sm font-semibold text-primary">Completing sign-in</p>
        <p className="mt-2 text-sm text-muted-foreground">We&apos;re finishing your secure redirect.</p>
      </div>
    </div>
  );
}
