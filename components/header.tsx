"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export default function Header() {
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
        <div >
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/fpt.png" alt="Logo" className="h-10" /> Token Ban
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {username && (
            <div className="flex items-center gap-2 text-sm">
              <Button variant="outline" className="text-sm py-1.5">
                <User className="h-4 w-4 mr-1" />
                Admin: {username}
              </Button>

              <Button variant="outline" className="text-sm py-1.5" asChild>
                <Link href="/geo">
                  <User className="h-4 w-4 mr-1" />
                  GEO
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {username && (
            <Button
              onClick={() => {
                localStorage.clear();
                useUserStore.setState({ username: "" });
              }}
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline-block">Logout</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
