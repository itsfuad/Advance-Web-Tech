"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const authCtaHref = user ? "/dashboard" : "/register";
  const authCtaLabel = user ? "Dashboard" : "Get Started";

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FUNDRISE</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/campaigns"
              className="text-sm text-neutral-600 hover:text-black transition-colors"
            >
              Browse
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-600 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm text-neutral-600 hover:text-black transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium overflow-hidden">
                    {user.profileImage ? (
                      <img
                        key={user.profileImage}
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000"}${user.profileImage}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
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
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-4 space-y-3">
          <Link
            href="/campaigns"
            className="block text-sm py-2"
            onClick={() => setMenuOpen(false)}
          >
            Browse Campaigns
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block text-sm py-2"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block text-sm py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/profile"
                className="block text-sm py-2"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="block text-sm py-2 text-red-600"
              >
                Sign Out
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
