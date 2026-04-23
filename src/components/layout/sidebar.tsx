"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  CheckSquare,
  Target,
  Ticket,
  Calculator,
  FileSignature,
  ScrollText,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  BookOpen,
  UserCog,
  BarChart3,
  Megaphone,
  Trophy,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Leads", href: "/leads", icon: Target },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Time Tracking", href: "/timesheets", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Estimates", href: "/estimates", icon: Calculator },
  { name: "Proposals", href: "/proposals", icon: FileSignature },
  { name: "Contracts", href: "/contracts", icon: ScrollText },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Goals", href: "/goals", icon: Trophy },
  { name: "Surveys", href: "/surveys", icon: ClipboardList },
  { name: "Staff", href: "/staff", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white text-sm font-bold">
              C
            </div>
            <span className="text-lg font-semibold">CRM Doerr</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-forest-600 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
