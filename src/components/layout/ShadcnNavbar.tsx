'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
  pending: [
    { name: "My Application", href: "/my-applications" }
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

interface ShadcnNavbarProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export default function ShadcnNavbar({ isAuthenticated, isAdmin }: ShadcnNavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Use the props if provided, otherwise fall back to the session data
  const isUserAuthenticated = isAuthenticated !== undefined ? isAuthenticated : status === "authenticated";
  const isUserAdmin = isAdmin !== undefined ? isAdmin : (session?.user?.role === "ADMIN" || session?.user?.role === "GROUP_ADMIN");
  const isPending = session?.user?.role === "PENDING";

  let userRole = "guest";
  if (isUserAuthenticated) {
    if (isUserAdmin) {
      userRole = "admin";
    } else if (isPending) {
      userRole = "pending";
    } else {
      userRole = "regular";
    }
  }

  // For debugging purposes
  console.log("User auth status:", {
    isUserAuthenticated,
    status,
    userRole,
    role: session?.user?.role
  });

  const navLinks = NAV_LINKS[userRole as keyof typeof NAV_LINKS];

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://www.visitcharlottesville.org/imager/files_idss_com/C406/images/listings/original_VDM_Logo_Primary-RGB-_600x350_e45adf5f6bc0c5c2a30a39868f44eab6.png"
              alt="Virginia Discovery Museum"
              width={100}
              height={48}
              className="inline-block h-12"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.name} className="mx-1">
                  <Link href={link.href} legacyBehavior passHref>
                    <Button
                      variant={link.href === pathname ? "default" : "ghost"}
                      className="rounded-full"
                    >
                      {link.name}
                    </Button>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {isUserAuthenticated && session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/50 ring-1 ring-gray-300">
                  <AvatarFallback className="bg-indigo-600 text-white font-medium">
                    {session.user.name
                      ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                {/* Only show these options for regular volunteers and admins */}
                {!isPending && (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/shifts")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Shifts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/log-hours")}>
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Log Hours</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Show application link for pending users */}
                {isPending && (
                  <DropdownMenuItem onClick={() => router.push("/my-applications")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Application</span>
                  </DropdownMenuItem>
                )}

                {isUserAdmin && (
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