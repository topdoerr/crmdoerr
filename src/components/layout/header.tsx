"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const fullName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-paper px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-label" />
          <Input placeholder="Search..." className="pl-9 border-line bg-paper font-mono text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 hover:bg-paper-warm">
          <Bell className="h-5 w-5 text-label" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-paper-warm">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-accent text-paper text-xs font-serif italic">
                {fullName ? getInitials(fullName) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">
              {fullName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
