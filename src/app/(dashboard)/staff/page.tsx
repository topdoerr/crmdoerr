import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffForm } from "./staff-form";

export default async function StaffPage() {
  const staffList = await prisma.staff.findMany({
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <Badge variant="secondary">{staffList.length}</Badge>
        </div>
        <StaffForm />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No staff found.
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((staff) => (
                  <TableRow key={staff.staffid}>
                    <TableCell>
                      <Link
                        href={`/staff/${staff.staffid}`}
                        className="font-medium hover:underline"
                      >
                        {staff.firstName} {staff.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phonenumber || "—"}</TableCell>
                    <TableCell>
                      {staff.admin === 1 ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={staff.active === 1 ? "success" : "secondary"}
                      >
                        {staff.active === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/staff/${staff.staffid}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
