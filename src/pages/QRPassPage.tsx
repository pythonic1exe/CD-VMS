import { useEffect, useState } from "react";
import { ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { QRCard } from "@/components/dashboard/QRCard";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fetchPublicPass, type PublicPassRecord } from "@/lib/cd-vms";

export function QRPassPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passRecord, setPassRecord] = useState<PublicPassRecord | null>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    async function loadPass() {
      if (!token) return;
      setLoading(true);

      try {
        const record = await fetchPublicPass(token);
        if (!record) {
          setPassRecord(null);
          toast({
            title: "Pass not found",
            description: "This pass may be expired, revoked, or not yet issued.",
            variant: "warning"
          });
          return;
        }

        setPassRecord(record);
      } catch (error) {
        toast({
          title: "Unable to load pass",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadPass();
  }, [toast, token]);

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <main className="container py-8 sm:py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/register">
            <ArrowLeft className="h-4 w-4" />
            Back to registration
          </Link>
        </Button>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Verified visitor credential
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-normal text-slate-950 sm:text-5xl">Your visitor pass is ready.</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Keep this pass available on your phone or print it before arrival. Security will scan the QR code and confirm your host details at reception.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-white p-5 shadow-line">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Security note</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    This pass is tied to the scheduled visit and may be revoked by the host or security team if the approval state changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {passRecord ? (
            <QRCard
              visitor={{
                departmentName: passRecord.departmentName,
                hostName: passRecord.hostName,
                passToken: passRecord.passToken,
                referenceCode: passRecord.referenceCode,
                scheduledFor: passRecord.scheduledFor,
                visitorName: passRecord.visitorName,
                visitorOrganization: passRecord.visitorOrganization
              }}
              showActions={!loading}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-muted-foreground">
              {token ? (loading ? "Loading pass..." : "No active pass is available for this token.") : "Use an issued pass link with a valid token to open the visitor credential."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
