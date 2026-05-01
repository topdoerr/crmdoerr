import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import { ExpensesHeader } from "./expenses-header";

export default async function ExpensesPage() {
  const [expenses, clients, expenseCategories] = await Promise.all([
    prisma.expense.findMany({
      include: {
        expenseCategoryRel: true,
        expenseClient: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.client.findMany({
      select: { id: true, company: true },
      orderBy: { company: "asc" },
    }),
    prisma.expenseCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount ?? 0),
    0
  );
  const billableTotal = expenses
    .filter((e) => e.billable === 1)
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const nonBillableTotal = totalExpenses - billableTotal;

  return (
    <div className="space-y-6">
      <ExpensesHeader
        count={expenses.length}
        clients={clients}
        expenseCategories={expenseCategories}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billableTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non-billable
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(nonBillableTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Invoice #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No expenses found.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.expenseName || "—"}
                    </TableCell>
                    <TableCell>
                      {expense.expenseCategoryRel?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {expense.amount
                        ? formatCurrency(Number(expense.amount))
                        : "—"}
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>
                      {expense.expenseClient ? (
                        <Link
                          href={`/clients/${expense.expenseClient.id}`}
                          className="text-primary hover:underline"
                        >
                          {expense.expenseClient.company}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.billable === 1 ? (
                        <Badge variant="success">Billable</Badge>
                      ) : (
                        <Badge variant="secondary">Non-billable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.invoiceid ? (
                        <Link
                          href={`/invoices/${expense.invoiceid}`}
                          className="text-primary hover:underline"
                        >
                          #{expense.invoiceid}
                        </Link>
                      ) : (
                        "—"
                      )}
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
