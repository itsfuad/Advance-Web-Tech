"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Campaign } from "@/types";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import { CATEGORY_NAMES } from "@/lib/categories";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 6;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const res = await api.get(`/campaigns?${params}`);
      setCampaigns(res.data.data);
      setTotal(res.data.total);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  const totalPages = Math.ceil(total / limit);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Campaigns</h1>
        <p className="text-neutral-500">Discover causes worth supporting</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" size="md">
            Search
          </Button>
        </form>
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
          placeholder="All Categories"
        >
          {CATEGORY_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-neutral-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 text-lg">No campaigns found</p>
          <p className="text-neutral-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">
            {total} campaign{total !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {/* Pagination */}
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
