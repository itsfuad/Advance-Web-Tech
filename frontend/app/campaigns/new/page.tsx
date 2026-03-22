"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert, Upload, X, Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";

const CATEGORIES = [
  "Technology",
  "Health",
  "Education",
  "Environment",
  "Arts",
  "Community",
  "Business",
  "Other",
];

export default function NewCampaignPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    deadline: "",
    category: "",
  });

  const emailVerified = Boolean(user?.emailVerified || user?.emailVerifiedAt);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!emailVerified) {
      router.replace(`/profile/${user?.id ?? ""}`);
    }
  }, [emailVerified, isLoading, router, user]);

  if (isLoading || !user || !emailVerified) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setUploadingPreview(false);
    };
    reader.onerror = () => {
      setUploadingPreview(false);
      setError("Failed to preview the selected image");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("goalAmount", form.goalAmount);
    if (form.deadline) formData.append("deadline", form.deadline);
    if (form.category) formData.append("category", form.category);
    if (fileRef.current?.files?.[0]) {
      formData.append("coverImage", fileRef.current.files[0]);
    }

    try {
      const res = await api.post("/campaigns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push(`/campaigns/${res.data.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create campaign"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-neutral-500 mt-1">Share your cause with the world</p>
      </div>

      {!emailVerified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 text-amber-600" size={18} />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Email not verified</p>
              <p className="mt-1 text-sm text-amber-800">
                Verify your email to unlock campaign creation.
              </p>
            </div>
            <Link href={`/profile/${user?.id ?? ""}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              >
                Verify email
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Cover Image</Label>
              <div
                className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center cursor-pointer hover:border-black transition-colors relative"
                onClick={() => fileRef.current?.click()}
              >
                {uploadingPreview ? (
                  <div className="flex h-40 items-center justify-center rounded bg-neutral-50">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                  </div>
                ) : imagePreview ? (
                  <>
                    <div className="relative h-40 w-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover rounded"
                        sizes="100vw"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black text-white rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadingPreview(false);
                        setImagePreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload
                      size={24}
                      className="mx-auto text-neutral-400 mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                placeholder="Give your campaign a clear title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell your story — what are you raising funds for?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
                className="min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="goalAmount">Goal Amount (USD) *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  min="1"
                  placeholder="1000"
                  value={form.goalAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goalAmount: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="Select a category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading || uploadingPreview}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
                disabled={uploadingPreview}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Launching...
                  </span>
                ) : (
                  "Launch Campaign"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
