'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

const CATEGORIES = ['Technology', 'Health', 'Education', 'Environment', 'Arts', 'Community', 'Business', 'Other'];

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    goalAmount: '',
    deadline: '',
    category: '',
  });

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
    setError('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('goalAmount', form.goalAmount);
    if (form.deadline) formData.append('deadline', form.deadline);
    if (form.category) formData.append('category', form.category);
    if (fileRef.current?.files?.[0]) {
      formData.append('coverImage', fileRef.current.files[0]);
    }

    try {
      const res = await api.post('/campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/campaigns/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign');
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

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Cover Image */}
            <div className="space-y-1.5">
              <Label>Cover Image</Label>
              <div
                className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center cursor-pointer hover:border-black transition-colors relative"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black text-white rounded-full p-1"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-500">Click to upload cover image</p>
                    <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 10MB</p>
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
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell your story — what are you raising funds for?"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
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
                  onChange={(e) => setForm(f => ({ ...f, goalAmount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.deadline}
                  onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Select a category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Launch Campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
