import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsPie, LeadsBar } from "@/components/reports/leads-charts";

export default async function LeadsReportPage() {
  const [leads, statuses, sources] = await Promise.all([
    prisma.lead.findMany({ include: { leadStatus: true, leadSource: true } }),
    prisma.leadStatus.findMany(),
    prisma.leadSource.findMany(),
  ]);

  const total = leads.length;
  const converted = leads.filter((l) => l.clientId !== null).length;
  const lost = leads.filter((l) => l.lost === 1).length;
  const junk = leads.filter((l) => l.junk === 1).length;
  const active = total - converted - lost - junk;

  const funnel = [
    { name: "Total Leads", value: total },
    { name: "Active", value: Math.max(active, 0) },
    { name: "Converted", value: converted },
    { name: "Lost", value: lost },
  ];

  const statusMap = new Map<string, number>();
  for (const l of leads) {
    const name = l.leadStatus?.name ?? "Unknown";
    statusMap.set(name, (statusMap.get(name) ?? 0) + 1);
  }
  const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const sourceMap = new Map<string, number>();
  for (const l of leads) {
    const name = l.leadSource?.name ?? "Unknown";
    sourceMap.set(name, (sourceMap.get(name) ?? 0) + 1);
  }
  const sourceData = Array.from(sourceMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leads Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lost}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsBar data={funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <LeadsPie data={sourceData} />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No data
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <LeadsBar data={statusData} />
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
