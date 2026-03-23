"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { PlatformStats, Campaign, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Snowflake,
  Play,
  Ban,
  UserCheck,
} from "lucide-react";

type Tab = "overview" | "campaigns" | "users" | "reported";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reported, setReported] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignPage, setCampaignPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [reportedTotal, setReportedTotal] = useState(0);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [reportedLoading, setReportedLoading] = useState(false);

  const CAMPAIGN_LIMIT = 8;
  const USER_LIMIT = 8;
  const REPORTED_LIMIT = 8;

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await api.get("/stats/platform");
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(campaignPage),
        limit: String(CAMPAIGN_LIMIT),
      });
      if (campaignSearch.trim()) {
        params.set("search", campaignSearch.trim());
      }
      const res = await api.get(`/campaigns/admin/all?${params.toString()}`);
      setCampaigns(res.data.data);
      setCampaignTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignsLoading(false);
    }
  }, [campaignPage, campaignSearch]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(userPage),
        limit: String(USER_LIMIT),
      });
      if (userSearch.trim()) {
        params.set("search", userSearch.trim());
      }
      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.data);
      setUserTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch]);

  const loadReported = useCallback(async () => {
    setReportedLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(reportedPage),
        limit: String(REPORTED_LIMIT),
      });
      const res = await api.get(
        `/campaigns/admin/reported?${params.toString()}`,
      );
      setReported(res.data.data);
      setReportedTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setReportedLoading(false);
    }
  }, [reportedPage]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user?.role === "admin") {
      loadStats();
    }
  }, [user, isLoading, router, loadStats]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCampaigns();
    }
  }, [user, loadCampaigns]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user, loadUsers]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadReported();
    }
  }, [user, loadReported]);

  const handleFreeze = async (id: string) => {
    await api.patch(`/campaigns/${id}/freeze`);
    setCampaigns((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "frozen" } : c)),
    );
    setReported((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "frozen" } : c)),
    );
  };

  const handleUnfreeze = async (id: string) => {
    await api.patch(`/campaigns/${id}/unfreeze`);
    setCampaigns((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "active" } : c)),
    );
    setReported((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "active" } : c)),
    );
  };

  const handleUserStatus = async (id: string, status: User["status"]) => {
    await api.patch(`/users/${id}/status`, { status });
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  const handleDismissReport = async (id: string) => {
    await api.patch(`/campaigns/${id}/dismiss-report`);
    setReported((cs) => cs.filter((c) => c.id !== id));
    setReportedTotal((total) => Math.max(0, total - 1));
    setCampaigns((cs) =>
      cs.map((c) => (c.id === id ? { ...c, reported: false } : c)),
    );
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-neutral-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "campaigns", label: `Campaigns (${campaignTotal})` },
    { id: "users", label: `Users (${userTotal})` },
    { id: "reported", label: `Reported (${reportedTotal})` },
  ];

  const renderPagination = (
    page: number,
    total: number,
    limit: number,
    onPageChange: (nextPage: number) => void,
  ) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 1) return null;
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      const start = Math.max(2, page - 2);
      const end = Math.min(totalPages - 1, page + 2);
      pages.push(1);
      if (start > 2) pages.push("ellipsis");
      for (let p = start; p <= end; p += 1) pages.push(p);
      if (end < totalPages - 1) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {pages.map((p, index) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-neutral-500 text-sm">
          Platform management dashboard
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Users size={16} />
                  <span className="text-xs uppercase">Users</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Target size={16} />
                  <span className="text-xs uppercase">Campaigns</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                <p className="text-xs text-neutral-400">
                  {stats.activeCampaigns} active · {stats.frozenCampaigns}{" "}
                  frozen
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-xs uppercase">Total Raised</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRaised)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <AlertTriangle size={16} />
                  <span className="text-xs uppercase">Reported</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.reportedCampaigns}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center py-2 border-b border-neutral-100"
                    >
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="text-sm hover:underline truncate max-w-50"
                      >
                        {c.title}
                      </Link>
                      <span className="text-sm font-medium">
                        {formatCurrency(c.raisedAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentDonations.map((d) => (
                    <div
                      key={d.id}
                      className="flex justify-between items-center py-2 border-b border-neutral-100"
                    >
                      <div>
                        <p className="text-sm">{d.donor?.name}</p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>Active</span>
                    <span>{stats.activeCampaigns}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${
                          stats.totalCampaigns
                            ? (stats.activeCampaigns / stats.totalCampaigns) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>Frozen</span>
                    <span>{stats.frozenCampaigns}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${
                          stats.totalCampaigns
                            ? (stats.frozenCampaigns / stats.totalCampaigns) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>Reported</span>
                    <span>{stats.reportedCampaigns}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${
                          stats.totalCampaigns
                            ? (stats.reportedCampaigns / stats.totalCampaigns) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Donation Flow</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentDonations.length === 0 ? (
                  <div className="py-6 text-center text-sm text-neutral-500">No donation data available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Bar chart */}
                    {(() => {
                      const donations = stats.recentDonations;
                      const max = Math.max(...donations.map((r) => r.amount), 1);
                      return (
                        <div className="flex flex-col items-center h-36">
                          <div className="text-xs text-neutral-500 mb-2">Recent donations (bar)</div>
                          <div className="flex items-end gap-2 h-full w-full">
                            {donations.map((d) => {
                              const hPct = Math.max(6, (d.amount / max) * 100);
                              return (
                                <div key={d.id} className="flex-1 flex flex-col items-center">
                                  <div className="w-11/12 bg-emerald-500 rounded-t transition-all" style={{ height: `${hPct}%` }} />
                                  <div className="text-xs text-center mt-2 text-neutral-600 truncate w-full">{formatCurrency(d.amount)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pie chart (donor distribution) */}
                    {(() => {
                      const donations = stats.recentDonations;
                      const byDonor: Record<string, number> = {};
                      donations.forEach((d) => {
                        const name = d.donor?.name || 'Anonymous';
                        byDonor[name] = (byDonor[name] || 0) + d.amount;
                      });
                      const entries = Object.entries(byDonor).sort((a, b) => b[1] - a[1]);
                      const total = entries.reduce((s, e) => s + e[1], 0) || 1;
                      const radius = 36;
                      const circumference = 2 * Math.PI * radius;
                      let offset = 0;
                      return (
                        <div className="flex flex-col items-center h-36 justify-center">
                          <div className="text-xs text-neutral-500 mb-2">Donor distribution (pie)</div>
                          <svg width="80" height="80" viewBox="-50 -50 100 100" className="mx-auto">
                            {/* background ring */}
                            <circle r={radius} cx={0} cy={0} fill="transparent" stroke="#f3f4f6" strokeWidth={18} />
                            {entries.map(([name, value], i) => {
                              const portion = value / total;
                              const dash = portion * circumference;
                              const strokeDasharray = `${dash} ${circumference - dash}`;
                              const colorClasses = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                              const color = colorClasses[i % colorClasses.length];
                              const start = offset;
                              const dashoffset = -start * circumference;
                              offset += portion;
                              return (
                                <circle key={name} r={radius} cx={0} cy={0} fill="transparent" stroke={color} strokeWidth={18} strokeDasharray={strokeDasharray} strokeDashoffset={dashoffset} />
                              );
                            })}
                          </svg>
                          <div className="mt-2 text-xs text-neutral-600 text-center max-w-30">
                            {entries.slice(0, 3).map(([name, value]) => (
                              <div key={name} className="truncate">
                                <span className="font-medium">{name}</span>: {formatCurrency(value)}
                              </div>
                            ))}
                            {entries.length > 3 && <div className="text-xs text-neutral-400">and {entries.length - 3} more</div>}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Curve chart (cumulative) */}
                    {(() => {
                      const donations = [...stats.recentDonations].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                      const cum: number[] = [];
                      let sum = 0;
                      donations.forEach((d) => {
                        sum += d.amount;
                        cum.push(sum);
                      });
                      const maxCum = Math.max(...cum, 1);
                      const w = 200;
                      const h = 80;
                      const pointsArr = cum.map((c, i) => {
                        const x = (i / Math.max(1, cum.length - 1)) * w;
                        const y = h - (c / maxCum) * h;
                        return `${x},${y}`;
                      });
                      const points = pointsArr.join(' ');
                      const areaPoints = pointsArr.length ? pointsArr.join(' ') + ` ${w},${h} 0,${h}` : '';
                      return (
                        <div className="flex flex-col h-36">
                          <div className="text-xs text-neutral-500 mb-2">Cumulative donations (curve)</div>
                          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full flex-1">
                            {pointsArr.length > 0 && (
                              <>
                                <polygon points={areaPoints} fill="rgba(59,130,246,0.06)" stroke="none" />
                                <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                              </>
                            )}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="mt-2 text-xs text-neutral-500">Recent donations scaled by amount</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Campaigns tab */}
      {tab === "campaigns" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              placeholder="Search campaigns..."
              value={campaignSearch}
              onChange={(e) => {
                setCampaignSearch(e.target.value);
                setCampaignPage(1);
              }}
              className="sm:max-w-xs"
            />
          </div>
          {campaignsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-neutral-200 bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="font-medium text-sm hover:underline truncate"
                      >
                        {c.title}
                      </Link>
                      <Badge
                        variant={
                          c.status === "active"
                            ? "success"
                            : c.status === "frozen"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {c.status}
                      </Badge>
                      {c.reported && (
                        <Badge variant="destructive">Reported</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      by {c.creator?.name} · {formatCurrency(c.raisedAmount)} /{" "}
                      {formatCurrency(c.goalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Freeze"
                        onClick={() => handleFreeze(c.id)}
                      >
                        <Snowflake size={15} className="text-blue-500" />
                      </Button>
                    ) : c.status === "frozen" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Unfreeze"
                        onClick={() => handleUnfreeze(c.id)}
                      >
                        <Play size={15} className="text-green-500" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination(
            campaignPage,
            campaignTotal,
            CAMPAIGN_LIMIT,
            setCampaignPage,
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
              className="sm:max-w-xs"
            />
          </div>
          {usersLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-neutral-200 bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{u.name}</span>
                      <Badge variant="outline">{u.role}</Badge>
                      <Badge
                        variant={
                          u.status === "active" ? "success" : "destructive"
                        }
                      >
                        {u.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {u.email} · Joined {formatDate(u.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.id !== user.id && (
                      <>
                        {u.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatus(u.id, "blocked")}
                          >
                            <Ban size={14} className="mr-1 text-orange-500" />{" "}
                            Block
                          </Button>
                        ) : u.status === "blocked" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatus(u.id, "active")}
                          >
                            <UserCheck
                              size={14}
                              className="mr-1 text-green-500"
                            />{" "}
                            Unblock
                          </Button>
                        ) : null}
                        {u.status !== "banned" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatus(u.id, "banned")}
                          >
                            <Ban size={14} className="mr-1 text-red-500" /> Ban
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatus(u.id, "active")}
                          >
                            <UserCheck
                              size={14}
                              className="mr-1 text-green-500"
                            />{" "}
                            Unban
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination(userPage, userTotal, USER_LIMIT, setUserPage)}
        </div>
      )}

      {/* Reported tab */}
      {tab === "reported" && (
        <div className="space-y-2">
          {reportedLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-neutral-200 bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          ) : reported.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No reported campaigns
            </div>
          ) : (
            reported.map((c) => (
              <div
                key={c.id}
                className="border border-neutral-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {c.title}
                      </Link>
                      <Badge
                        variant={c.status === "frozen" ? "warning" : "success"}
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      <AlertTriangle size={11} className="inline mr-1" />
                      Report reason: {c.reportReason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReport(c.id)}
                    >
                      Dismiss
                    </Button>
                    {c.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFreeze(c.id)}
                      >
                        <Snowflake size={13} className="mr-1" /> Freeze
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnfreeze(c.id)}
                      >
                        <Play size={13} className="mr-1" /> Unfreeze
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {renderPagination(
            reportedPage,
            reportedTotal,
            REPORTED_LIMIT,
            setReportedPage,
          )}
        </div>
      )}
    </div>
  );
}
