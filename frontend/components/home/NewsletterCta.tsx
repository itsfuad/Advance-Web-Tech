"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";

interface NewsletterCtaProps {
  className?: string;
}

export default function NewsletterCta({ className }: NewsletterCtaProps) {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isSubscribed = Boolean(user?.newsletterSubscribed);
  const isAdmin = user?.role === "admin";

  const onClick = async () => {
    if (!user) {
      router.push("/login?next=/newsletter");
      return;
    }
    if (isAdmin) {
      setMessage("Admin accounts cannot subscribe to the newsletter.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (isSubscribed) {
        const res = await api.post("/users/newsletter/unsubscribe");
        updateUser({ ...user, newsletterSubscribed: false });
        setMessage(res.data?.message || "Unsubscribed from newsletter.");
      } else {
        const res = await api.post("/users/newsletter/subscribe");
        updateUser({ ...user, newsletterSubscribed: true });
        setMessage(res.data?.message || "Subscribed to newsletter.");
      }
    } catch (err) {
      setMessage(getApiErrorMessage(err, "Could not update subscription"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        className="w-full md:w-auto bg-(--primary) text-(--on-primary-fixed) px-10 py-4 rounded-xl font-bold hover:bg-(--primary-hover) transition-all cursor-pointer"
        onClick={onClick}
        loading={loading}
        disabled={isAdmin}
      >
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </Button>
      {message ? <p className="text-xs text-neutral-500 mt-2">{message}</p> : null}
    </div>
  );
}
