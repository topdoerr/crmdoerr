import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SalesRevenueBar,
  SalesCountLine,
} from "@/components/reports/sales-charts";

export default async function SalesReportPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { date: "asc" },
  });

  // Group by YYYY-MM
  const map = new Map<string, { revenue: number; count: number }>();
  for (const inv of invoices) {
    const d = new Date(inv.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key) ?? { revenue: 0, count: 0 };
    entry.revenue += Number(inv.total);
    entry.count += 1;
    map.set(key, entry);
  }
  const data = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));

  const totalRevenue = invoices.reduce((s, i) => s + Number(i.total), 0);
  const avgInvoice =
    invoices.length > 0 ? totalRevenue / invoices.length : 0;

  // Top client by revenue
  const clientTotals = new Map<string, number>();
  for (const inv of invoices) {
    const name = inv.client?.company ?? "Unknown";
    clientTotals.set(name, (clientTotals.get(name) ?? 0) + Number(inv.total));
  }
  let topClient = "—";
  let topRevenue = 0;
  for (const [name, rev] of clientTotals) {
    if (rev > topRevenue) {
      topRevenue = rev;
      topClient = name;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Average Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(avgInvoice)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Top Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{topClient}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(topRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesRevenueBar data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Invoice Count</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesCountLine data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
