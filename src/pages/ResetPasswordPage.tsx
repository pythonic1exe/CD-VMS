import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters for the new password.",
        variant: "warning"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        variant: "warning"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: "Unable to update password",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setComplete(true);
    toast({
      title: "Password updated",
      description: "Your staff account is ready to use.",
      variant: "success"
    });
    window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <Card className="shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <Button variant="ghost" asChild className="mb-4 -ml-2">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </Button>
            <p className="text-sm font-bold uppercase tracking-normal text-primary">Password setup</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">Choose a new password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This screen is used for both password recovery and invited staff account activation.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label>New password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Confirm password</Label>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
              <Button type="submit" size="lg" loading={loading}>
                Save password
              </Button>
            </form>

            {complete ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Password saved. Redirecting back to the sign-in screen.</span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
