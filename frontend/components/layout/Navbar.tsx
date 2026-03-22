"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const authCtaHref = user
    ? user.role === "admin"
      ? "/admin"
      : "/campaigns/new"
    : "/register";
  const authCtaLabel = user
    ? user.role === "admin"
      ? "Admin Panel"
      : "Start Campaign"
    : "Get Started";
  const emailVerified = Boolean(user?.emailVerified || user?.emailVerifiedAt);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FUNDRISE</span>
          </Link>

          <div className="hidden md:flex items-center gap-6" />

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 bg-transparent shadow-none transition-colors hover:bg-[var(--secondary-hover)] ${
                    emailVerified
                      ? "border-sky-200 text-sky-700"
                      : "border-amber-200 text-amber-700"
                  }`}
                  aria-label="Open account menu"
                >
                  {user.profileImage ? (
                    <Image
                      key={user.profileImage}
                      src={resolveImageUrl(user.profileImage)}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-[var(--foreground)]">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] shadow-lg">
                    <div
                      className={`border-b px-4 py-4 ${emailVerified ? "border-sky-200" : "border-amber-200"}`}
                    >
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {user.email}
                      </p>
                      {!emailVerified ? (
                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setAccountOpen(false)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:underline"
                        >
                          <TriangleAlert size={14} />
                          Verify email
                        </Link>
                      ) : (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={14} />
                          Email verified
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--secondary-hover)]"
                    >
                      <Settings size={16} />
                      Account Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--secondary-hover)]"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[var(--secondary-hover)]"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href={authCtaHref}>
                  <Button size="sm">{authCtaLabel}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--secondary)] border-t border-[var(--border)] px-4 py-4 space-y-3">
          <Link
            href="/campaigns"
            className="block text-sm py-2"
            onClick={() => setMenuOpen(false)}
          >
            Browse Campaigns
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block text-sm py-2 text-[var(--foreground)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href={`/profile/${user.id}`}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  emailVerified
                    ? "text-sky-700 hover:bg-sky-50"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {emailVerified ? (
                  <Settings size={16} />
                ) : (
                  <TriangleAlert size={16} />
                )}
                Account Settings
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary-hover)]"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 py-2 text-sm text-left text-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-sm py-2"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={authCtaHref}
                className="block text-sm py-2 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {authCtaLabel}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
