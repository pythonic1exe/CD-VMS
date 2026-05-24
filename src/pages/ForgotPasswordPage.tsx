import { FormEvent, useState } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import heroImage from "@/assets/office-lobby-hero.png";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { getAuthRedirectUrl, supabase } from "@/lib/supabase";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Enter your work email to request a password reset link.",
        variant: "warning"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl("/auth/callback?next=/reset-password")
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Unable to send reset link",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Reset link sent",
      description: "Supabase has queued the password recovery email for this staff account.",
      variant: "success"
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:justify-start">
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
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-primary">Password recovery</p>
                <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">Reset staff access</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Enter the staff email tied to your host or admin account and we&apos;ll send a reset link.
                </p>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
                  </div>
                </div>
                <Button type="submit" size="lg" loading={loading}>
                  {submitted ? "Send again" : "Send reset link"}
                </Button>
              </form>

              {submitted ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  A reset email has been requested for <span className="font-semibold">{email}</span>. Use the Supabase link in that message to continue.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>

      <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,15,34,0.35),rgba(5,15,34,0.8)),linear-gradient(180deg,rgba(5,15,34,0.14),rgba(5,15,34,0.72))]" />
        <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-14">
          <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white/82">
              <ShieldCheck className="h-4 w-4" />
              Secure recovery flow
            </div>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-normal text-white">Keep staff access simple, even when passwords need a reset.</h2>
            <p className="mt-4 text-base leading-7 text-white/74">This recovery screen now uses Supabase Auth while keeping the same CD-VMS login language.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
