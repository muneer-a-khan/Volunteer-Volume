'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "../ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Standardized Navigation Item Type
interface NavItem {
  href: string;
  label: string;
}

// Define navigation items using the standard type
const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/shifts", label: "Shifts" },
  { href: "/groups", label: "Groups" },
  // { href: "/log-hours", label: "Log Hours" }, // Log Hours link is removed/commented out
  { href: "/profile", label: "Profile" },
];

const adminNavItems: NavItem[] = [
  // Standardize admin items
  { href: "/admin/dashboard", label: "Admin Dashboard" }, 
  { href: "/admin/volunteers", label: "Manage Volunteers" },
  { href: "/admin/shifts", label: "Manage Shifts" },
  { href: "/admin/groups", label: "Manage Groups" },
  { href: "/admin/reports", label: "Reports" },
];

export default function ShadcnNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, signIn, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Combine nav items, but exclude Dashboard for admins
  const navItems: NavItem[] = isAdmin 
    ? [
        // Filter out the regular dashboard for admins
        ...mainNavItems.filter(item => item.href !== "/dashboard"),
        ...adminNavItems
      ] 
    : mainNavItems;

  const handleSignOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
  };

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
              {navItems.map((link) => (
                <NavigationMenuItem key={link.href} className="mx-1">
                  <Link href={link.href} legacyBehavior passHref>
                    <Button
                      variant={link.href === pathname ? "default" : "ghost"}
                      className="rounded-full"
                    >
                      {link.label}
                    </Button>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          {!isLoading && (
            <Button 
              variant={isAuthenticated ? "outline" : "default"}
              className={`rounded-full px-4 py-2 ${isAuthenticated ? '' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
              onClick={() => isAuthenticated ? handleSignOut() : signIn()}
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navItems.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t mt-auto">
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : isAuthenticated ? (
                    <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                      Sign Out
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => { signIn(); setIsMobileMenuOpen(false); }}>Sign In</Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
} 