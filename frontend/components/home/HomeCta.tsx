"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function HomeCta() {
  const { user, isLoading } = useAuth();

  const primaryHref = isLoading
    ? "/register"
    : user
      ? user.role === "admin"
        ? "/admin"
        : "/campaigns/new"
      : "/register";
  const primaryLabel =
    user?.role === "admin" ? "Admin Panel" : "Start a Campaign";
  const secondaryHref = "/campaigns";

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href={primaryHref}>
        <Button size="lg" className="w-full sm:w-auto">
          {primaryLabel} <ArrowRight size={16} className="ml-2 inline" />
        </Button>
      </Link>

      <Link href={secondaryHref}>
        <Button size="lg" variant="outline" className="w-full sm:w-auto">
          Browse Campaigns
        </Button>
      </Link>
    </div>
  );
}
