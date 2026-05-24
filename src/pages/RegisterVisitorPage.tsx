import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, Info, ShieldCheck } from "lucide-react";

import { QRCard, type PassCardData } from "@/components/dashboard/QRCard";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { fetchRegistrationOptions, submitVisitRequest, type DepartmentOption, type HostDirectoryEntry } from "@/lib/cd-vms";

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  purpose: string;
  host: string;
  department: string;
  date: string;
  time: string;
  notes: string;
  privacy: boolean;
};

const initialForm: RegisterForm = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  purpose: "",
  host: "",
  department: "",
  date: new Date().toISOString().slice(0, 10),
  time: "10:30",
  notes: "",
  privacy: false
};

type Errors = Partial<Record<keyof RegisterForm, string>>;

export function RegisterVisitorPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [successOpen, setSuccessOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [hosts, setHosts] = useState<HostDirectoryEntry[]>([]);
  const [submissionReference, setSubmissionReference] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetchRegistrationOptions();
        setDepartments(response.departments);
        setHosts(response.hosts);
      } catch (error) {
        toast({
          title: "Unable to load registration options",
          description: error instanceof Error ? error.message : "Please refresh and try again.",
          variant: "destructive"
        });
      } finally {
        setOptionsLoading(false);
      }
    }

    void loadOptions();
  }, [toast]);

  const selectedHost = hosts.find((host) => host.id === form.host) ?? null;
  const selectedDepartment = departments.find((department) => department.id === form.department) ?? null;

  const previewPass = useMemo<PassCardData>(
    () => ({
      visitorName: form.name || "Elena Park",
      visitorOrganization: form.organization || "Meridian University",
      hostName: selectedHost?.fullName || "Priya Shah",
      departmentName: selectedDepartment?.name || selectedHost?.departmentName || "Admissions",
      scheduledFor: `${form.date || initialForm.date}T${form.time || initialForm.time}:00`
    }),
    [form.date, form.name, form.organization, form.time, selectedDepartment?.name, selectedHost?.departmentName, selectedHost?.fullName]
  );

  function update<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Use a valid work or personal email.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a reachable phone number.";
    if (!form.organization.trim()) next.organization = "Organization is required.";
    if (!form.purpose.trim()) next.purpose = "Purpose of visit is required.";
    if (!form.host) next.host = "Select the employee you are visiting.";
    if (!form.department) next.department = "Choose the destination department.";
    if (!form.date) next.date = "Visit date is required.";
    if (!form.time) next.time = "Visit time is required.";
    if (!form.privacy) next.privacy = "Consent is required before submitting a visit request.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) {
      toast({
        title: "Registration needs a quick review",
        description: "A few required fields need attention before the request can be submitted.",
        variant: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const submission = await submitVisitRequest({
        departmentId: form.department,
        email: form.email,
        fullName: form.name,
        hostStaffId: form.host,
        notes: form.notes,
        organization: form.organization,
        phone: form.phone,
        purpose: form.purpose,
        scheduledFor: `${form.date}T${form.time}:00`
      });

      setSubmissionReference(submission?.referenceCode ?? null);
      setSuccessOpen(true);
      toast({
        title: "Visit request submitted",
        description: "The host and front desk can now review this scheduled visit.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to submit visit",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <main className="container py-8 sm:py-12">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Visitor registration</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-5xl">A faster way to arrive.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Share the visit details once, request approval, and let your host know you are on the way.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Visit details</CardTitle>
              <CardDescription>Required fields help security verify the visit without slowing down reception.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full Name" error={errors.name}>
                    <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Sofia Almeida" invalid={!!errors.name} />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="sofia@company.com" invalid={!!errors.email} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <Input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+1 (555) 012-3456" invalid={!!errors.phone} />
                  </Field>
                  <Field label="Organization" error={errors.organization}>
                    <Input value={form.organization} onChange={(event) => update("organization", event.target.value)} placeholder="Clearpath Design" invalid={!!errors.organization} />
                  </Field>
                  <Field label="Purpose of Visit" error={errors.purpose}>
                    <Input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder="UX research interview" invalid={!!errors.purpose} />
                  </Field>
                  <Field label="Host Selection" error={errors.host}>
                    <Select
                      value={form.host}
                      onValueChange={(value) => {
                        const nextHost = hosts.find((host) => host.id === value);
                        update("host", value);
                        if (nextHost) update("department", nextHost.departmentId);
                      }}
                    >
                      <SelectTrigger invalid={!!errors.host} disabled={optionsLoading}>
                        <SelectValue placeholder="Select host" />
                      </SelectTrigger>
                      <SelectContent>
                        {hosts.map((host) => (
                          <SelectItem key={host.id} value={host.id}>
                            {host.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Department" error={errors.department}>
                    <Select value={form.department} onValueChange={(value) => update("department", value)}>
                      <SelectTrigger invalid={!!errors.department} disabled={optionsLoading}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Visit Date" error={errors.date}>
                    <Input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} invalid={!!errors.date} />
                  </Field>
                  <Field label="Visit Time" error={errors.time}>
                    <Input type="time" value={form.time} onChange={(event) => update("time", event.target.value)} invalid={!!errors.time} />
                  </Field>
                </div>
                <Field label="Notes">
                  <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Accessibility needs, delivery details, parking notes, or other context." />
                </Field>
                <div className="rounded-xl border border-border bg-slate-50 p-4">
                  <label className="flex gap-3 text-sm leading-6">
                    <Checkbox checked={form.privacy} onCheckedChange={(value) => update("privacy", Boolean(value))} className="mt-1" />
                    <span>
                      I agree that CD-VMS may store visit details for reception, host approval, security, and audit purposes.
                      {errors.privacy ? <span className="block font-semibold text-red-600">{errors.privacy}</span> : null}
                    </span>
                  </label>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Host selection and visit submission are connected to Supabase.</span>
                  </div>
                  <Button type="submit" size="lg" loading={loading}>
                    {loading ? "Submitting request" : "Submit Visit Request"}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-white p-5 shadow-line">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Pre-screened arrival</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Host approval and QR pass creation happen before the visitor reaches the front desk.</p>
                </div>
              </div>
            </div>
            <QRCard visitor={previewPass} compact showActions={false} isPreview />
          </div>
        </div>
      </main>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle>Visit request submitted</DialogTitle>
            <DialogDescription>The visitor and host details are now pending host review and front desk visibility.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-border bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <CalendarClock className="h-4 w-4 text-primary" />
                Visit summary
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryItem label="Visitor" value={previewPass.visitorName} />
                <SummaryItem label="Reference" value={submissionReference ?? "Pending"} />
                <SummaryItem label="Organization" value={previewPass.visitorOrganization} />
                <SummaryItem label="Host" value={previewPass.hostName} />
                <SummaryItem label="Department" value={previewPass.departmentName} />
                <SummaryItem label="Date/Time" value={`${form.date} · ${form.time}`} />
                <SummaryItem label="Status" value="Pending approval" />
              </dl>
            </div>
            <QRCard visitor={previewPass} compact showActions={false} isPreview />
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
