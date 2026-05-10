"use client";

import { Moon, Sun, LogOut, LayoutDashboard, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Wordmark } from "../brand/GhostLogo";
import { Button } from "../ui/button";
import { useTheme } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const nav = [
  { href: "/companies", label: "Companies" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const go = (path: string) => router.push(path);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === n.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                
                <DropdownMenuItem onClick={() => go("/dashboard")}>
                  <LayoutDashboard size={14} className="mr-2" />
                  Dashboard
                </DropdownMenuItem>

                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => go("/admin")}>
                    <Shield size={14} className="mr-2" />
                    Admin
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    go("/");
                  }}
                >
                  <LogOut size={14} className="mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <div className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-md px-3 py-1.5 text-sm ${
              pathname === n.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            {n.label}
          </Link>
        ))}

        <span className="ml-auto text-xs text-muted-foreground/60">
          {pathname}
        </span>
      </div>
    </header>
  );
}