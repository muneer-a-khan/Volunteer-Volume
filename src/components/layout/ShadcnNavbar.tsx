'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, Calendar, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const NAV_LINKS = {
  guest: [
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" }
  ],
  regular: [
    { name: "Shifts Calendar", href: "/shifts" },
    { name: "Log Hours", href: "/log-hours" }
  ],
  admin: [
    { name: "Shifts Calendar", href: "/shifts" },
    { name: "Check-in/Check-out", href: "/check-in" },
    { name: "Admin Dashboard", href: "/admin/dashboard" }
  ]
};

export default function ShadcnNavbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const userRole = session?.user?.role === "ADMIN" || session?.user?.role === "GROUP_ADMIN"
    ? "admin"
    : status === "authenticated"
      ? "regular"
      : "guest";

  const navLinks = NAV_LINKS[userRole as keyof typeof NAV_LINKS];

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">Volunteer Volume</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.name} className="mx-1">
                  <Link href={link.href} legacyBehavior passHref>
                    <Button
                      variant={link.href === window.location.pathname ? "default" : "ghost"}
                      className="rounded-full"
                    >
                      {link.name}
                    </Button>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {status === "authenticated" && session.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/50">
                  {session.user.image ? (
                    <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/shifts")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Shifts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/log-hours")}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Log Hours</span>
                </DropdownMenuItem>
                {userRole === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/admin/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
} 