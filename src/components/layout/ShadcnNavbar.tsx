'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function ShadcnNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, signIn, signOut, user, isLoading } = useAuth();

  // Define navigation links based on authentication status
  const getNavLinks = () => {
    // Everyone can see these links
    const publicLinks = [
      { name: "Home", href: "/" },
    ];

    // Only authenticated users can see these links
    const authLinks = [
      { name: "Shifts Calendar", href: "/shifts" },
      { name: "Log Hours", href: "/log-hours" },
      { name: "Check-in/Check-out", href: "/check-in" },
    ];

    // Only admins can see these links
    const adminLinks = [
      { name: "Admin Dashboard", href: "/admin/dashboard" }
    ];

    if (isLoading) {
      return publicLinks;
    }

    if (isAuthenticated) {
      return isAdmin 
        ? [...publicLinks, ...authLinks, ...adminLinks] 
        : [...publicLinks, ...authLinks];
    }

    return publicLinks;
  };

  const navLinks = getNavLinks();

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
          
          {!isLoading && (
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={() => isAuthenticated ? signOut() : signIn()}
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 