"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z
  .object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;
const RESEND_OTP_SECONDS = 60;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(RESEND_OTP_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const emailValue = watch("email");

  const startResendCountdown = () => {
    setResendRemaining(RESEND_OTP_SECONDS);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    if (!emailValue) {
      setError("Please enter your email to resend the OTP");
      return;
    }
    setResendLoading(true);
    setResendMsg("");
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: emailValue });
      setResendMsg("A new OTP has been sent to your email.");
      startResendCountdown();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (resendRemaining <= 0) return;
    const timer = setInterval(() => {
      setResendRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendRemaining]);

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await api.post("/auth/reset-password", {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password"));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Password Reset!
            </CardTitle>
            <CardDescription>
              Your password has been reset. Redirecting to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Enter your OTP</CardTitle>
          <CardDescription>
            Check your email for the 6-digit verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {resendMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">
                {resendMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                placeholder="123456"
                maxLength={6}
                {...register("otp")}
                className="text-center text-2xl tracking-widest"
              />
              {errors.otp && (
                <p className="text-red-500 text-xs">{errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Min. 8 characters"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Reset Password
            </Button>
            <div className="text-center text-sm text-neutral-500">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendRemaining > 0 || resendLoading}
                className="font-medium text-black hover:underline disabled:text-neutral-400 disabled:no-underline"
              >
                {resendRemaining > 0
                  ? `Resend OTP in ${formatCountdown(resendRemaining)}`
                  : resendLoading
                    ? "Sending OTP..."
                    : "Resend OTP"}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-neutral-500 mt-6">
            <Link href="/forgot-password" className="hover:underline">
              Resend OTP
            </Link>
            {" · "}
            <Link href="/login" className="hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
