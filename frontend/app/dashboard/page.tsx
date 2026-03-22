"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { UserStats, Campaign, Donation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatDate,
  getProgressPercentage,
  getApiErrorMessage,
} from "@/lib/utils";
import {
  Plus,
  Target,
  TrendingUp,
  Heart,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (user) {
      api
        .get("/stats/me")
        .then((res) => setStats(res.data))
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      setDeleteId(null);
      const res = await api.get("/stats/me");
      setStats(res.data);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Failed to delete campaign"));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-neutral-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role === "admin") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Welcome back, {user.name}
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Target size={16} />
              <span className="text-xs uppercase tracking-wide">Campaigns</span>
            </div>
            <div className="text-2xl font-bold">
              {stats?.campaignsCreated ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs uppercase tracking-wide">
                Total Raised
              </span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRaised ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Heart size={16} />
              <span className="text-xs uppercase tracking-wide">
                Donations Made
              </span>
            </div>
            <div className="text-2xl font-bold">
              {stats?.donationsMade ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <BarChart3 size={16} />
              <span className="text-xs uppercase tracking-wide">
                Total Donated
              </span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalDonated ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Campaigns */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">My Campaigns</h2>
        {!stats?.campaigns || stats.campaigns.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-lg p-10 text-center">
            <Target size={32} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">No campaigns yet</p>
            <Link href="/campaigns/new">
              <Button className="mt-4" variant="outline">
                Create your first campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.campaigns.map((campaign: Campaign) => (
              <div
                key={campaign.id}
                className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {campaign.title}
                    </Link>
                    <Badge
                      variant={
                        campaign.status === "active"
                          ? "success"
                          : campaign.status === "frozen"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={getProgressPercentage(
                        campaign.raisedAmount,
                        campaign.goalAmount,
                      )}
                      className="h-1.5 w-32"
                    />
                    <span className="text-xs text-neutral-500">
                      {formatCurrency(campaign.raisedAmount)} /{" "}
                      {formatCurrency(campaign.goalAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/campaigns/${campaign.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit size={15} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(campaign.id)}
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Donations */}
      {stats?.recentDonations && stats.recentDonations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Donations</h2>
          <div className="space-y-2">
            {stats.recentDonations.map((donation: Donation) => (
              <div
                key={donation.id}
                className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/campaigns/${donation.campaignId}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {donation.campaign?.title}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatDate(donation.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(donation.amount)}
                  </p>
                  <Badge variant="success" className="text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
