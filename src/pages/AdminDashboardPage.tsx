import { FormEvent, useEffect, useState } from "react";
import { Building2, Download, LayoutDashboard, ListChecks, PieChart, Settings, UsersRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminDashboardContent, type AdminView, type StaffMember, getAdminViewMeta } from "@/components/dashboard/AdminDashboardContent";
import { VisitorDetailDrawer } from "@/components/dashboard/VisitorDetailDrawer";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  checkInVisit,
  checkOutVisit,
  decideVisit,
  exportOperations,
  fetchAdminReferenceData,
  fetchAdminReportSummary,
  fetchAdminVisitorLogs,
  fetchDepartmentCoverage,
  fetchRecentVisitActivity,
  fetchStaffDirectory,
  fetchVisitDetail,
  inviteStaffMember,
  saveSiteSettings,
  type AdminLogStatus,
  type AdminReportSummary,
  type DashboardVisit,
  type DepartmentCoverageSummary,
  type PermissionRole,
  type RecentActivityItem,
  type SiteSettings,
  type VisitDetail
} from "@/lib/cd-vms";

const PAGE_SIZE = 10;
const adminViews: AdminView[] = ["overview", "logs", "staff", "departments", "reports", "settings"];

type NewStaffForm = {
  departmentId: string;
  email: string;
  name: string;
  permissionRole: PermissionRole;
};

function resolveAdminView(value: string | null): AdminView {
  return adminViews.includes((value ?? "overview") as AdminView) ? ((value ?? "overview") as AdminView) : "overview";
}

const emptyReportSummary: AdminReportSummary = {
  approvalRate: 0,
  approvedOrActiveCount: 0,
  checkedInOrOutCount: 0,
  elevatedRiskCount: 0,
  entranceDistribution: [],
  exceptionRate: 0,
  pendingCount: 0,
  rejectedCount: 0,
  totalVisits: 0
};

type VisitorActionType = "approve" | "reject" | "check_in" | "check_out";

export function AdminDashboardPage() {
  const [searchParams] = useSearchParams();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingKind, setExportingKind] = useState<"visitor_logs" | "report_summary" | null>(null);
  const [invitingStaff, setInvitingStaff] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [visitorAction, setVisitorAction] = useState<{ type: VisitorActionType; visitId: string } | null>(null);
  const [visitLogs, setVisitLogs] = useState<DashboardVisit[]>([]);
  const [visitLogTotal, setVisitLogTotal] = useState(0);
  const [overviewPreviewVisits, setOverviewPreviewVisits] = useState<DashboardVisit[]>([]);
  const [overviewActivity, setOverviewActivity] = useState<RecentActivityItem[]>([]);
  const [reportsActivity, setReportsActivity] = useState<RecentActivityItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [departmentCoverage, setDepartmentCoverage] = useState<DepartmentCoverageSummary[]>([]);
  const [departments, setDepartments] = useState<Array<{ floor_label?: string | null; id: string; name: string }>>([]);
  const [entrances, setEntrances] = useState<Array<{ id: string; name: string }>>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [reportSummary, setReportSummary] = useState<AdminReportSummary>(emptyReportSummary);
  const [logPage, setLogPage] = useState(1);
  const [logQuery, setLogQuery] = useState("");
  const [logStatus, setLogStatus] = useState<AdminLogStatus>("all");
  const [staffForm, setStaffForm] = useState<NewStaffForm>({
    departmentId: "",
    email: "",
    name: "",
    permissionRole: "host"
  });
  const { profile } = useAuth();
  const { toast } = useToast();

  const view = resolveAdminView(searchParams.get("view"));
  const meta = getAdminViewMeta(view);

  useEffect(() => {
    setLogPage(1);
    setLogQuery("");
    setLogStatus("all");
  }, [view]);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);

      try {
        const [referenceData, nextStaff, nextDepartmentCoverage] = await Promise.all([
          fetchAdminReferenceData(),
          fetchStaffDirectory(),
          fetchDepartmentCoverage()
        ]);

        setDepartments(referenceData.departments);
        setEntrances(referenceData.entrances);
        setSettings(referenceData.settings);
        setStaffMembers(nextStaff);
        setDepartmentCoverage(nextDepartmentCoverage);
        setStaffForm((current) => ({
          ...current,
          departmentId: current.departmentId || referenceData.departments[0]?.id || ""
        }));

        if (view === "overview") {
          const [summary, previewLogs, activity] = await Promise.all([
            fetchAdminReportSummary(),
            fetchAdminVisitorLogs({ limit: 4, offset: 0 }),
            fetchRecentVisitActivity(6)
          ]);
          setReportSummary(summary);
          setOverviewPreviewVisits(previewLogs.items);
          setOverviewActivity(activity);
          setVisitLogs([]);
          setVisitLogTotal(0);
          setReportsActivity([]);
          return;
        }

        if (view === "logs") {
          const logsPage = await fetchAdminVisitorLogs({
            limit: PAGE_SIZE,
            offset: (logPage - 1) * PAGE_SIZE,
            query: logQuery,
            status: logStatus
          });
          setVisitLogs(logsPage.items);
          setVisitLogTotal(logsPage.totalCount);
          return;
        }

        if (view === "reports") {
          const [summary, activity] = await Promise.all([fetchAdminReportSummary(), fetchRecentVisitActivity(8)]);
          setReportSummary(summary);
          setReportsActivity(activity);
          return;
        }
      } catch (error) {
        toast({
          title: "Unable to load admin workspace",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadAdminData();
  }, [logPage, logQuery, logStatus, toast, view]);

  if (!profile) {
    return null;
  }

  const sidebarItems = [
    { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Visitor Logs", href: "/admin?view=logs", icon: <ListChecks className="h-4 w-4" /> },
    { label: "Staff Management", href: "/admin?view=staff", icon: <UsersRound className="h-4 w-4" /> },
    { label: "Departments", href: "/admin?view=departments", icon: <Building2 className="h-4 w-4" /> },
    { label: "Reports", href: "/admin?view=reports", icon: <PieChart className="h-4 w-4" /> },
    { label: "Settings", href: "/admin?view=settings", icon: <Settings className="h-4 w-4" /> }
  ];

  async function refreshVisibleData() {
    const [referenceData, nextStaff, nextDepartmentCoverage] = await Promise.all([
      fetchAdminReferenceData(),
      fetchStaffDirectory(),
      fetchDepartmentCoverage()
    ]);

    setDepartments(referenceData.departments);
    setEntrances(referenceData.entrances);
    setSettings(referenceData.settings);
    setStaffMembers(nextStaff);
    setDepartmentCoverage(nextDepartmentCoverage);

    if (view === "overview") {
      const [summary, previewLogs, activity] = await Promise.all([
        fetchAdminReportSummary(),
        fetchAdminVisitorLogs({ limit: 4, offset: 0 }),
        fetchRecentVisitActivity(6)
      ]);
      setReportSummary(summary);
      setOverviewPreviewVisits(previewLogs.items);
      setOverviewActivity(activity);
      return;
    }

    if (view === "logs") {
      const logsPage = await fetchAdminVisitorLogs({
        limit: PAGE_SIZE,
        offset: (logPage - 1) * PAGE_SIZE,
        query: logQuery,
        status: logStatus
      });
      setVisitLogs(logsPage.items);
      setVisitLogTotal(logsPage.totalCount);
      return;
    }

    if (view === "reports") {
      const [summary, activity] = await Promise.all([fetchAdminReportSummary(), fetchRecentVisitActivity(8)]);
      setReportSummary(summary);
      setReportsActivity(activity);
    }
  }

  async function loadVisitorDetail(visitId: string) {
    setDrawerLoading(true);
    setDrawerOpen(true);

    try {
      const detail = await fetchVisitDetail(visitId);
      setSelectedVisitor(detail);
    } catch (error) {
      toast({
        title: "Unable to load visit details",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  }

  function openVisitor(visitor: DashboardVisit) {
    setSelectedVisitor(null);
    void loadVisitorDetail(visitor.id);
  }

  async function refreshSelectedVisitor(visitId: string) {
    const detail = await fetchVisitDetail(visitId);
    setSelectedVisitor(detail);
  }

  async function downloadExport(kind: "visitor_logs" | "report_summary") {
    setExportingKind(kind);

    try {
      const file = await exportOperations({
        kind,
        query: kind === "visitor_logs" ? logQuery : undefined,
        status: kind === "visitor_logs" ? logStatus : undefined
      });

      const blob = new Blob([file.content], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export downloaded",
        description: `${file.filename} is ready.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to export data",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setExportingKind(null);
    }
  }

  async function handleAddStaff(event: FormEvent) {
    event.preventDefault();

    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      toast({
        title: "Name and email required",
        description: "Add the staff member name and work email before sending an invite.",
        variant: "warning"
      });
      return;
    }

    setInvitingStaff(true);

    try {
      await inviteStaffMember({
        departmentId: staffForm.departmentId || undefined,
        email: staffForm.email.trim(),
        fullName: staffForm.name.trim(),
        permissionRole: staffForm.permissionRole
      });
      await refreshVisibleData();
      setAddStaffOpen(false);
      setStaffForm({
        departmentId: departments[0]?.id || "",
        email: "",
        name: "",
        permissionRole: "host"
      });
      toast({
        title: "Invite sent",
        description: `${staffForm.name.trim()} has been invited through Supabase Auth.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to invite staff",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setInvitingStaff(false);
    }
  }

  async function handleDecision(visitor: DashboardVisit, approved: boolean) {
    setVisitorAction({ type: approved ? "approve" : "reject", visitId: visitor.id });

    try {
      await decideVisit(visitor.id, approved, approved ? undefined : "Rejected from admin dashboard");
      await refreshVisibleData();
      if (drawerOpen) {
        await refreshSelectedVisitor(visitor.id);
      }
      toast({
        title: approved ? "Visit approved" : "Visit rejected",
        description: `${visitor.visitorName} has been ${approved ? "cleared" : "rejected"} by admin review.`,
        variant: approved ? "success" : "warning"
      });
    } catch (error) {
      toast({
        title: "Unable to update visit",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setVisitorAction(null);
    }
  }

  async function handleCheckIn(visitor: DashboardVisit) {
    setVisitorAction({ type: "check_in", visitId: visitor.id });

    try {
      await checkInVisit(visitor.id);
      await refreshVisibleData();
      if (drawerOpen) {
        await refreshSelectedVisitor(visitor.id);
      }
      toast({
        title: "Visitor checked in",
        description: `${visitor.visitorName} is now marked on-site.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to check in visitor",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setVisitorAction(null);
    }
  }

  async function handleCheckOut(visitor: DashboardVisit) {
    setVisitorAction({ type: "check_out", visitId: visitor.id });

    try {
      await checkOutVisit(visitor.id);
      await refreshVisibleData();
      if (drawerOpen) {
        await refreshSelectedVisitor(visitor.id);
      }
      toast({
        title: "Visitor checked out",
        description: `${visitor.visitorName} has been marked as departed.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to check out visitor",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setVisitorAction(null);
    }
  }

  async function handleSaveSettings(nextSettings: SiteSettings) {
    setSavingSettings(true);

    try {
      await saveSiteSettings(nextSettings);
      await refreshVisibleData();
      toast({
        title: "Settings saved",
        description: "Visitor operations preferences have been updated in Supabase.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to save settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  }

  const shellAction =
    view === "settings" || view === "staff" || view === "departments" ? null : (
      <Button
        variant="outline"
        onClick={() => void downloadExport(view === "reports" ? "report_summary" : "visitor_logs")}
        className="hidden sm:inline-flex"
        loading={exportingKind === (view === "reports" ? "report_summary" : "visitor_logs")}
      >
        {!exportingKind ? <Download className="h-4 w-4" /> : null}
        {exportingKind ? "Exporting..." : "Export"}
      </Button>
    );

  return (
    <>
      <DashboardShell title={meta.title} subtitle={meta.subtitle} roleLabel="Admin/Security workspace" profileName={profile.fullName} sidebarItems={sidebarItems} actions={shellAction}>
        <AdminDashboardContent
          departmentCoverage={departmentCoverage}
          entrances={entrances}
          exportLoadingKind={exportingKind}
          loading={loading}
          logPage={logPage}
          logPageSize={PAGE_SIZE}
          logQuery={logQuery}
          logStatus={logStatus}
          onExport={(kind) => void downloadExport(kind)}
          onLogPageChange={setLogPage}
          onLogQueryChange={setLogQuery}
          onLogStatusChange={setLogStatus}
          onOpenAddStaff={() => setAddStaffOpen(true)}
          onOpenVisitor={openVisitor}
          onSaveSettings={handleSaveSettings}
          overviewActivity={overviewActivity}
          overviewPreviewVisits={overviewPreviewVisits}
          reportSummary={reportSummary}
          reportsActivity={reportsActivity}
          savingSettings={savingSettings}
          settings={settings}
          staffMembers={staffMembers}
          activeVisitorAction={visitorAction?.type ?? null}
          activeVisitorId={visitorAction?.visitId ?? null}
          view={view}
          visitLogTotal={visitLogTotal}
          visitLogs={visitLogs}
        />

        <VisitorDetailDrawer
          visitor={selectedVisitor}
          loading={drawerLoading}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onApprove={(visitor) => void handleDecision(visitor, true)}
          onReject={(visitor) => void handleDecision(visitor, false)}
          onCheckIn={(visitor) => void handleCheckIn(visitor)}
          onCheckOut={(visitor) => void handleCheckOut(visitor)}
          activeVisitorAction={visitorAction?.type ?? null}
          activeVisitorId={visitorAction?.visitId ?? null}
        />
      </DashboardShell>

      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add staff member</DialogTitle>
            <DialogDescription>Send a Supabase Auth invite and initialize the staff profile with a small, realistic form.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleAddStaff}>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={staffForm.name} onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nadia Rahman" />
            </div>
            <div className="grid gap-2">
              <Label>Work email</Label>
              <Input value={staffForm.email} onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))} placeholder="nadia.rahman@company.com" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={staffForm.permissionRole} onValueChange={(value) => setStaffForm((current) => ({ ...current, permissionRole: value as PermissionRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="admin">Admin / Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={staffForm.departmentId} onValueChange={(value) => setStaffForm((current) => ({ ...current, departmentId: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddStaffOpen(false)} disabled={invitingStaff}>
                Cancel
              </Button>
              <Button type="submit" loading={invitingStaff}>
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
