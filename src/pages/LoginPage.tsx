import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import heroImage from "@/assets/office-lobby-hero.png";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, refreshProfile, session } = useAuth();
  const [role, setRole] = useState("host");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!session || !profile) return;

    const redirectTo = typeof location.state?.from === "string" ? location.state.from : profile.permissionRole === "admin" ? "/admin" : "/host";
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate, profile, session]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter an email and password to continue.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const nextProfile = await refreshProfile();
    setLoading(false);

    if (!nextProfile) {
      setError("Your account signed in, but no staff profile was found for dashboard access.");
      return;
    }

    toast({
      title: "Signed in",
      description: `Your ${role === "admin" ? "admin/security" : "host"} workspace is ready.`,
      variant: "success"
    });

    const redirectTo = typeof location.state?.from === "string" ? location.state.from : nextProfile.permissionRole === "admin" ? "/admin" : "/host";
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,15,34,0.92),rgba(5,15,34,0.62)),linear-gradient(180deg,rgba(5,15,34,0.14),rgba(5,15,34,0.76))]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <BrandLogo textClassName="text-white" markClassName="bg-white text-primary" />
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white/82">
              <ShieldCheck className="h-4 w-4" />
              Enterprise access portal
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-normal text-white">Secure visitor operations for every entrance.</h1>
            <p className="mt-5 text-lg leading-8 text-white/74">
              Hosts and security teams work from the same visitor context, approval state, and arrival history.
            </p>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-3 text-white">
            {["Host approvals", "Live logs", "Security review"].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-semibold text-white/88">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo />
          </div>
          <Card className="shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-primary">Staff login</p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose your workspace role and sign in to continue.</p>
              </div>

              <Tabs value={role} onValueChange={setRole} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="host">Host</TabsTrigger>
                  <TabsTrigger value="admin">Admin/Security</TabsTrigger>
                </TabsList>
              </Tabs>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" invalid={!!error && !email} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Password</Label>
                    <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-blue-700">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-9 pr-10"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      invalid={!!error && !password}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-ring"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox checked={remember} onCheckedChange={(value) => setRemember(Boolean(value))} />
                  Remember this device
                </label>
                {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div> : null}
                <Button type="submit" size="lg" loading={loading}>
                  {loading ? "Checking credentials" : "Sign in"}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>
                <p className="pt-2 text-sm text-muted-foreground">Seeded staff accounts are active in Supabase, and invite/reset flows now use the real auth backend.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
