"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Plus,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";

const mainTabs = [
  { name: "Home", href: "/dashboard" },
  { name: "Clients", href: "/clients" },
  { name: "Leads", href: "/leads" },
  { name: "Projects", href: "/projects" },
  { name: "Tasks", href: "/tasks" },
  { name: "Invoices", href: "/invoices" },
  { name: "Tickets", href: "/tickets" },
  { name: "Estimates", href: "/estimates" },
  { name: "Contracts", href: "/contracts" },
  { name: "Reports", href: "/reports" },
  { name: "Calendar", href: "/calendar" },
];

const moreItems = [
  { name: "Proposals", href: "/proposals" },
  { name: "Expenses", href: "/expenses" },
  { name: "Subscriptions", href: "/subscriptions" },
  { name: "Time Tracking", href: "/timesheets" },
  { name: "Knowledge Base", href: "/knowledge-base" },
  { name: "Documents", href: "/documents" },
  { name: "Staff", href: "/staff" },
  { name: "Goals", href: "/goals" },
  { name: "Surveys", href: "/surveys" },
];

const appSwitcherItems = [
  { name: "News Feed", href: "/feed" },
  { name: "Messages", href: "/messages" },
  { name: "Directory", href: "/directory" },
  { name: "PTO / Leave", href: "/pto" },
  { name: "Meeting Rooms", href: "/rooms" },
  { name: "Onboarding", href: "/onboarding" },
  { name: "Policies", href: "/policies" },
  { name: "Announcements", href: "/announcements" },
  { name: "Settings", href: "/settings" },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const fullName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : "";
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="border-b border-line bg-paper">
      {/* Top bar */}
      <div className="flex h-12 items-center gap-4 px-4">
        {/* App switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded p-1.5 hover:bg-paper-warm">
            <LayoutGrid className="h-5 w-5 text-ink-softer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-label">
              Intranet
            </DropdownMenuLabel>
            {appSwitcherItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-1 mr-2">
          <span className="font-serif text-lg tracking-tight text-ink">TopDoerr</span>
          <span className="text-accent text-lg">.</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-label" />
          <Input
            placeholder="Search..."
            className="h-8 rounded-md border-line bg-paper-warm pl-9 font-mono text-xs"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="rounded p-2 hover:bg-paper-warm">
            <Plus className="h-4 w-4 text-ink-softer" />
          </button>
          <button className="rounded p-2 hover:bg-paper-warm relative">
            <Bell className="h-4 w-4 text-ink-softer" />
          </button>
          <button className="rounded p-2 hover:bg-paper-warm">
            <Settings className="h-4 w-4 text-ink-softer" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-0.5 hover:ring-2 hover:ring-accent/30">
              <Avatar className="h-7 w-7">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-accent text-paper text-[10px] font-serif italic">
                  {fullName ? getInitials(fullName) : "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">{fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings"><User className="mr-2 h-3.5 w-3.5" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-3.5 w-3.5" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 overflow-x-auto">
        {mainTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-accent after:rounded-t"
                  : "text-ink-softer hover:text-ink hover:bg-paper-warm"
              )}
            >
              {tab.name}
            </Link>
          );
        })}

        {/* More dropdown */}
        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium text-ink-softer hover:text-ink hover:bg-paper-warm transition-colors",
              moreItems.some((i) => pathname.startsWith(i.href)) &&
                "text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-accent after:rounded-t relative"
            )}
          >
            More
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    pathname.startsWith(item.href) && "text-accent font-medium"
                  )}
                >
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
