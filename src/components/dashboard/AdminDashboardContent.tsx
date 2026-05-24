import { useEffect, useState } from "react";
import { Building2, Download, LayoutDashboard, ListChecks, PieChart, Search, Settings, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  AdminLogStatus,
  AdminReportSummary,
  DashboardVisit,
  DepartmentCoverageSummary,
  RecentActivityItem,
  SiteSettings,
  StaffDirectoryItem
} from "@/lib/cd-vms";
import { formatTimeLabel } from "@/lib/utils";

export type AdminView = "overview" | "logs" | "staff" | "departments" | "reports" | "settings";
export type StaffMember = StaffDirectoryItem;

type AdminDashboardContentProps = {
  departmentCoverage: DepartmentCoverageSummary[];
  entrances: Array<{ id: string; name: string }>;
  loading: boolean;
  logPage: number;
  logPageSize: number;
  logQuery: string;
  logStatus: AdminLogStatus;
  onExport: (kind: "visitor_logs" | "report_summary") => void;
  onLogPageChange: (page: number) => void;
  onLogQueryChange: (value: string) => void;
  onLogStatusChange: (value: AdminLogStatus) => void;
  onOpenAddStaff: () => void;
  onOpenVisitor: (visitor: DashboardVisit) => void;
  onSaveSettings: (settings: SiteSettings) => void | Promise<void>;
  overviewActivity: RecentActivityItem[];
  overviewPreviewVisits: DashboardVisit[];
  reportSummary: AdminReportSummary;
  reportsActivity: RecentActivityItem[];
  settings: SiteSettings | null;
  staffMembers: StaffMember[];
  view: AdminView;
  visitLogTotal: number;
  visitLogs: DashboardVisit[];
};

const viewMeta: Record<AdminView, { title: string; subtitle: string }> = {
  overview: {
    title: "Admin Dashboard",
    subtitle: "Monitor visitor flow, staff activity, approvals, and compliance-ready logs from one operations surface."
  },
  logs: {
    title: "Visitor Logs",
    subtitle: "Search the visit record, inspect visitor details, and prepare simple exports for operations review."
  },
  staff: {
    title: "Staff Management",
    subtitle: "See which hosts and security staff are connected to visitor workflows and keep the roster current."
  },
  departments: {
    title: "Departments",
    subtitle: "Review destination teams, their active host coverage, and where visitors are being routed."
  },
  reports: {
    title: "Reports",
    subtitle: "Use lightweight reporting cards to summarize visitor volume, approvals, traffic, and operational trends."
  },
  settings: {
    title: "Settings",
    subtitle: "Adjust visitor operations preferences without expanding the product scope."
  }
};

const statusOptions: Array<{ label: string; value: AdminLogStatus }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Checked In", value: "checked_in" },
  { label: "Checked Out", value: "checked_out" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" }
];

export function getAdminViewMeta(view: AdminView) {
  return viewMeta[view];
}

export function AdminDashboardContent(props: AdminDashboardContentProps) {
  switch (props.view) {
    case "logs":
      return <VisitorLogsView {...props} />;
    case "staff":
      return <StaffManagementView {...props} />;
    case "departments":
      return <DepartmentsView {...props} />;
    case "reports":
      return <ReportsView {...props} />;
    case "settings":
      return <SettingsView {...props} />;
    case "overview":
    default:
      return <OverviewView {...props} />;
  }
}

function OverviewView({ loading, onExport, onOpenAddStaff, onOpenVisitor, overviewActivity, overviewPreviewVisits, reportSummary, staffMembers }: AdminDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors tracked" value={String(reportSummary.totalVisits)} change="live data" icon={<UsersRound className="h-5 w-5" />} tone="blue" />
        <StatCard label="Pending approvals" value={String(reportSummary.pendingCount)} change="needs action" icon={<ListChecks className="h-5 w-5" />} tone="amber" />
        <StatCard label="Approved / active" value={String(reportSummary.approvedOrActiveCount)} change="workflow" icon={<ShieldCheck className="h-5 w-5" />} tone="green" />
        <StatCard label="Rejected visits" value={String(reportSummary.rejectedCount)} change="review" icon={<SlidersHorizontal className="h-5 w-5" />} tone="red" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Visitor logs preview</CardTitle>
                <CardDescription>Search, filter, inspect, and export the visit record.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onExport("visitor_logs")}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {overviewPreviewVisits.length ? (
              <>
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor Name</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overviewPreviewVisits.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                              <p className="text-sm text-muted-foreground">{visitor.organization}</p>
                            </div>
                          </TableCell>
                          <TableCell>{visitor.hostName}</TableCell>
                          <TableCell>{visitor.departmentName}</TableCell>
                          <TableCell>{visitor.checkIn ? formatTimeLabel(visitor.checkIn) : "—"}</TableCell>
                          <TableCell>
                            <StatusBadge status={visitor.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => onOpenVisitor(visitor)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 lg:hidden">
                  {overviewPreviewVisits.map((visitor) => (
                    <button key={visitor.id} className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-ring" onClick={() => onOpenVisitor(visitor)}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{visitor.organization}</p>
                        </div>
                        <StatusBadge status={visitor.status} />
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p>
                          <span className="text-muted-foreground">Host:</span> {visitor.hostName}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Department:</span> {visitor.departmentName}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Check-in:</span> {visitor.checkIn ? formatTimeLabel(visitor.checkIn) : "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Visit:</span> {formatTimeLabel(visitor.scheduledFor)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon={<ListChecks className="h-5 w-5" />} title="No visitor records yet" description="New visits will appear here as soon as registration activity starts." />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Activity monitoring</CardTitle>
              <CardDescription>Live security and visitor system events.</CardDescription>
            </CardHeader>
            <CardContent>{overviewActivity.length ? <ActivityFeed items={overviewActivity} /> : <p className="text-sm text-muted-foreground">Recent visit events will appear here.</p>}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Traffic by entrance</CardTitle>
              <CardDescription>Current lobby distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportSummary.entranceDistribution.length ? (
                reportSummary.entranceDistribution.map((entry) => <EntranceProgress key={entry.label} label={entry.label} value={entry.value} />)
              ) : (
                <p className="text-sm text-muted-foreground">Entrance activity will appear once visits are recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Staff management</CardTitle>
              <CardDescription>Hosts and security roles connected to visitor workflows.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenAddStaff}>
              Add staff
            </Button>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.slice(0, 5).map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-semibold text-slate-950">{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.visitors}</TableCell>
                      <TableCell>
                        <StatusPill status={staff.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {staffMembers.slice(0, 5).map((staff) => (
                <div key={staff.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{staff.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                    <StatusPill status={staff.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-700">
                    {staff.department} · {staff.visitors} visits
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <EmptyState icon={<PieChart className="h-5 w-5" />} title="Reports are ready to review" description="Open the reports view to review compact operational summaries from live backend data." />
      </div>
    </div>
  );
}

function VisitorLogsView({ loading, logPage, logPageSize, logQuery, logStatus, onExport, onLogPageChange, onLogQueryChange, onLogStatusChange, onOpenVisitor, visitLogTotal, visitLogs }: AdminDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Visitor logs</CardTitle>
              <CardDescription>Filter the record, inspect visit details, and export the current backend result set.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onExport("visitor_logs")}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchField value={logQuery} onChange={onLogQueryChange} placeholder="Search visitor, host, company, purpose..." />
            <Select value={logStatus} onValueChange={(value) => onLogStatusChange(value as AdminLogStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {visitLogs.length ? (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor Name</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitLogs.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                            <p className="text-sm text-muted-foreground">{visitor.organization}</p>
                          </div>
                        </TableCell>
                        <TableCell>{visitor.hostName}</TableCell>
                        <TableCell>{visitor.departmentName}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{visitor.purpose}</TableCell>
                        <TableCell>{visitor.checkIn ? formatTimeLabel(visitor.checkIn) : "—"}</TableCell>
                        <TableCell>{visitor.checkOut ? formatTimeLabel(visitor.checkOut) : "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={visitor.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => onOpenVisitor(visitor)}>
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 lg:hidden">
                {visitLogs.map((visitor) => (
                  <button key={visitor.id} className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-ring" onClick={() => onOpenVisitor(visitor)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{visitor.organization}</p>
                      </div>
                      <StatusBadge status={visitor.status} />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Host:</span> {visitor.hostName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Department:</span> {visitor.departmentName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Check-in:</span> {visitor.checkIn ? formatTimeLabel(visitor.checkIn) : "—"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Check-out:</span> {visitor.checkOut ? formatTimeLabel(visitor.checkOut) : "—"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <PaginationFooter currentPage={logPage} onPageChange={onLogPageChange} pageSize={logPageSize} totalCount={visitLogTotal} />
            </>
          ) : (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="No matching visitor records"
              description="Adjust the query or filter to see more results from the current visit log."
              action="Reset filters"
              onAction={() => {
                onLogQueryChange("");
                onLogStatusChange("all");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StaffManagementView({ loading, onOpenAddStaff, staffMembers }: AdminDashboardContentProps) {
  const hostCount = staffMembers.filter((staff) => staff.permissionRole === "host").length;
  const adminCount = staffMembers.filter((staff) => staff.permissionRole === "admin").length;
  const limitedCount = staffMembers.filter((staff) => staff.status !== "Active").length;

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total staff" value={String(staffMembers.length)} change="directory" icon={<UsersRound className="h-5 w-5" />} tone="blue" />
        <StatCard label="Hosts" value={String(hostCount)} change="active" icon={<LayoutDashboard className="h-5 w-5" />} tone="green" />
        <StatCard label="Admin / security" value={String(adminCount)} change="review" icon={<ShieldCheck className="h-5 w-5" />} tone="amber" />
        <StatCard label="Limited access" value={String(limitedCount)} change="needs follow-up" icon={<Settings className="h-5 w-5" />} tone="red" />
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Staff directory</CardTitle>
            <CardDescription>Hosts and security team members connected to visitor decisions and check-ins.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenAddStaff}>
            Add staff
          </Button>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Visitors</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-semibold text-slate-950">{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.visitors}</TableCell>
                    <TableCell>
                      <StatusPill status={staff.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{staff.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                  <StatusPill status={staff.status} />
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {staff.department} · {staff.visitors} visits
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DepartmentsView({ departmentCoverage, loading }: AdminDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {departmentCoverage.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{department.name}</CardTitle>
                  <CardDescription>{department.floorLabel || "Visitor destination"}</CardDescription>
                </div>
                <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{department.activeHosts} active hosts</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">Coverage summary</p>
                <p className="mt-1 leading-6 text-muted-foreground">Front desk routes visitor approvals here when guests are assigned to this department.</p>
              </div>
              <div className="grid gap-3 text-sm">
                <MetricRow label="Assigned visits" value={String(department.totalAssignedVisits)} />
                <MetricRow label="Pending visits" value={String(department.pendingVisits)} />
                <MetricRow label="Active host coverage" value={String(department.activeHosts)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportsView({ loading, onExport, reportSummary, reportsActivity }: AdminDashboardContentProps) {
  const reportCards = [
    {
      title: "Daily check-ins",
      detail: `${reportSummary.checkedInOrOutCount} visits have already been checked in or completed.`,
      tone: "bg-blue-50 text-blue-800"
    },
    {
      title: "Approval turnaround",
      detail: `${reportSummary.pendingCount} requests are still waiting for a decision, while ${reportSummary.approvedOrActiveCount} are already approved or active.`,
      tone: "bg-emerald-50 text-emerald-800"
    },
    {
      title: "Risk review",
      detail: `${reportSummary.elevatedRiskCount} visits are marked as medium or elevated risk and may need extra review.`,
      tone: "bg-amber-50 text-amber-900"
    }
  ];

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors tracked" value={String(reportSummary.totalVisits)} change="live data" icon={<UsersRound className="h-5 w-5" />} tone="blue" />
        <StatCard label="Approved visits" value={`${reportSummary.approvalRate}%`} change="current" icon={<ShieldCheck className="h-5 w-5" />} tone="green" />
        <StatCard label="Checked in / out" value={String(reportSummary.checkedInOrOutCount)} change="processed" icon={<PieChart className="h-5 w-5" />} tone="amber" />
        <StatCard label="Exception rate" value={`${reportSummary.exceptionRate}%`} change="watchlist" icon={<SlidersHorizontal className="h-5 w-5" />} tone="red" />
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Operational summaries</CardTitle>
            <CardDescription>Compact report cards driven by the current visit data.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => onExport("report_summary")}>
            <Download className="h-4 w-4" />
            Export summary
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {reportCards.map((card) => (
            <div key={card.title} className="rounded-xl border border-border bg-white p-5">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.tone}`}>{card.title}</div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{card.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Entrance activity</CardTitle>
            <CardDescription>Share of traffic by lobby or entry point.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportSummary.entranceDistribution.length ? (
              reportSummary.entranceDistribution.map((entry) => <EntranceProgress key={entry.label} label={entry.label} value={entry.value} />)
            ) : (
              <p className="text-sm text-muted-foreground">Entrance activity will appear once visits are recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent report notes</CardTitle>
            <CardDescription>Activity updates that typically support operations reviews.</CardDescription>
          </CardHeader>
          <CardContent>{reportsActivity.length ? <ActivityFeed items={reportsActivity} /> : <p className="text-sm text-muted-foreground">Recent visit events will appear here.</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsView({ entrances, loading, onSaveSettings, settings }: AdminDashboardContentProps) {
  const [draft, setDraft] = useState<SiteSettings | null>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (loading || !draft) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Visitor operations</CardTitle>
            <CardDescription>Small, realistic settings for the current visitor workflow.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Log retention</Label>
                <Select value={String(draft.logRetentionDays)} onValueChange={(value) => setDraft((current) => current ? { ...current, logRetentionDays: Number(value) } : current)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Default entrance</Label>
                <Select value={draft.defaultEntranceId ?? ""} onValueChange={(value) => setDraft((current) => current ? { ...current, defaultEntranceId: value } : current)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entrance" />
                  </SelectTrigger>
                  <SelectContent>
                    {entrances.map((entrance) => (
                      <SelectItem key={entrance.id} value={entrance.id}>
                        {entrance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3">
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.securityEmailAlerts} onCheckedChange={(value) => setDraft((current) => current ? { ...current, securityEmailAlerts: Boolean(value) } : current)} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">Security email alerts</span>
                  <span className="mt-1 block text-muted-foreground">Send arrival exceptions and rejected visit notices to admins.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.badgePrintingEnabled} onCheckedChange={(value) => setDraft((current) => current ? { ...current, badgePrintingEnabled: Boolean(value) } : current)} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">Badge printing enabled</span>
                  <span className="mt-1 block text-muted-foreground">Allow reception to print physical badges alongside QR passes.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.hostDailyDigestEnabled} onCheckedChange={(value) => setDraft((current) => current ? { ...current, hostDailyDigestEnabled: Boolean(value) } : current)} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">Host daily digest</span>
                  <span className="mt-1 block text-muted-foreground">Send hosts a quick morning summary of their approved visitors.</span>
                </span>
              </label>
            </div>
            <Button onClick={() => onSaveSettings(draft)}>Save settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment notes</CardTitle>
            <CardDescription>Helpful context for this minimal operational build.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="font-semibold text-slate-950">Live backend source</p>
              <p className="mt-1 leading-6">These settings now persist to Supabase instead of staying local to the page.</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="font-semibold text-slate-950">Shared dashboard style</p>
              <p className="mt-1 leading-6">This screen still reuses the same cards, spacing, and form controls as the existing admin pages.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SearchField({ onChange, placeholder, value }: { onChange: (value: string) => void; placeholder: string; value: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="pl-9" placeholder={placeholder} />
    </div>
  );
}

function EntranceProgress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="text-sm text-muted-foreground">{value}%</p>
      </div>
      <Progress value={value} />
    </div>
  );
}

function PaginationFooter({ currentPage, onPageChange, pageSize, totalCount }: { currentPage: number; onPageChange: (page: number) => void; pageSize: number; totalCount: number }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Invited"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
          <div className="h-28 w-full animate-pulse rounded bg-slate-200" />
        </CardContent>
      </Card>
    </div>
  );
}
