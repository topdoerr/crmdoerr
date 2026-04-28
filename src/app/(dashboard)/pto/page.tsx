import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestForm } from "./request-form";
import { approveRequest, denyRequest, cancelRequest, ensureBalance } from "./actions";

const currentStaffId = 1;

const statusVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  approved: "success",
  denied: "destructive",
  cancelled: "secondary",
};

export default async function PtoPage() {
  const year = new Date().getFullYear();
  const balance = await ensureBalance(currentStaffId, year);

  const currentStaff = await prisma.staff.findUnique({
    where: { staffid: currentStaffId },
  });
  const isAdmin = currentStaff?.admin === 1;

  const myRequests = await prisma.ptoRequest.findMany({
    where: { staffId: currentStaffId },
    orderBy: { createdAt: "desc" },
  });

  const pendingApprovals = isAdmin
    ? await prisma.ptoRequest.findMany({
        where: { status: "pending", staffId: { not: currentStaffId } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const remaining = balance.allocated - balance.used - balance.pending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Time Off</h1>
        <RequestForm staffId={currentStaffId} />
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.allocated}</div>
            <p className="text-xs text-muted-foreground">days for {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.used}</div>
            <p className="text-xs text-muted-foreground">days taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.pending}</div>
            <p className="text-xs text-muted-foreground">days awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remaining}</div>
            <p className="text-xs text-muted-foreground">days available</p>
          </CardContent>
        </Card>
      </div>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No time off requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                myRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="capitalize">{req.type}</TableCell>
                    <TableCell>
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[req.status] ?? "secondary"}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {req.reason || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {(req.status === "pending" || req.status === "approved") && (
                        <form action={async () => {
                          "use server";
                          await cancelRequest(req.id);
                        }}>
                          <button
                            type="submit"
                            className="text-sm text-destructive hover:underline"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Approvals (Admin only) */}
      {isAdmin && pendingApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.staffId}</TableCell>
                    <TableCell className="capitalize">{req.type}</TableCell>
                    <TableCell>
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {req.reason || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={async () => {
                          "use server";
                          await approveRequest(req.id, currentStaffId);
                        }}>
                          <button
                            type="submit"
                            className="text-sm text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await denyRequest(req.id, currentStaffId, "Denied by admin");
                        }}>
                          <button
                            type="submit"
                            className="text-sm text-destructive hover:underline"
                          >
                            Deny
                          </button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
