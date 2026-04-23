import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExpensesPie,
  ExpensesTrend,
} from "@/components/reports/expenses-charts";

export default async function ExpensesReportPage() {
  const expenses = await prisma.expense.findMany({
    include: { expenseCategoryRel: true },
    orderBy: { date: "asc" },
  });

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const catMap = new Map<string, number>();
  for (const e of expenses) {
    const name = e.expenseCategoryRel?.name ?? "Uncategorized";
    catMap.set(name, (catMap.get(name) ?? 0) + Number(e.amount));
  }
  const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const monthMap = new Map<string, number>();
  for (const e of expenses) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(e.amount));
  }
  const trend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totalVal]) => ({ month, total: totalVal }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Expenses Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categoryData.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ExpensesPie data={categoryData} />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No data
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <ExpensesTrend data={trend} />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
