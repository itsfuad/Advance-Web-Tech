/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await api.post("/auth/verify-email", { email, token });
        if (cancelled) return;

        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully.");
        const verifiedUser = res.data?.user;
        if (verifiedUser && user && verifiedUser.email === user.email) {
          updateUser({ ...user, ...verifiedUser });
        }
        if (user) {
          try {
            const profileRes = await api.get("/auth/profile");
            updateUser({ ...user, ...profileRes.data });
          } catch {
            // ignore refresh errors
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;

        setStatus("error");
        setMessage(
          getApiErrorMessage(
            err,
            "Verification failed. The link may be expired.",
          ),
        );
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)]">
            {status === "loading" && (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
            {status === "error" && (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">{message}</p>

          {status !== "loading" && (
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
              <Link
                href="/"
                className="text-sm text-[var(--foreground)] hover:underline"
              >
                Back to Home
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)]">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Email Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Verifying your email address...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
