import { useEffect, useState } from "react";
import { FileClock, History, LayoutDashboard, UserRound, UsersRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { HostDashboardContent, type HostView, getHostViewMeta } from "@/components/dashboard/HostDashboardContent";
import { VisitorDetailDrawer } from "@/components/dashboard/VisitorDetailDrawer";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useToast } from "@/components/ui/toast";
import {
  checkInVisit,
  checkOutVisit,
  decideVisit,
  fetchHostDashboardSummary,
  fetchHostVisits,
  fetchRecentVisitActivity,
  fetchVisitDetail,
  saveHostProfile,
  type DashboardVisit,
  type HostDashboardSummary,
  type RecentActivityItem,
  type StaffProfile,
  type VisitDetail
} from "@/lib/cd-vms";

const PAGE_SIZE = 8;
const hostViews: HostView[] = ["overview", "visitors", "pending", "history", "profile"];

function resolveHostView(value: string | null): HostView {
  return hostViews.includes((value ?? "overview") as HostView) ? ((value ?? "overview") as HostView) : "overview";
}

const emptySummary: HostDashboardSummary = {
  activePasses: 0,
  checkedInToday: 0,
  completedHistory: 0,
  expectedToday: 0,
  overdueVisits: 0,
  pendingApprovals: 0
};

export function HostDashboardPage() {
  const [searchParams] = useSearchParams();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [visits, setVisits] = useState<DashboardVisit[]>([]);
  const [pendingPreview, setPendingPreview] = useState<DashboardVisit[]>([]);
  const [todayVisitors, setTodayVisitors] = useState<DashboardVisit[]>([]);
  const [timeline, setTimeline] = useState<DashboardVisit[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [summary, setSummary] = useState<HostDashboardSummary>(emptySummary);
  const [totalVisits, setTotalVisits] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const view = resolveHostView(searchParams.get("view"));
  const meta = getHostViewMeta(view);

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [view]);

  useEffect(() => {
    async function loadViewData() {
      setLoading(true);

      try {
        const nextSummary = await fetchHostDashboardSummary();
        setSummary(nextSummary);

        if (view === "overview") {
          const [pendingResult, todayResult, timelineResult, activityResult] = await Promise.all([
            fetchHostVisits({ statusGroup: "pending", limit: 4 }),
            fetchHostVisits({ statusGroup: "today", limit: 6 }),
            fetchHostVisits({ statusGroup: "upcoming", limit: 4 }),
            fetchRecentVisitActivity(6)
          ]);

          setPendingPreview(pendingResult.items);
          setTodayVisitors(todayResult.items);
          setTimeline(timelineResult.items);
          setRecentActivity(activityResult);
          setVisits([]);
          setTotalVisits(0);
          return;
        }

        if (view === "profile") {
          setPendingPreview([]);
          setTodayVisitors([]);
          setTimeline([]);
          setRecentActivity([]);
          setVisits([]);
          setTotalVisits(0);
          return;
        }

        const statusGroup = view === "pending" ? "pending" : view === "history" ? "history" : "all";
        const visitPage = await fetchHostVisits({
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          search,
          statusGroup
        });

        setVisits(visitPage.items);
        setTotalVisits(visitPage.totalCount);
      } catch (error) {
        toast({
          title: "Unable to load host workspace",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    void loadViewData();
  }, [page, search, toast, view]);

  if (!profile) {
    return null;
  }

  const sidebarItems = [
    { label: "Dashboard", href: "/host", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "My Visitors", href: "/host?view=visitors", icon: <UsersRound className="h-4 w-4" /> },
    { label: "Pending Requests", href: "/host?view=pending", icon: <FileClock className="h-4 w-4" />, count: summary.pendingApprovals || undefined },
    { label: "Visit History", href: "/host?view=history", icon: <History className="h-4 w-4" /> },
    { label: "Profile", href: "/host?view=profile", icon: <UserRound className="h-4 w-4" /> }
  ];

  async function refreshVisibleData() {
    const nextSummary = await fetchHostDashboardSummary();
    setSummary(nextSummary);

    if (view === "overview") {
      const [pendingResult, todayResult, timelineResult, activityResult] = await Promise.all([
        fetchHostVisits({ statusGroup: "pending", limit: 4 }),
        fetchHostVisits({ statusGroup: "today", limit: 6 }),
        fetchHostVisits({ statusGroup: "upcoming", limit: 4 }),
        fetchRecentVisitActivity(6)
      ]);

      setPendingPreview(pendingResult.items);
      setTodayVisitors(todayResult.items);
      setTimeline(timelineResult.items);
      setRecentActivity(activityResult);
      return;
    }

    if (view === "profile") {
      return;
    }

    const statusGroup = view === "pending" ? "pending" : view === "history" ? "history" : "all";
    const visitPage = await fetchHostVisits({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      search,
      statusGroup
    });

    setVisits(visitPage.items);
    setTotalVisits(visitPage.totalCount);
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

  function viewVisitor(visitor: DashboardVisit) {
    setSelectedVisitor(null);
    void loadVisitorDetail(visitor.id);
  }

  async function refreshSelectedVisitor(visitId: string) {
    const detail = await fetchVisitDetail(visitId);
    setSelectedVisitor(detail);
  }

  async function decision(visitor: DashboardVisit, approved: boolean) {
    try {
      await decideVisit(visitor.id, approved, approved ? undefined : "Rejected from host dashboard");
      await refreshVisibleData();
      if (drawerOpen) {
        await refreshSelectedVisitor(visitor.id);
      }
      toast({
        title: approved ? "Visit approved" : "Visit rejected",
        description: `${visitor.visitorName} · ${visitor.organization}`,
        variant: approved ? "success" : "warning"
      });
    } catch (error) {
      toast({
        title: "Unable to update visit",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  }

  async function handleCheckIn(visitor: DashboardVisit) {
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
    }
  }

  async function handleCheckOut(visitor: DashboardVisit) {
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
    }
  }

  async function saveProfileDraft(nextProfile: StaffProfile) {
    try {
      await saveHostProfile(nextProfile);
      await refreshProfile();
      toast({
        title: "Host preferences saved",
        description: "Your profile and notification settings have been updated.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Unable to save profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <DashboardShell title={meta.title} subtitle={meta.subtitle} roleLabel="Host workspace" profileName={profile.fullName} sidebarItems={sidebarItems}>
      <HostDashboardContent
        loading={loading}
        onCheckIn={(visitor) => void handleCheckIn(visitor)}
        onCheckOut={(visitor) => void handleCheckOut(visitor)}
        onDecision={decision}
        onPageChange={setPage}
        onSaveProfile={saveProfileDraft}
        onSearchChange={setSearch}
        onViewVisitor={viewVisitor}
        page={page}
        pageSize={PAGE_SIZE}
        pendingPreview={pendingPreview}
        profile={profile}
        recentActivity={recentActivity}
        search={search}
        summary={summary}
        timeline={timeline}
        todayVisitors={todayVisitors}
        totalVisits={totalVisits}
        view={view}
        visits={visits}
      />

      <VisitorDetailDrawer
        visitor={selectedVisitor}
        loading={drawerLoading}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onApprove={(visitor) => void decision(visitor, true)}
        onReject={(visitor) => void decision(visitor, false)}
        onCheckIn={(visitor) => void handleCheckIn(visitor)}
        onCheckOut={(visitor) => void handleCheckOut(visitor)}
      />
    </DashboardShell>
  );
}
