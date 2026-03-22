"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Camera, MailCheck } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setName(user.name);
  }, [user, isLoading, router]);

  const emailVerified = Boolean(user?.emailVerified || user?.emailVerifiedAt);
  const canDeleteAccount = !emailVerified;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        ...user!,
        ...res.data,
        profileImage: res.data.profileImage ?? user?.profileImage,
      });
      setSaveMsg("Profile updated successfully!");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setSaveError(message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setPwError(message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (isLoading || !user) return null;

  const avatarUrl = user.profileImage
    ? resolveImageUrl(user.profileImage)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Manage your account details
        </p>
      </div>

      {!emailVerified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-amber-600" size={18} />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Email not verified</p>
              <p className="mt-1 text-sm text-amber-800">
                Verify your email to unlock campaign creation and donations.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              <MailCheck size={16} className="mr-2" />
              Verify email
            </Button>
          </div>
        </div>
      )}

      {/* Profile card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden">
                  {imagePreview || avatarUrl ? (
                    <img
                      src={imagePreview || avatarUrl!}
                      alt={user.name}
                      className="w-full h-full object-cover"
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
              <Input value={user.email} disabled className="bg-neutral-50" />
              <p className="text-xs text-neutral-400">
                Email cannot be changed
              </p>
            </div>

            {saveMsg && <p className="text-green-600 text-sm">{saveMsg}</p>}
            {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            {pwMsg && <p className="text-green-600 text-sm">{pwMsg}</p>}
            {pwError && <p className="text-red-500 text-sm">{pwError}</p>}

            <Button type="submit" loading={pwSaving}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
