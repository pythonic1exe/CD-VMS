import QRCode from "qrcode";
import { CalendarClock, Download, Printer, ShieldCheck } from "lucide-react";

import { QRCodeDisplay } from "@/components/dashboard/QRCodeDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVisitWindow } from "@/lib/utils";

export type PassCardData = {
  departmentName: string;
  hostName: string;
  passToken?: string;
  referenceCode?: string;
  scheduledFor: string;
  visitorName: string;
  visitorOrganization: string;
};

type QRCardProps = {
  visitor: PassCardData;
  compact?: boolean;
  isPreview?: boolean;
  showActions?: boolean;
};

function getQrValue(visitor: PassCardData, isPreview: boolean) {
  if (visitor.passToken) {
    return visitor.passToken;
  }

  return JSON.stringify({
    departmentName: visitor.departmentName,
    hostName: visitor.hostName,
    preview: isPreview,
    referenceCode: visitor.referenceCode ?? "preview",
    scheduledFor: visitor.scheduledFor,
    visitorName: visitor.visitorName
  });
}

export function QRCard({ visitor, compact = false, showActions = true, isPreview = false }: QRCardProps) {
  const qrValue = getQrValue(visitor, isPreview);

  async function handleDownload() {
    const dataUrl = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 8,
      width: 512
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${visitor.referenceCode ?? "cd-vms-pass"}-qr.png`;
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-white">
      <div className="border-b border-border bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-white/60">CD-VMS Visitor Pass</p>
              <p className="text-sm font-semibold">Main Campus Access</p>
            </div>
          </div>
          <Badge variant={isPreview ? "outline" : "success"}>{isPreview ? "Pending approval" : "Valid"}</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <div className={compact ? "grid gap-4" : "grid gap-5 sm:grid-cols-[auto_1fr]"}>
          <div className="mx-auto sm:mx-0">
            <QRCodeDisplay value={qrValue} className={compact ? "max-w-[150px]" : "max-w-[176px]"} />
          </div>
          <div className="min-w-0 space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-normal text-slate-950">{visitor.visitorName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{visitor.visitorOrganization}</p>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <span className="text-muted-foreground">Host</span>
                <span className="font-semibold text-slate-800">{visitor.hostName}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <span className="text-muted-foreground">Department</span>
                <span className="font-semibold text-slate-800">{visitor.departmentName}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <span className="text-muted-foreground">Visit time</span>
                <span className="font-semibold text-slate-800">{formatVisitWindow(visitor.scheduledFor)}</span>
              </div>
              {visitor.referenceCode ? (
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-semibold text-slate-800">{visitor.referenceCode}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          <div className="flex gap-2">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isPreview
                ? "This preview is for layout only. The real pass is issued only after host approval."
                : "Present this QR code at reception. Access is valid only for the scheduled host and visit window."}
            </span>
          </div>
        </div>
        {showActions ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => void handleDownload()}>
              <Download className="h-4 w-4" />
              Download QR
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
