import { formatRelativeTimeLabel } from "@/lib/utils";
import type { Database, Json, Tables } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export type PermissionRole = "host" | "admin";
export type VisitorStatus = "Pending" | "Approved" | "Checked In" | "Checked Out" | "Rejected" | "Expired";
export type RiskLevel = "Low" | "Medium" | "Elevated";
export type HostStatusGroup = "all" | "pending" | "history" | "active" | "today" | "upcoming" | "exceptions";
export type AdminLogStatus = "all" | "pending" | "approved" | "checked_in" | "checked_out" | "rejected" | "expired";
export type ExportKind = "visitor_logs" | "report_summary";

export type DashboardEvent = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorLabel: string | null;
  occurredAt: string;
};

export type DashboardVisit = {
  id: string;
  referenceCode: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  organization: string;
  hostId: string;
  hostName: string;
  hostEmail: string;
  departmentId: string;
  departmentName: string;
  purpose: string;
  entranceName: string;
  location: string;
  scheduledFor: string;
  status: VisitorStatus;
  statusValue: string;
  riskLevel: RiskLevel;
  notes: string;
  checkIn?: string;
  checkOut?: string;
  passToken?: string;
  passExpiresAt?: string;
  events: DashboardEvent[];
};

export type VisitDetail = DashboardVisit & {
  passStatus?: string;
};

export type RecentActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: "default" | "success" | "warning" | "muted";
};

export type HostDirectoryEntry = {
  id: string;
  fullName: string;
  workEmail: string;
  jobTitle: string;
  deskLocation: string;
  availabilityStatus: string;
  departmentId: string;
  departmentName: string;
  floorLabel: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
  floorLabel: string;
};

export type StaffProfile = {
  id: string;
  fullName: string;
  workEmail: string;
  permissionRole: PermissionRole;
  jobTitle: string;
  departmentId?: string;
  departmentName?: string;
  deskLocation: string;
  accountStatus: string;
  availabilityStatus: string;
  canHostVisits: boolean;
  notifyEmailArrivals: boolean;
  notifySmsEscalations: boolean;
  notifyDailyDigest: boolean;
  receptionNotes: string;
};

export type SiteSettings = {
  id: number;
  logRetentionDays: number;
  defaultEntranceId?: string;
  defaultEntranceName?: string;
  securityEmailAlerts: boolean;
  badgePrintingEnabled: boolean;
  hostDailyDigestEnabled: boolean;
};

export type StaffDirectoryItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissionRole: PermissionRole;
  department: string;
  visitors: number;
  status: string;
};

export type DepartmentCoverageSummary = {
  id: string;
  name: string;
  floorLabel: string;
  activeHosts: number;
  totalAssignedVisits: number;
  pendingVisits: number;
};

export type HostDashboardSummary = {
  expectedToday: number;
  pendingApprovals: number;
  checkedInToday: number;
  overdueVisits: number;
  activePasses: number;
  completedHistory: number;
};

export type AdminReportSummary = {
  totalVisits: number;
  pendingCount: number;
  approvedOrActiveCount: number;
  rejectedCount: number;
  checkedInOrOutCount: number;
  elevatedRiskCount: number;
  approvalRate: number;
  exceptionRate: number;
  entranceDistribution: Array<{ label: string; value: number }>;
};

export type PaginatedVisits = {
  items: DashboardVisit[];
  totalCount: number;
};

export type HostVisitFilters = {
  limit?: number;
  offset?: number;
  search?: string;
  statusGroup?: HostStatusGroup;
};

export type AdminVisitorLogFilters = {
  limit?: number;
  offset?: number;
  query?: string;
  status?: AdminLogStatus;
};

export type RegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  purpose: string;
  hostStaffId: string;
  departmentId: string;
  scheduledFor: string;
  notes?: string;
};

export type RegistrationResult = {
  referenceCode: string;
  status: string;
  visitId: string;
};

export type PublicPassRecord = {
  referenceCode: string;
  visitorName: string;
  visitorOrganization: string;
  hostName: string;
  departmentName: string;
  entranceName: string;
  scheduledFor: string;
  visitStatus: string;
  passStatus: string;
  expiresAt: string;
  passToken: string;
};

type VisitRowShape = Omit<Database["public"]["Functions"]["list_host_visits"]["Returns"][number], "total_count">;
type VisitListRow = Database["public"]["Functions"]["list_host_visits"]["Returns"][number] | Database["public"]["Functions"]["list_admin_visitor_logs"]["Returns"][number];
type VisitDetailRow = Database["public"]["Functions"]["get_visit_detail"]["Returns"][number];
type RecentActivityRow = Database["public"]["Functions"]["list_recent_visit_activity"]["Returns"][number];
type StaffDirectoryRow = Database["public"]["Functions"]["list_staff_directory"]["Returns"][number];
type DepartmentCoverageRow = Database["public"]["Functions"]["list_department_coverage"]["Returns"][number];
type HostDirectoryRow = Database["public"]["Functions"]["list_public_hosts"]["Returns"][number];
type HostSummaryRow = Database["public"]["Functions"]["get_host_dashboard_summary"]["Returns"][number];
type AdminReportRow = Database["public"]["Functions"]["get_admin_report_summary"]["Returns"][number];
type PublicPassRow = Database["public"]["Functions"]["get_public_pass"]["Returns"][number];
type SubmitVisitRow = Database["public"]["Functions"]["submit_visit_request"]["Returns"][number];

type StaffProfileRowWithDepartment = Tables<"staff_profiles"> & {
  departments?: { id: string; name: string } | null;
};

type SiteSettingsRowWithEntrance = Tables<"site_settings"> & {
  entrances?: { name: string } | null;
};

type ExportResponse = {
  content: string;
  filename: string;
  mimeType: string;
};

function mapEvent(item: {
  actorLabel: string | null;
  detail: string | null;
  id: string;
  occurredAt: string;
  title: string;
  type: string;
}): DashboardEvent {
  return item;
}

function normalizeEvents(value: Json): DashboardEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as Record<string, Json>;

      return mapEvent({
        actorLabel: typeof record.actorLabel === "string" ? record.actorLabel : null,
        detail: typeof record.detail === "string" ? record.detail : null,
        id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
        occurredAt: typeof record.occurredAt === "string" ? record.occurredAt : new Date().toISOString(),
        title: typeof record.title === "string" ? record.title : "Visit event",
        type: typeof record.type === "string" ? record.type : "event"
      });
    })
    .filter((item): item is DashboardEvent => Boolean(item))
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());
}

export function mapVisitStatus(value: string): VisitorStatus {
  switch (value) {
    case "approved":
      return "Approved";
    case "checked_in":
      return "Checked In";
    case "checked_out":
      return "Checked Out";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    case "pending":
    default:
      return "Pending";
  }
}

export function mapRiskLevel(value: string): RiskLevel {
  switch (value) {
    case "medium":
      return "Medium";
    case "elevated":
      return "Elevated";
    case "low":
    default:
      return "Low";
  }
}

export function activityTone(type: string): "default" | "success" | "warning" | "muted" {
  if (type.includes("rejected") || type.includes("pending")) return "warning";
  if (type.includes("approved") || type.includes("checked") || type.includes("pass")) return "success";
  return "default";
}

export function roleLabel(profile: Pick<StaffProfile, "permissionRole" | "jobTitle">) {
  return profile.jobTitle || (profile.permissionRole === "admin" ? "Admin/Security" : "Host");
}

export function staffStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "limited":
      return "Limited";
    case "disabled":
      return "Disabled";
    case "invited":
    default:
      return "Invited";
  }
}

function mapProfile(record: StaffProfileRowWithDepartment): StaffProfile {
  return {
    id: record.id,
    fullName: record.full_name,
    workEmail: record.work_email,
    permissionRole: record.permission_role as PermissionRole,
    jobTitle: record.job_title ?? "",
    departmentId: record.department_id ?? undefined,
    departmentName: record.departments?.name ?? undefined,
    deskLocation: record.desk_location ?? "",
    accountStatus: record.account_status,
    availabilityStatus: record.availability_status,
    canHostVisits: record.can_host_visits,
    notifyEmailArrivals: record.notify_email_arrivals,
    notifySmsEscalations: record.notify_sms_escalations,
    notifyDailyDigest: record.notify_daily_digest,
    receptionNotes: record.reception_notes ?? ""
  };
}

function mapVisitRow(record: VisitRowShape, events: DashboardEvent[] = []): DashboardVisit {
  return {
    id: record.id,
    referenceCode: record.reference_code,
    visitorId: record.visitor_id,
    visitorName: record.visitor_name,
    visitorEmail: record.visitor_email,
    visitorPhone: record.visitor_phone,
    organization: record.visitor_organization,
    hostId: record.host_id,
    hostName: record.host_name,
    hostEmail: record.host_email,
    departmentId: record.department_id,
    departmentName: record.department_name,
    purpose: record.purpose,
    entranceName: record.entrance_name,
    location: record.entrance_name,
    scheduledFor: record.scheduled_for,
    status: mapVisitStatus(record.status),
    statusValue: record.status,
    riskLevel: mapRiskLevel(record.risk_level),
    notes: record.notes ?? "No additional notes.",
    checkIn: record.check_in_at ?? undefined,
    checkOut: record.check_out_at ?? undefined,
    passToken: record.pass_token ?? undefined,
    passExpiresAt: record.pass_expires_at ?? undefined,
    events
  };
}

function mapVisitDetail(record: VisitDetailRow): VisitDetail {
  return {
    ...mapVisitRow(record, normalizeEvents(record.events)),
    passStatus: record.pass_status ?? undefined
  };
}

function mapRecentActivity(record: RecentActivityRow): RecentActivityItem {
  return {
    id: record.id,
    label: `${record.visitor_name} · ${record.title}`,
    detail: record.detail ?? record.department_name,
    time: formatRelativeTimeLabel(record.occurred_at),
    tone: activityTone(record.event_type)
  };
}

function mapEntranceDistribution(value: Json): Array<{ label: string; value: number }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as Record<string, Json>;
      const label = typeof record.label === "string" ? record.label : null;
      const numericValue = typeof record.value === "number" ? record.value : null;

      if (!label || numericValue === null) return null;
      return { label, value: numericValue };
    })
    .filter((item): item is { label: string; value: number } => Boolean(item));
}

export async function fetchRegistrationOptions() {
  const [{ data: departments, error: departmentsError }, { data: hosts, error: hostsError }] = await Promise.all([
    supabase.from("departments").select("id, name, floor_label").eq("is_active", true).order("name"),
    supabase.rpc("list_public_hosts")
  ]);

  if (departmentsError) throw departmentsError;
  if (hostsError) throw hostsError;

  return {
    departments: (departments ?? []).map((department) => ({
      id: department.id,
      name: department.name,
      floorLabel: department.floor_label ?? ""
    })) satisfies DepartmentOption[],
    hosts: (hosts ?? []).map((host: HostDirectoryRow) => ({
      id: host.id,
      fullName: host.full_name,
      workEmail: host.work_email,
      jobTitle: host.job_title ?? "",
      deskLocation: host.desk_location ?? "",
      availabilityStatus: host.availability_status ?? "available",
      departmentId: host.department_id,
      departmentName: host.department_name,
      floorLabel: host.floor_label ?? ""
    })) satisfies HostDirectoryEntry[]
  };
}

export async function submitVisitRequest(payload: RegistrationPayload): Promise<RegistrationResult | null> {
  const { data, error } = await supabase.rpc("submit_visit_request", {
    p_department_id: payload.departmentId,
    p_email: payload.email,
    p_full_name: payload.fullName,
    p_host_staff_id: payload.hostStaffId,
    p_notes: payload.notes ?? undefined,
    p_organization: payload.organization,
    p_phone: payload.phone,
    p_purpose: payload.purpose,
    p_scheduled_for: payload.scheduledFor
  });

  if (error) throw error;

  const record = (data ?? [])[0] as SubmitVisitRow | undefined;
  if (!record) return null;

  return {
    referenceCode: record.reference_code,
    status: record.status,
    visitId: record.visit_id
  };
}

export async function fetchPublicPass(token: string): Promise<PublicPassRecord | null> {
  const { data, error } = await supabase.rpc("get_public_pass", { p_token: token });
  if (error) throw error;

  const record = (data ?? [])[0] as PublicPassRow | undefined;
  if (!record) return null;

  return {
    referenceCode: record.reference_code,
    visitorName: record.visitor_name,
    visitorOrganization: record.visitor_organization,
    hostName: record.host_name,
    departmentName: record.department_name,
    entranceName: record.entrance_name,
    scheduledFor: record.scheduled_for,
    visitStatus: record.visit_status,
    passStatus: record.pass_status,
    expiresAt: record.expires_at,
    passToken: record.pass_token
  };
}

export async function fetchCurrentStaffProfile() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data, error } = await supabase.from("staff_profiles").select("*, departments(id, name)").eq("id", user.id).single();
  if (error) throw error;

  return mapProfile(data as StaffProfileRowWithDepartment);
}

export async function fetchHostDashboardSummary(): Promise<HostDashboardSummary> {
  const { data, error } = await supabase.rpc("get_host_dashboard_summary");
  if (error) throw error;

  const record = (data ?? [])[0] as HostSummaryRow | undefined;

  return {
    expectedToday: record?.expected_today ?? 0,
    pendingApprovals: record?.pending_approvals ?? 0,
    checkedInToday: record?.checked_in_today ?? 0,
    overdueVisits: record?.overdue_visits ?? 0,
    activePasses: record?.active_passes ?? 0,
    completedHistory: record?.completed_history ?? 0
  };
}

export async function fetchHostVisits(filters: HostVisitFilters = {}): Promise<PaginatedVisits> {
  const { data, error } = await supabase.rpc("list_host_visits", {
    p_limit: filters.limit ?? 12,
    p_offset: filters.offset ?? 0,
    p_search: filters.search?.trim() || undefined,
    p_status_group: filters.statusGroup ?? "all"
  });

  if (error) throw error;

  const rows = (data ?? []) as Database["public"]["Functions"]["list_host_visits"]["Returns"];
  return {
    items: rows.map((row) => mapVisitRow(row)),
    totalCount: rows[0]?.total_count ?? 0
  };
}

export async function fetchAdminVisitorLogs(filters: AdminVisitorLogFilters = {}): Promise<PaginatedVisits> {
  const { data, error } = await supabase.rpc("list_admin_visitor_logs", {
    p_limit: filters.limit ?? 12,
    p_offset: filters.offset ?? 0,
    p_query: filters.query?.trim() || undefined,
    p_status: filters.status ?? "all"
  });

  if (error) throw error;

  const rows = (data ?? []) as Database["public"]["Functions"]["list_admin_visitor_logs"]["Returns"];
  return {
    items: rows.map((row) => mapVisitRow(row)),
    totalCount: rows[0]?.total_count ?? 0
  };
}

export async function fetchVisitDetail(visitId: string) {
  const { data, error } = await supabase.rpc("get_visit_detail", { p_visit_id: visitId });
  if (error) throw error;

  const record = (data ?? [])[0] as VisitDetailRow | undefined;
  return record ? mapVisitDetail(record) : null;
}

export async function fetchRecentVisitActivity(limit = 8) {
  const { data, error } = await supabase.rpc("list_recent_visit_activity", { p_limit: limit });
  if (error) throw error;

  return ((data ?? []) as Database["public"]["Functions"]["list_recent_visit_activity"]["Returns"]).map(mapRecentActivity);
}

export async function fetchStaffDirectory() {
  const { data, error } = await supabase.rpc("list_staff_directory");
  if (error) throw error;

  return ((data ?? []) as StaffDirectoryRow[]).map((record) => ({
    id: record.id,
    name: record.full_name,
    email: record.work_email,
    role: record.job_title || (record.permission_role === "admin" ? "Admin/Security" : "Host"),
    permissionRole: record.permission_role as PermissionRole,
    department: record.department_name || "Unassigned",
    visitors: record.assigned_visit_count ?? 0,
    status: staffStatusLabel(record.account_status)
  })) satisfies StaffDirectoryItem[];
}

export async function fetchDepartmentCoverage() {
  const { data, error } = await supabase.rpc("list_department_coverage");
  if (error) throw error;

  return ((data ?? []) as DepartmentCoverageRow[]).map((record) => ({
    id: record.id,
    name: record.name,
    floorLabel: record.floor_label ?? "",
    activeHosts: record.active_hosts ?? 0,
    totalAssignedVisits: record.total_assigned_visits ?? 0,
    pendingVisits: record.pending_visits ?? 0
  })) satisfies DepartmentCoverageSummary[];
}

export async function fetchAdminReportSummary(): Promise<AdminReportSummary> {
  const { data, error } = await supabase.rpc("get_admin_report_summary");
  if (error) throw error;

  const record = (data ?? [])[0] as AdminReportRow | undefined;

  return {
    totalVisits: record?.total_visits ?? 0,
    pendingCount: record?.pending_count ?? 0,
    approvedOrActiveCount: record?.approved_or_active_count ?? 0,
    rejectedCount: record?.rejected_count ?? 0,
    checkedInOrOutCount: record?.checked_in_or_out_count ?? 0,
    elevatedRiskCount: record?.elevated_risk_count ?? 0,
    approvalRate: record?.approval_rate ?? 0,
    exceptionRate: record?.exception_rate ?? 0,
    entranceDistribution: mapEntranceDistribution(record?.entrance_distribution ?? [])
  };
}

export async function fetchAdminReferenceData() {
  const [{ data: departments, error: departmentsError }, { data: entrances, error: entrancesError }, { data: settings, error: settingsError }] =
    await Promise.all([
      supabase.from("departments").select("id, name, floor_label").eq("is_active", true).order("name"),
      supabase.from("entrances").select("id, name").eq("is_active", true).order("name"),
      supabase.from("site_settings").select("*, entrances(name)").eq("id", 1).single()
    ]);

  if (departmentsError) throw departmentsError;
  if (entrancesError) throw entrancesError;
  if (settingsError) throw settingsError;

  const settingRecord = settings as SiteSettingsRowWithEntrance;

  return {
    departments: departments ?? [],
    entrances: entrances ?? [],
    settings: {
      id: settingRecord.id,
      logRetentionDays: settingRecord.log_retention_days,
      defaultEntranceId: settingRecord.default_entrance_id ?? undefined,
      defaultEntranceName: settingRecord.entrances?.name ?? undefined,
      securityEmailAlerts: settingRecord.security_email_alerts,
      badgePrintingEnabled: settingRecord.badge_printing_enabled,
      hostDailyDigestEnabled: settingRecord.host_daily_digest_enabled
    } satisfies SiteSettings
  };
}

export async function decideVisit(visitId: string, approved: boolean, reason?: string) {
  const { data, error } = await supabase.rpc("decide_visit_request", {
    p_approved: approved,
    p_reason: reason ?? undefined,
    p_visit_id: visitId
  });

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function checkInVisit(visitId: string) {
  const { data, error } = await supabase.rpc("check_in_visit", { p_visit_id: visitId });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function checkOutVisit(visitId: string) {
  const { data, error } = await supabase.rpc("check_out_visit", { p_visit_id: visitId });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function saveHostProfile(profile: Partial<StaffProfile> & Pick<StaffProfile, "id">) {
  const { error } = await supabase
    .from("staff_profiles")
    .update({
      desk_location: profile.deskLocation,
      full_name: profile.fullName,
      notify_daily_digest: profile.notifyDailyDigest,
      notify_email_arrivals: profile.notifyEmailArrivals,
      notify_sms_escalations: profile.notifySmsEscalations,
      reception_notes: profile.receptionNotes
    })
    .eq("id", profile.id);

  if (error) throw error;
}

export async function saveSiteSettings(settings: SiteSettings) {
  const { error } = await supabase
    .from("site_settings")
    .update({
      badge_printing_enabled: settings.badgePrintingEnabled,
      default_entrance_id: settings.defaultEntranceId ?? null,
      host_daily_digest_enabled: settings.hostDailyDigestEnabled,
      log_retention_days: settings.logRetentionDays,
      security_email_alerts: settings.securityEmailAlerts
    })
    .eq("id", settings.id);

  if (error) throw error;
}

export async function inviteStaffMember(payload: {
  email: string;
  fullName: string;
  permissionRole: PermissionRole;
  departmentId?: string;
  jobTitle?: string;
}) {
  const { data, error } = await supabase.functions.invoke("invite-staff", { body: payload });
  if (error) throw error;
  return data;
}

export async function exportOperations(payload: { kind: ExportKind; query?: string; status?: AdminLogStatus }) {
  const { data, error } = await supabase.functions.invoke("export-operations", {
    body: payload
  });

  if (error) throw error;
  return data as ExportResponse;
}
