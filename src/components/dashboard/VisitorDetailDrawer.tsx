import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ShieldAlert, UserRound } from "lucide-react";

import { QRCodeDisplay } from "@/components/dashboard/QRCodeDisplay";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { type VisitDetail } from "@/lib/cd-vms";
import { cn, formatTimeLabel, formatVisitWindow } from "@/lib/utils";

type VisitorDetailDrawerProps = {
  activeVisitorAction?: "approve" | "reject" | "check_in" | "check_out" | null;
  activeVisitorId?: string | null;
  loading?: boolean;
  onApprove?: (visitor: VisitDetail) => void;
  onCheckIn?: (visitor: VisitDetail) => void;
  onCheckOut?: (visitor: VisitDetail) => void;
  onOpenChange: (open: boolean) => void;
  onReject?: (visitor: VisitDetail) => void;
  open: boolean;
  visitor: VisitDetail | null;
};

const riskTone = {
  Elevated: "destructive",
  Low: "success",
  Medium: "warning"
} as const;

export function VisitorDetailDrawer({
  activeVisitorAction = null,
  activeVisitorId = null,
  loading = false,
  onApprove,
  onCheckIn,
  onCheckOut,
  onOpenChange,
  onReject,
  open,
  visitor
}: VisitorDetailDrawerProps) {
  const visitorBusy = Boolean(visitor && visitor.id === activeVisitorId);
  const isActionLoading = (action: NonNullable<VisitorDetailDrawerProps["activeVisitorAction"]>) => Boolean(visitor && visitor.id === activeVisitorId && activeVisitorAction === action);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {!visitor ? (
          <DrawerBody>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-muted-foreground">
              {loading ? "Loading visit details..." : "Select a visitor to review details."}
            </div>
          </DrawerBody>
        ) : (
          <>
            <DrawerHeader>
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={visitor.status} />
                  <Badge variant={riskTone[visitor.riskLevel]}>{visitor.riskLevel} risk</Badge>
                  {visitor.passStatus ? <Badge variant={visitor.passStatus === "active" ? "success" : "outline"}>Pass {visitor.passStatus}</Badge> : null}
                </div>
                <DrawerTitle className="mt-3 text-2xl font-bold tracking-normal text-slate-950">{visitor.visitorName}</DrawerTitle>
                <DrawerDescription className="mt-1 text-sm text-muted-foreground">
                  {visitor.organization} · {visitor.referenceCode}
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <DrawerBody>
              <div className="grid gap-5">
                <section>
                  <h3 className="text-sm font-semibold text-slate-950">Visitor information</h3>
                  <div className="mt-3 grid gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={visitor.visitorEmail} />
                    <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={visitor.visitorPhone} />
                    <InfoRow icon={<UserRound className="h-4 w-4" />} label="Host" value={`${visitor.hostName} · ${visitor.departmentName}`} />
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={visitor.location} />
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label="Visit time" value={formatVisitWindow(visitor.scheduledFor)} />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-slate-950">Purpose and notes</h3>
                  <div className="mt-3 rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">{visitor.purpose}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{visitor.notes}</p>
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Pass state</h3>
                    {visitor.passToken ? (
                      <QRCodeDisplay value={visitor.passToken} className="mt-3 max-w-[150px]" />
                    ) : (
                      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-muted-foreground">
                        No pass has been issued yet.
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Visit timeline</h3>
                    <div className="mt-3 space-y-3">
                      {visitor.events.length ? (
                        visitor.events.map((event) => (
                          <div key={event.id} className="flex gap-3">
                            <span
                              className={cn(
                                "mt-1.5 h-2.5 w-2.5 rounded-full",
                                event.type.includes("approved") || event.type.includes("checked") || event.type.includes("pass") ? "bg-emerald-500" : "",
                                event.type.includes("rejected") || event.type.includes("pending") ? "bg-amber-500" : "",
                                !event.type.includes("approved") && !event.type.includes("checked") && !event.type.includes("pass") && !event.type.includes("rejected") && !event.type.includes("pending") ? "bg-slate-300" : ""
                              )}
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeLabel(event.occurredAt)}</p>
                              {event.detail ? <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p> : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No event history is available yet.</p>
                      )}
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-slate-950">Status history</h3>
                  </div>
                  <div className="mt-3 space-y-3">
                    {[...visitor.events].reverse().map((history) => (
                      <div key={`${history.id}-history`} className="rounded-lg border border-border bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{history.title}</p>
                          <span className="text-xs text-muted-foreground">{new Date(history.occurredAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">by {history.actorLabel ?? "System"}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {visitor.status === "Pending" ? (
                  <Button
                    variant="success"
                    onClick={() => onApprove?.(visitor)}
                    loading={isActionLoading("approve")}
                    disabled={visitorBusy && !isActionLoading("approve")}
                  >
                    Approve
                  </Button>
                ) : null}
                {visitor.status === "Pending" || visitor.status === "Approved" ? (
                  <Button
                    variant="outline"
                    onClick={() => onReject?.(visitor)}
                    loading={isActionLoading("reject")}
                    disabled={visitorBusy && !isActionLoading("reject")}
                  >
                    Reject
                  </Button>
                ) : null}
                {visitor.status === "Approved" ? (
                  <Button
                    variant="secondary"
                    onClick={() => onCheckIn?.(visitor)}
                    loading={isActionLoading("check_in")}
                    disabled={visitorBusy && !isActionLoading("check_in")}
                  >
                    Check in
                  </Button>
                ) : null}
                {visitor.status === "Checked In" ? (
                  <Button
                    variant="secondary"
                    onClick={() => onCheckOut?.(visitor)}
                    loading={isActionLoading("check_out")}
                    disabled={visitorBusy && !isActionLoading("check_out")}
                  >
                    Check out
                  </Button>
                ) : null}
                {visitor.passToken ? (
                  <Button asChild variant="outline">
                    <Link to={`/pass?token=${visitor.passToken}`}>Open pass</Link>
                  </Button>
                ) : null}
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[20px_86px_1fr] items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-semibold text-slate-800">{value}</span>
    </div>
  );
}
