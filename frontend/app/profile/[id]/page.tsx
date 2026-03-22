"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Campaign, PaginatedResponse, PublicUser } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Camera, MailCheck } from "lucide-react";
import { resolveImageUrl, formatDate, getApiErrorMessage } from "@/lib/utils";

const PAGE_LIMIT = 9;

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuth();
  const isSelf = user?.id === id;

  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!id) return;
    setPage(1);
  }, [id]);

  useEffect(() => {
    if (isLoading) return;
    if (isSelf && !user) {
      router.replace("/login");
      return;
    }
    if (isSelf && user) {
      setName(user.name);
    }
  }, [isSelf, user, isLoading, router]);

  useEffect(() => {
    if (!isSelf || !user) return;
    const refresh = async () => {
      try {
        const res = await api.get("/auth/profile");
        updateUser({ ...user, ...res.data });
      } catch {
        // ignore refresh errors
      }
    };
    refresh();
  }, [isSelf, user, updateUser]);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await api.get<PublicUser>(`/users/public/${id}`);
      setProfile(res.data);
    } catch {
      setProfile(null);
      setProfileError("Profile not found");
    } finally {
      setProfileLoading(false);
    }
  }, [id]);

  const fetchCampaigns = useCallback(async () => {
    if (!id) return;
    setCampaignsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Campaign>>(
        `/campaigns/creator/${id}?page=${page}&limit=${PAGE_LIMIT}`,
      );
      setCampaigns(res.data.data);
      setTotal(res.data.total);
    } catch {
      setCampaigns([]);
      setTotal(0);
    } finally {
      setCampaignsLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelf || !user) return;
    setSaving(true);
    setSaveMsg("");
    setSaveError("");

    const formData = new FormData();
    formData.append("name", name);
    if (fileRef.current?.files?.[0]) {
      formData.append("profileImage", fileRef.current.files[0]);
    }

    try {
      const res = await api.patch("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({
        ...user,
        ...res.data,
        profileImage: res.data.profileImage ?? user.profileImage,
      });
      setSaveMsg("Profile updated successfully!");
      setImagePreview(null);
      fetchProfile();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelf) return;
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match");
      return;
    }
    setPwSaving(true);
    setPwMsg("");
    setPwError("");

    try {
      await api.patch("/users/me/password", { currentPassword, newPassword });
      setPwMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(getApiErrorMessage(err, "Failed to change password"));
    } finally {
      setPwSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!isSelf) return;
    setVerifyLoading(true);
    setVerifyMsg("");
    setVerifyError("");
    try {
      const res = await api.post("/auth/resend-verification");
      setVerifyMsg(res.data?.message || "Verification email sent");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to send verification");
      setVerifyError(msg);
      if (msg.toLowerCase().includes("already verified") && user) {
        try {
          const profileRes = await api.get("/auth/profile");
          updateUser({ ...user, ...profileRes.data });
        } catch {
          // ignore refresh errors
        }
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  if (isLoading && isSelf) return null;
  if (!isSelf && profileError)
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-neutral-500">
        {profileError}
      </div>
    );

  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const visiblePages = (() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [];
    const start = Math.max(2, page - 2);
    const end = Math.min(totalPages - 1, page + 2);
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  })();

  const emailVerified = Boolean(user?.emailVerified || user?.emailVerifiedAt);
  const avatarUrl = isSelf
    ? user?.profileImage
      ? resolveImageUrl(user.profileImage)
      : null
    : profile?.profileImage
      ? resolveImageUrl(profile.profileImage)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {profileLoading ? (
        <div className="flex items-center gap-4 mb-10">
          <div className="h-20 w-20 rounded-full bg-neutral-100 animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      ) : profile ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
          <div className="relative h-20 w-20 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-2xl font-bold text-neutral-500">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={profile.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              profile.name[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isSelf ? user?.name : profile.name}
            </h1>
            <p className="text-sm text-neutral-500">
              Member since {formatDate(profile.createdAt)}
            </p>
            {!isSelf && (
              <p className="text-xs text-neutral-400 mt-1">Public profile</p>
            )}
          </div>
          {isSelf && (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {isSelf && user && (
        <>
          {!emailVerified && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-amber-600" size={18} />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">
                    Email not verified
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Verify your email to unlock campaign creation and donations.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  loading={verifyLoading}
                  onClick={handleResendVerification}
                  className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                >
                  <MailCheck size={16} className="mr-2" />
                  Verify email
                </Button>
              </div>
              {verifyMsg && (
                <p className="mt-3 text-sm text-emerald-700">{verifyMsg}</p>
              )}
              {verifyError && (
                <p className="mt-3 text-sm text-red-600">{verifyError}</p>
              )}
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="relative w-20 h-20 rounded-full bg-neutral-200 overflow-hidden">
                      {imagePreview || avatarUrl ? (
                        <Image
                          src={imagePreview || avatarUrl!}
                          alt={user.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized={Boolean(imagePreview)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-500">
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-black text-white rounded-full p-1.5"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera size={12} />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                    <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                      {user.role}
                    </p>
                    {!emailVerified && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-700">
                        <AlertTriangle size={14} />
                        Email not verified
                      </p>
                    )}
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-neutral-50"
                  />
                  <p className="text-xs text-neutral-400">
                    Email cannot be changed
                  </p>
                </div>

                {saveMsg && <p className="text-green-600 text-sm">{saveMsg}</p>}
                {saveError && (
                  <p className="text-red-500 text-sm">{saveError}</p>
                )}

                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {pwMsg && <p className="text-green-600 text-sm">{pwMsg}</p>}
                {pwError && <p className="text-red-500 text-sm">{pwError}</p>}

                <Button type="submit" loading={pwSaving}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <span className="text-sm text-neutral-500">
          {total} campaign{total !== 1 ? "s" : ""}
        </span>
      </div>

      {campaignsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-neutral-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          No campaigns to show
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {visiblePages.map((p, i) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm text-neutral-400"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
