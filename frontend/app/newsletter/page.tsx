"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NewsletterCta from "@/components/home/NewsletterCta";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

function NewsletterContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get(
          `/users/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
        );
        if (active) {
          setStatus(res.data?.message || "You have been unsubscribed.");
        }
      } catch (err) {
        if (active) {
          setStatus(getApiErrorMessage(err, "Invalid unsubscribe link."));
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Newsletter Preferences</h1>
      {status ? (
        <div className="mb-6 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm">
          {status}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 mb-6">
          Manage your FundRise newsletter subscription.
        </p>
      )}
      {user?.role === "admin" ? (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
          Admin accounts cannot subscribe to the newsletter.
        </div>
      ) : (
        <NewsletterCta />
      )}
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-sm text-neutral-500">Loading…</div>}>
      <NewsletterContent />
    </Suspense>
  );
}
