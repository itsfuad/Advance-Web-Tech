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
      ? "/campaigns/new"
      : "/register";
  const secondaryHref = "/campaigns";

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href={primaryHref}>
        <Button
          size="lg"
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] w-full sm:w-auto"
        >
          Start a Campaign <ArrowRight size={16} className="ml-2 inline" />
        </Button>
      </Link>

      <Link href={secondaryHref}>
        <Button
          size="lg"
          variant="outline"
          className="border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] hover:text-[var(--secondary-foreground)] w-full sm:w-auto"
        >
          Browse Campaigns
        </Button>
      </Link>
    </div>
  );
}
