import { Badge } from "@/components/ui/badge";
import { type VisitorStatus } from "@/lib/cd-vms";

const statusMap: Record<VisitorStatus, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  Pending: "warning",
  Approved: "default",
  "Checked In": "success",
  "Checked Out": "secondary",
  Rejected: "destructive",
  Expired: "outline"
};

export function StatusBadge({ status }: { status: VisitorStatus }) {
  return <Badge variant={statusMap[status]}>{status}</Badge>;
}
