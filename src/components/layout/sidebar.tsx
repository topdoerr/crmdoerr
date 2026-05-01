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
  Mail,
  Newspaper,
  Palmtree,
  FolderOpen,
  ListChecks,
  Shield,
  DoorOpen,
  Contact,
} from "lucide-react";
import { useState } from "react";

interface NavSection {
  label: string;
  items: { name: string; href: string; icon: any }[];
}

const sections: NavSection[] = [
  {
    label: "Intranet",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "News Feed", href: "/feed", icon: Newspaper },
      { name: "Messages", href: "/messages", icon: Mail },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Directory", href: "/directory", icon: Contact },
      { name: "Documents", href: "/documents", icon: FolderOpen },
      { name: "PTO / Leave", href: "/pto", icon: Palmtree },
      { name: "Meeting Rooms", href: "/rooms", icon: DoorOpen },
      { name: "Onboarding", href: "/onboarding", icon: ListChecks },
      { name: "Policies", href: "/policies", icon: Shield },
      { name: "Announcements", href: "/announcements", icon: Megaphone },
      { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Clients", href: "/clients", icon: Users },
      { name: "Leads", href: "/leads", icon: Target },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
      { name: "Time Tracking", href: "/timesheets", icon: Clock },
      { name: "Tickets", href: "/tickets", icon: Ticket },
      { name: "Estimates", href: "/estimates", icon: Calculator },
      { name: "Proposals", href: "/proposals", icon: FileSignature },
      { name: "Contracts", href: "/contracts", icon: ScrollText },
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
      { name: "Expenses", href: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Goals", href: "/goals", icon: Trophy },
      { name: "Surveys", href: "/surveys", icon: ClipboardList },
      { name: "Staff", href: "/staff", icon: UserCog },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border-soft bg-forest-600 text-cream transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-forest-500 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber text-white text-sm font-bold">
              T
            </div>
            <span className="text-lg font-semibold text-cream">TopDoerr</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-forest-500 text-cream"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber text-white"
                        : "text-cream/70 hover:bg-forest-500 hover:text-cream"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
