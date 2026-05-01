import { TopNav } from "@/components/layout/top-nav";
import { Providers } from "@/components/layout/providers";
import { AiChat } from "@/components/ai/ai-chat";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-paper p-6">
          {children}
        </main>
        <AiChat />
      </div>
    </Providers>
  );
}
