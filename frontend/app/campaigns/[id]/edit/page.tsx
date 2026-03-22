"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { Campaign } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { getApiErrorMessage, resolveImageUrl } from "@/lib/utils";

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
export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  useEffect(() => {
    api
      .get(`/campaigns/${id}`)
      .then((res: { data: Campaign }) => {
        const c: Campaign = res.data;
        setForm({
          title: c.title,
          description: c.description,
          goalAmount: String(c.goalAmount),
          deadline: c.deadline
            ? new Date(c.deadline).toISOString().split("T")[0]
            : "",
          category: c.category || "",
        });
        if (c.coverImage) setImagePreview(resolveImageUrl(c.coverImage));
      })
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    if (form.title) formData.append("title", form.title);
    if (form.description) formData.append("description", form.description);
    if (form.goalAmount) formData.append("goalAmount", form.goalAmount);
    if (form.deadline) formData.append("deadline", form.deadline);
    if (form.category) formData.append("category", form.category);
    if (fileRef.current?.files?.[0]) {
      formData.append("coverImage", fileRef.current.files[0]);
    }

    try {
      await api.patch(`/campaigns/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push(`/campaigns/${id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update campaign"));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="h-8 bg-neutral-100 rounded animate-pulse mb-4 w-48" />
        <div className="h-64 bg-neutral-100 rounded animate-pulse" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Campaign</h1>
        <p className="text-neutral-500 mt-1">Update your campaign details</p>
      </div>

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
                {imagePreview ? (
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
                      Click to change cover image
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
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Goal Amount (USD)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.goalAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goalAmount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
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
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
