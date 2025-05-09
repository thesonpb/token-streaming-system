"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Play, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export default function Header() {
  const pathname = usePathname();
  const { username } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Icon (left-aligned) */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/fpt.png" alt="Logo" className="h-10" />
          <span className="hidden sm:inline-block">Token Ban Stream</span>
        </Link>

        {/* Streaming player indicator/controls (center) */}
        <div className="flex items-center gap-2">
          {pathname === "/player" && (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full text-sm">
              <Play className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline-block">Streaming Active</span>
            </div>
          )}
        </div>

        {/* Token ban management navigation (right-aligned) */}
        <div className="flex items-center gap-4">
          {pathname !== "/management" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/management">
                <ShieldAlert className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline-block">Management</span>
              </Link>
            </Button>
          )}

          {/* Username display (far right) */}
          {username && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{username}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
