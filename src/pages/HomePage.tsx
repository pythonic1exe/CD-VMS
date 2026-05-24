import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ClipboardList,
  DoorOpen,
  FileLock2,
  QrCode,
  ShieldCheck,
  UsersRound
} from "lucide-react";

import heroImage from "@/assets/office-lobby-hero.png";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Digital Registration",
    description: "Pre-register guests, capture required details, and keep arrival records consistent across every entrance.",
    icon: ClipboardList
  },
  {
    title: "QR Entry",
    description: "Issue scannable visitor passes that speed up reception while preserving the audit trail security teams need.",
    icon: QrCode
  },
  {
    title: "Host Approval",
    description: "Route visit requests to the right employee with clear approve, reject, and message actions.",
    icon: BadgeCheck
  },
  {
    title: "Visitor Tracking",
    description: "Monitor who is expected, on-site, overdue, or checked out from a live operations view.",
    icon: UsersRound
  },
  {
    title: "Secure Logs",
    description: "Maintain searchable visit history, status changes, and policy notes for compliance reviews.",
    icon: FileLock2
  }
];

const stats = [
  { value: "42s", label: "average check-in" },
  { value: "99.9%", label: "cloud availability target" },
  { value: "12k+", label: "visits logged monthly" },
  { value: "4.8/5", label: "host satisfaction" }
];

const workflow = [
  {
    title: "Register",
    detail: "Visitors submit details from mobile or reception kiosk.",
    icon: CalendarCheck2
  },
  {
    title: "Approve",
    detail: "Hosts and security teams get the right context before entry.",
    icon: CheckCircle2
  },
  {
    title: "Check in",
    detail: "QR passes create fast, auditable lobby movement.",
    icon: DoorOpen
  },
  {
    title: "Monitor",
    detail: "Dashboards keep teams aligned on traffic, risk, and history.",
    icon: ShieldCheck
  }
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10">
          <Navbar variant="transparent" />
          <div className="container flex min-h-[76vh] items-center py-16 sm:min-h-[74vh]">
            <div className="max-w-3xl animate-fade-up">
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Cloud-integrated visitor operations</Badge>
              <h1 className="mt-6 max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                CD-VMS
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
                A calm, secure visitor management platform for offices, campuses, coworking spaces, and facilities that need faster arrivals and better oversight.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Register Visitor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/25 bg-white/10 text-white hover:bg-white/15">
                  <Link to="/login">Staff Login</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/72">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Role-aware dashboards
                </span>
                <span className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-blue-200" />
                  QR visitor passes
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-200" />
                  Live lobby status
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-border bg-slate-50 py-16 sm:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-normal text-primary">Platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Built for the real rhythm of a front desk.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              CD-VMS gives reception, hosts, and security a shared operating picture without turning the lobby into a complicated workflow.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-soft">
                <CardContent className="p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container">
          <div className="grid gap-3 rounded-xl border border-border bg-slate-950 p-4 text-white shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="text-3xl font-extrabold tracking-normal">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-white/62">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-slate-50 py-16 sm:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-primary">Workflow</p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">From invitation to checkout, every handoff is visible.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The experience stays simple for visitors while operations teams keep clean records, faster decisions, and fewer lobby bottlenecks.
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/admin">View Admin Dashboard</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workflow.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-border bg-white p-5 shadow-line">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-primary">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white py-10">
        <div className="container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-extrabold text-slate-950">CD-VMS</p>
            <p className="mt-1 text-sm text-muted-foreground">Cloud-integrated visitor management for modern facilities.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">
            <Link to="/register" className="hover:text-primary">
              Register Visitor
            </Link>
            <Link to="/host" className="hover:text-primary">
              Host Dashboard
            </Link>
            <Link to="/admin" className="hover:text-primary">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
