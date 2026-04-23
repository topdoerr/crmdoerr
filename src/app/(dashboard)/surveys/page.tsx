import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
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
import { SurveyForm } from "./survey-form";

export default async function SurveysPage() {
  const surveys = await prisma.survey.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { datecreated: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <Badge variant="secondary">{surveys.length}</Badge>
        </div>
        <SurveyForm />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No surveys yet.
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="font-medium hover:underline"
                      >
                        {survey.name}
                      </Link>
                    </TableCell>
                    <TableCell>{survey.subject || "—"}</TableCell>
                    <TableCell>{survey._count.questions}</TableCell>
                    <TableCell>
                      {survey.forStaff === 1 ? "Staff" : "Customers"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={survey.active === 1 ? "success" : "secondary"}
                      >
                        {survey.active === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(survey.datecreated)}</TableCell>
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
