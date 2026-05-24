import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Check, Clock3, FileClock, Search, UsersRound } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardVisit, HostDashboardSummary, RecentActivityItem, StaffProfile } from "@/lib/cd-vms";
import { formatTimeLabel, formatVisitWindow } from "@/lib/utils";

export type HostView = "overview" | "visitors" | "pending" | "history" | "profile";

type HostDashboardContentProps = {
  loading: boolean;
  onCheckIn: (visitor: DashboardVisit) => void;
  onCheckOut: (visitor: DashboardVisit) => void;
  onDecision: (visitor: DashboardVisit, approved: boolean) => void;
  onPageChange: (page: number) => void;
  onSaveProfile: (profile: StaffProfile) => void | Promise<void>;
  onSearchChange: (value: string) => void;
  onViewVisitor: (visitor: DashboardVisit) => void;
  page: number;
  pageSize: number;
  pendingPreview: DashboardVisit[];
  profile: StaffProfile;
  recentActivity: RecentActivityItem[];
  search: string;
  summary: HostDashboardSummary;
  timeline: DashboardVisit[];
  todayVisitors: DashboardVisit[];
  totalVisits: number;
  view: HostView;
  visits: DashboardVisit[];
};

const viewMeta: Record<HostView, { title: string; subtitle: string }> = {
  overview: {
    title: "Host Dashboard",
    subtitle: "Review incoming requests, see who is expected today, and keep your visitors moving through reception."
  },
  visitors: {
    title: "My Visitors",
    subtitle: "Keep track of upcoming arrivals, active guests, and approved visits connected to your workspace."
  },
  pending: {
    title: "Pending Requests",
    subtitle: "Handle approvals quickly so reception and security know who is cleared to arrive."
  },
  history: {
    title: "Visit History",
    subtitle: "Review prior visits, status outcomes, and timing for guests hosted by your team."
  },
  profile: {
    title: "Host Profile",
    subtitle: "Update your host details, notification preferences, and policy-facing notes for reception."
  }
};

export function getHostViewMeta(view: HostView) {
  return viewMeta[view];
}

export function HostDashboardContent(props: HostDashboardContentProps) {
  switch (props.view) {
    case "visitors":
      return <HostVisitorsView {...props} />;
    case "pending":
      return <HostPendingView {...props} />;
    case "history":
      return <HostHistoryView {...props} />;
    case "profile":
      return <HostProfileView profile={props.profile} onSaveProfile={props.onSaveProfile} />;
    case "overview":
    default:
      return <HostOverviewView {...props} />;
  }
}

function HostOverviewView({
  loading,
  onDecision,
  onViewVisitor,
  pendingPreview,
  profile,
  recentActivity,
  summary,
  timeline,
  todayVisitors
}: HostDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected today" value={String(summary.expectedToday)} change="scheduled visits" icon={<CalendarDays className="h-5 w-5" />} tone="blue" />
        <StatCard label="Pending approval" value={String(summary.pendingApprovals)} change="needs review" icon={<FileClock className="h-5 w-5" />} tone="amber" />
        <StatCard label="Checked in" value={String(summary.checkedInToday)} change="today" icon={<Check className="h-5 w-5" />} tone="green" />
        <StatCard label="Overdue / exceptions" value={String(summary.overdueVisits)} change={profile.availabilityStatus.replace("_", " ")} icon={<Clock3 className="h-5 w-5" />} tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Pending visitor requests</CardTitle>
              <CardDescription>Approve, reject, or inspect visit details before arrival.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/host?view=pending">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingPreview.length ? (
              <div className="grid gap-3">
                {pendingPreview.map((visitor) => (
                  <div key={visitor.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                          <StatusBadge status={visitor.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{visitor.organization} · {visitor.departmentName}</p>
                        <p className="mt-3 text-sm text-slate-700">{visitor.purpose}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{formatVisitWindow(visitor.scheduledFor)}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 lg:w-[340px]">
                        <Button size="sm" variant="success" onClick={() => onDecision(visitor, true)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDecision(visitor, false)}>
                          Reject
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onViewVisitor(visitor)}>
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileClock className="h-5 w-5" />}
                title="No approvals waiting"
                description="New visitor requests will appear here when they need a host decision."
                action="Open visitor list"
                actionHref="/host?view=visitors"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
            <CardDescription>Recent movement across your visitor queue.</CardDescription>
          </CardHeader>
          <CardContent>{recentActivity.length ? <ActivityFeed items={recentActivity} /> : <p className="text-sm text-muted-foreground">Recent visit events will appear here.</p>}</CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today’s visitors</CardTitle>
            <CardDescription>Expected and active visits associated with your team.</CardDescription>
          </CardHeader>
          <CardContent>
            {todayVisitors.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {todayVisitors.map((visitor) => (
                  <button key={visitor.id} className="rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/30 focus-ring" onClick={() => onViewVisitor(visitor)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{visitor.organization}</p>
                      </div>
                      <StatusBadge status={visitor.status} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-700">{visitor.purpose}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {visitor.location} · {formatTimeLabel(visitor.scheduledFor)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={<UsersRound className="h-5 w-5" />} title="No visitors scheduled today" description="Approved visits for today will appear here as soon as they are assigned to you." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming visits timeline</CardTitle>
            <CardDescription>Next arrivals and host handoffs.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length ? (
              <div className="space-y-4">
                {timeline.map((visitor) => (
                  <div key={visitor.id} className="grid grid-cols-[72px_1fr_auto] items-start gap-3">
                    <p className="text-sm font-semibold text-slate-500">{formatTimeLabel(visitor.scheduledFor)}</p>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{visitor.visitorName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{visitor.departmentName}</p>
                    </div>
                    <StatusBadge status={visitor.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming visits are scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HostVisitorsView({ loading, onCheckIn, onCheckOut, onPageChange, onSearchChange, onViewVisitor, page, pageSize, search, summary, totalVisits, visits }: HostDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned visitors" value={String(totalVisits)} change="live" icon={<UsersRound className="h-5 w-5" />} tone="blue" />
        <StatCard label="Active passes" value={String(summary.activePasses)} change="issued" icon={<Check className="h-5 w-5" />} tone="green" />
        <StatCard label="Expected today" value={String(summary.expectedToday)} change="scheduled" icon={<CalendarDays className="h-5 w-5" />} tone="amber" />
        <StatCard label="Visit history" value={String(summary.completedHistory)} change="completed" icon={<Clock3 className="h-5 w-5" />} tone="slate" />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Assigned visitor list</CardTitle>
            <CardDescription>Upcoming, approved, and completed visits connected to your host profile.</CardDescription>
          </div>
          <SearchField value={search} onChange={onSearchChange} placeholder="Search visitor, company, department, purpose..." />
        </CardHeader>
        <CardContent className="grid gap-3">
          {visits.length ? (
            <>
              {visits.map((visitor) => (
                <div key={visitor.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                        <StatusBadge status={visitor.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{visitor.organization} · {visitor.departmentName}</p>
                      <p className="mt-3 text-sm text-slate-700">{visitor.purpose}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{formatVisitWindow(visitor.scheduledFor)} · {visitor.location}</p>
                    </div>
                    <div className="grid gap-2 sm:w-[180px]">
                      <Button size="sm" variant="outline" onClick={() => onViewVisitor(visitor)}>
                        View details
                      </Button>
                      {visitor.status === "Approved" ? (
                        <Button size="sm" variant="secondary" onClick={() => onCheckIn(visitor)}>
                          Check in
                        </Button>
                      ) : null}
                      {visitor.status === "Checked In" ? (
                        <Button size="sm" variant="secondary" onClick={() => onCheckOut(visitor)}>
                          Check out
                        </Button>
                      ) : null}
                      {visitor.passToken ? (
                        <Button size="sm" asChild>
                          <Link to={`/pass?token=${visitor.passToken}`}>Open pass</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              <PaginationFooter currentPage={page} onPageChange={onPageChange} pageSize={pageSize} totalCount={totalVisits} />
            </>
          ) : (
            <EmptyState icon={<UsersRound className="h-5 w-5" />} title="No visitor records found" description="Adjust the search or wait for new visits to be assigned to your host profile." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HostPendingView({ loading, onDecision, onPageChange, onSearchChange, onViewVisitor, page, pageSize, search, totalVisits, visits }: HostDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Approval queue</CardTitle>
              <CardDescription>Keep the lobby moving by resolving host decisions before the scheduled arrival time.</CardDescription>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">{totalVisits} open items</div>
          </div>
          <SearchField value={search} onChange={onSearchChange} placeholder="Search visitor, purpose, department..." />
        </CardHeader>
        <CardContent className="grid gap-3">
          {visits.length ? (
            <>
              {visits.map((visitor) => (
                <div key={visitor.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                        <StatusBadge status={visitor.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{visitor.organization} · {visitor.departmentName}</p>
                      <p className="mt-3 text-sm text-slate-700">{visitor.purpose}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{formatVisitWindow(visitor.scheduledFor)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 lg:w-[340px]">
                      <Button size="sm" variant="success" onClick={() => onDecision(visitor, true)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDecision(visitor, false)}>
                        Reject
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onViewVisitor(visitor)}>
                        Inspect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <PaginationFooter currentPage={page} onPageChange={onPageChange} pageSize={pageSize} totalCount={totalVisits} />
            </>
          ) : (
            <EmptyState icon={<FileClock className="h-5 w-5" />} title="Queue is clear" description="There are no host decisions waiting right now. New visitor requests will appear here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HostHistoryView({ loading, onPageChange, onSearchChange, onViewVisitor, page, pageSize, search, totalVisits, visits }: HostDashboardContentProps) {
  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-grid">
      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Recent visit history</CardTitle>
            <CardDescription>Past visits stay visible here for quick follow-up and compliance review.</CardDescription>
          </div>
          <SearchField value={search} onChange={onSearchChange} placeholder="Search visitor, company, reference..." />
        </CardHeader>
        <CardContent>
          {visits.length ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                            <p className="text-sm text-muted-foreground">{visitor.organization}</p>
                          </div>
                        </TableCell>
                        <TableCell>{visitor.purpose}</TableCell>
                        <TableCell>{formatVisitWindow(visitor.scheduledFor)}</TableCell>
                        <TableCell>
                          <StatusBadge status={visitor.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => onViewVisitor(visitor)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 md:hidden">
                {visits.map((visitor) => (
                  <button key={visitor.id} className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-ring" onClick={() => onViewVisitor(visitor)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{visitor.visitorName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{visitor.organization}</p>
                      </div>
                      <StatusBadge status={visitor.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{visitor.purpose}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatVisitWindow(visitor.scheduledFor)}</p>
                  </button>
                ))}
              </div>
              <PaginationFooter currentPage={page} onPageChange={onPageChange} pageSize={pageSize} totalCount={totalVisits} />
            </>
          ) : (
            <EmptyState icon={<Clock3 className="h-5 w-5" />} title="No history yet" description="Completed, rejected, and expired visits will appear here once activity starts." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HostProfileView({ onSaveProfile, profile }: Pick<HostDashboardContentProps, "onSaveProfile" | "profile">) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  return (
    <div className="dashboard-grid">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace profile</CardTitle>
            <CardDescription>Keep your contact details and reception notes current for smoother check-ins.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Full name</Label>
                <Input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={draft.workEmail} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Desk / location</Label>
                <Input value={draft.deskLocation} onChange={(event) => setDraft((current) => ({ ...current, deskLocation: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input value={draft.jobTitle || "Host"} disabled />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Reception notes</Label>
              <Textarea value={draft.receptionNotes} onChange={(event) => setDraft((current) => ({ ...current, receptionNotes: event.target.value }))} />
            </div>
            <Button onClick={() => onSaveProfile(draft)}>Save profile</Button>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose how host decisions and arrival alerts reach you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.notifyEmailArrivals} onCheckedChange={(value) => setDraft((current) => ({ ...current, notifyEmailArrivals: Boolean(value) }))} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">Email arrival alerts</span>
                  <span className="mt-1 block text-muted-foreground">Receive approvals, check-ins, and checkout confirmations by email.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.notifySmsEscalations} onCheckedChange={(value) => setDraft((current) => ({ ...current, notifySmsEscalations: Boolean(value) }))} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">SMS for urgent delays</span>
                  <span className="mt-1 block text-muted-foreground">Use text alerts only for escalations or lobby exceptions.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                <Checkbox checked={draft.notifyDailyDigest} onCheckedChange={(value) => setDraft((current) => ({ ...current, notifyDailyDigest: Boolean(value) }))} className="mt-0.5" />
                <span>
                  <span className="block font-semibold text-slate-950">Daily visitor digest</span>
                  <span className="mt-1 block text-muted-foreground">Send a morning summary of upcoming approved visits.</span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy notes</CardTitle>
              <CardDescription>Quick reminders tied to visitor approvals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="font-semibold text-slate-950">Escort policy</p>
                <p className="mt-1 leading-6">Contractors and elevated-risk visitors should not move beyond reception without a confirmed escort.</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="font-semibold text-slate-950">Guest access</p>
                <p className="mt-1 leading-6">Badge validity is limited to the approved time window and assigned destination.</p>
              </div>
            </CardContent>
          </Card>
        </div>
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

function PaginationFooter({ currentPage, onPageChange, pageSize, totalCount }: { currentPage: number; onPageChange: (page: number) => void; pageSize: number; totalCount: number }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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

function DashboardLoadingState() {
  return (
    <div className="dashboard-grid">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
