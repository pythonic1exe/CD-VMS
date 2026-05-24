export type VisitorStatus = "Pending" | "Approved" | "Checked In" | "Checked Out" | "Rejected" | "Expired";

export type Visitor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  host: string;
  hostEmail: string;
  department: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  expectedTime: string;
  status: VisitorStatus;
  location: string;
  riskLevel: "Low" | "Medium" | "Elevated";
  notes: string;
  timeline: Array<{ label: string; time: string; tone?: "success" | "warning" | "muted" }>;
  history: Array<{ label: string; actor: string; time: string }>;
};

export type Host = {
  id: string;
  name: string;
  email: string;
  department: string;
  desk: string;
  status: "Available" | "In meeting" | "Away";
};

export type Department = {
  id: string;
  name: string;
  floor: string;
  activeHosts: number;
};

export const departments: Department[] = [
  { id: "dept-1", name: "Product & Engineering", floor: "Floor 8", activeHosts: 42 },
  { id: "dept-2", name: "People Operations", floor: "Floor 6", activeHosts: 14 },
  { id: "dept-3", name: "Facilities & Security", floor: "Lobby", activeHosts: 9 },
  { id: "dept-4", name: "Finance", floor: "Floor 5", activeHosts: 11 },
  { id: "dept-5", name: "Admissions", floor: "North Wing", activeHosts: 22 }
];

export const hosts: Host[] = [
  {
    id: "host-1",
    name: "Ayesha Khan",
    email: "ayesha.khan@cdvms.local",
    department: "Product & Engineering",
    desk: "8C-18",
    status: "Available"
  },
  {
    id: "host-2",
    name: "Daniel Mercer",
    email: "daniel.mercer@cdvms.local",
    department: "Facilities & Security",
    desk: "Lobby-02",
    status: "In meeting"
  },
  {
    id: "host-3",
    name: "Maya Rodriguez",
    email: "maya.rodriguez@cdvms.local",
    department: "People Operations",
    desk: "6A-10",
    status: "Available"
  },
  {
    id: "host-4",
    name: "Omar Siddiqui",
    email: "omar.siddiqui@cdvms.local",
    department: "Finance",
    desk: "5B-06",
    status: "Away"
  },
  {
    id: "host-5",
    name: "Priya Shah",
    email: "priya.shah@cdvms.local",
    department: "Admissions",
    desk: "NW-14",
    status: "Available"
  }
];

export const visitors: Visitor[] = [
  {
    id: "VMS-24018",
    name: "Noah Bennet",
    email: "noah.bennet@northline.co",
    phone: "+1 (415) 555-0198",
    organization: "Northline Consulting",
    host: "Ayesha Khan",
    hostEmail: "ayesha.khan@cdvms.local",
    department: "Product & Engineering",
    purpose: "Quarterly roadmap workshop",
    checkIn: "2026-05-12T09:08:00",
    expectedTime: "2026-05-12T09:00:00",
    status: "Checked In",
    location: "Main Lobby",
    riskLevel: "Low",
    notes: "NDA acknowledged. Visitor requested guest Wi-Fi.",
    timeline: [
      { label: "Pre-registered", time: "2026-05-11T16:18:00", tone: "muted" },
      { label: "Host approved", time: "2026-05-11T16:21:00", tone: "success" },
      { label: "Checked in at kiosk 2", time: "2026-05-12T09:08:00", tone: "success" }
    ],
    history: [
      { label: "Pass generated", actor: "System", time: "May 11, 4:18 PM" },
      { label: "Approved visit", actor: "Ayesha Khan", time: "May 11, 4:21 PM" },
      { label: "Badge printed", actor: "Lobby Desk", time: "May 12, 9:09 AM" }
    ]
  },
  {
    id: "VMS-24019",
    name: "Elena Park",
    email: "elena.park@meridian.edu",
    phone: "+1 (312) 555-0121",
    organization: "Meridian University",
    host: "Priya Shah",
    hostEmail: "priya.shah@cdvms.local",
    department: "Admissions",
    purpose: "Campus partnership meeting",
    checkIn: "2026-05-12T10:30:00",
    expectedTime: "2026-05-12T10:30:00",
    status: "Approved",
    location: "North Wing Reception",
    riskLevel: "Low",
    notes: "Send wayfinding instructions to North Wing reception.",
    timeline: [
      { label: "Registered online", time: "2026-05-12T08:44:00", tone: "muted" },
      { label: "Host approved", time: "2026-05-12T08:51:00", tone: "success" }
    ],
    history: [
      { label: "Visit created", actor: "Elena Park", time: "Today, 8:44 AM" },
      { label: "Approved visit", actor: "Priya Shah", time: "Today, 8:51 AM" }
    ]
  },
  {
    id: "VMS-24020",
    name: "Marcus Chen",
    email: "marcus@buildgrid.io",
    phone: "+1 (646) 555-0172",
    organization: "BuildGrid",
    host: "Daniel Mercer",
    hostEmail: "daniel.mercer@cdvms.local",
    department: "Facilities & Security",
    purpose: "Badge reader maintenance",
    checkIn: "2026-05-12T11:15:00",
    expectedTime: "2026-05-12T11:15:00",
    status: "Pending",
    location: "Service Entrance",
    riskLevel: "Medium",
    notes: "Contractor requires escort beyond the lobby.",
    timeline: [{ label: "Awaiting host decision", time: "2026-05-12T09:37:00", tone: "warning" }],
    history: [{ label: "Request submitted", actor: "Marcus Chen", time: "Today, 9:37 AM" }]
  },
  {
    id: "VMS-24021",
    name: "Hannah Ibrahim",
    email: "hannah@optiwell.health",
    phone: "+1 (202) 555-0133",
    organization: "Optiwell Health",
    host: "Maya Rodriguez",
    hostEmail: "maya.rodriguez@cdvms.local",
    department: "People Operations",
    purpose: "Wellness benefits review",
    checkIn: "2026-05-12T08:40:00",
    checkOut: "2026-05-12T09:55:00",
    expectedTime: "2026-05-12T08:30:00",
    status: "Checked Out",
    location: "South Lobby",
    riskLevel: "Low",
    notes: "Meeting completed. Visitor returned badge at reception.",
    timeline: [
      { label: "Checked in", time: "2026-05-12T08:40:00", tone: "success" },
      { label: "Checked out", time: "2026-05-12T09:55:00", tone: "muted" }
    ],
    history: [
      { label: "Badge printed", actor: "South Lobby", time: "Today, 8:41 AM" },
      { label: "Checkout completed", actor: "Security", time: "Today, 9:55 AM" }
    ]
  },
  {
    id: "VMS-24022",
    name: "Jared Fields",
    email: "jared.fields@cobalt-labs.com",
    phone: "+1 (718) 555-0119",
    organization: "Cobalt Labs",
    host: "Omar Siddiqui",
    hostEmail: "omar.siddiqui@cdvms.local",
    department: "Finance",
    purpose: "Vendor reconciliation",
    checkIn: "2026-05-12T13:00:00",
    expectedTime: "2026-05-12T13:00:00",
    status: "Rejected",
    location: "Main Lobby",
    riskLevel: "Elevated",
    notes: "Host declined due to missing purchase-order reference.",
    timeline: [
      { label: "Submitted", time: "2026-05-12T07:12:00", tone: "muted" },
      { label: "Rejected by host", time: "2026-05-12T07:29:00", tone: "warning" }
    ],
    history: [
      { label: "Request submitted", actor: "Jared Fields", time: "Today, 7:12 AM" },
      { label: "Rejected request", actor: "Omar Siddiqui", time: "Today, 7:29 AM" }
    ]
  },
  {
    id: "VMS-24023",
    name: "Sofia Almeida",
    email: "sofia@clearpath.design",
    phone: "+1 (213) 555-0164",
    organization: "Clearpath Design",
    host: "Ayesha Khan",
    hostEmail: "ayesha.khan@cdvms.local",
    department: "Product & Engineering",
    purpose: "UX research interview",
    checkIn: "2026-05-13T14:00:00",
    expectedTime: "2026-05-13T14:00:00",
    status: "Approved",
    location: "Main Lobby",
    riskLevel: "Low",
    notes: "Remote prep materials already shared.",
    timeline: [{ label: "Host approved", time: "2026-05-12T12:05:00", tone: "success" }],
    history: [
      { label: "Visit scheduled", actor: "Ayesha Khan", time: "Today, 12:00 PM" },
      { label: "Pass delivered", actor: "System", time: "Today, 12:05 PM" }
    ]
  }
];

export const activities = [
  {
    id: "act-1",
    label: "Marcus Chen is waiting for approval",
    detail: "Facilities & Security · Contractor access",
    time: "5 min ago",
    tone: "warning"
  },
  {
    id: "act-2",
    label: "Noah Bennet checked in at Main Lobby",
    detail: "Kiosk 2 · QR pass scan",
    time: "28 min ago",
    tone: "success"
  },
  {
    id: "act-3",
    label: "Elena Park pass delivered by email",
    detail: "Admissions · North Wing reception",
    time: "41 min ago",
    tone: "default"
  },
  {
    id: "act-4",
    label: "Hannah Ibrahim checked out",
    detail: "South Lobby · Badge returned",
    time: "1 hr ago",
    tone: "muted"
  }
];

export const staffRows = [
  { name: "Ayesha Khan", role: "Host", department: "Product & Engineering", visitors: 18, status: "Active" },
  { name: "Daniel Mercer", role: "Security Lead", department: "Facilities & Security", visitors: 23, status: "Active" },
  { name: "Maya Rodriguez", role: "Host", department: "People Operations", visitors: 12, status: "Active" },
  { name: "Omar Siddiqui", role: "Host", department: "Finance", visitors: 8, status: "Limited" },
  { name: "Priya Shah", role: "Host", department: "Admissions", visitors: 16, status: "Active" }
];

export const analytics = [
  { label: "Visitors today", value: "148", change: "+12%", tone: "success" },
  { label: "Pending approvals", value: "9", change: "-3", tone: "warning" },
  { label: "Avg. check-in time", value: "42s", change: "8s faster", tone: "success" },
  { label: "Open incidents", value: "2", change: "review", tone: "danger" }
];
