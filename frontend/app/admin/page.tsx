'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { PlatformStats, Campaign, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Target, TrendingUp, AlertTriangle, Snowflake, Play, Ban, UserCheck, Eye } from 'lucide-react';

type Tab = 'overview' | 'campaigns' | 'users' | 'reported';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reported, setReported] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, usersRes, reportedRes] = await Promise.all([
        api.get('/stats/platform'),
        api.get('/campaigns/admin/all?limit=50'),
        api.get('/users?limit=50'),
        api.get('/campaigns/admin/reported?limit=50'),
      ]);
      setStats(statsRes.data);
      setCampaigns(campaignsRes.data.data);
      setUsers(usersRes.data.data);
      setReported(reportedRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (id: string) => {
    await api.patch(`/campaigns/${id}/freeze`);
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: 'frozen' } : c));
    setReported(cs => cs.map(c => c.id === id ? { ...c, status: 'frozen' } : c));
  };

  const handleUnfreeze = async (id: string) => {
    await api.patch(`/campaigns/${id}/unfreeze`);
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: 'active' } : c));
    setReported(cs => cs.map(c => c.id === id ? { ...c, status: 'active' } : c));
  };

  const handleUserStatus = async (id: string, status: string) => {
    await api.patch(`/users/${id}/status`, { status });
    setUsers(us => us.map(u => u.id === id ? { ...u, status: status as any } : u));
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: `Campaigns (${campaigns.length})` },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'reported', label: `Reported (${reported.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-neutral-500 text-sm">Platform management dashboard</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-8">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
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
                <p className="text-xs text-neutral-400">{stats.activeCampaigns} active · {stats.frozenCampaigns} frozen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-xs uppercase">Total Raised</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <AlertTriangle size={16} />
                  <span className="text-xs uppercase">Reported</span>
                </div>
                <div className="text-2xl font-bold">{stats.reportedCampaigns}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Top Campaigns</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topCampaigns.map((c) => (
                    <div key={c.id} className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <Link href={`/campaigns/${c.id}`} className="text-sm hover:underline truncate max-w-[200px]">
                        {c.title}
                      </Link>
                      <span className="text-sm font-medium">{formatCurrency(c.raisedAmount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent Donations</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentDonations.map((d) => (
                    <div key={d.id} className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <div>
                        <p className="text-sm">{d.donor?.name}</p>
                        <p className="text-xs text-neutral-400">{formatDate(d.createdAt)}</p>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Campaigns tab */}
      {tab === 'campaigns' && (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div key={c.id} className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/campaigns/${c.id}`} className="font-medium text-sm hover:underline truncate">
                    {c.title}
                  </Link>
                  <Badge variant={c.status === 'active' ? 'success' : c.status === 'frozen' ? 'warning' : 'outline'}>
                    {c.status}
                  </Badge>
                  {c.reported && <Badge variant="destructive">Reported</Badge>}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  by {c.creator?.name} · {formatCurrency(c.raisedAmount)} / {formatCurrency(c.goalAmount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/campaigns/${c.id}`}>
                  <Button variant="ghost" size="icon" title="View">
                    <Eye size={15} />
                  </Button>
                </Link>
                {c.status === 'active' ? (
                  <Button variant="ghost" size="icon" title="Freeze" onClick={() => handleFreeze(c.id)}>
                    <Snowflake size={15} className="text-blue-500" />
                  </Button>
                ) : c.status === 'frozen' ? (
                  <Button variant="ghost" size="icon" title="Unfreeze" onClick={() => handleUnfreeze(c.id)}>
                    <Play size={15} className="text-green-500" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="border border-neutral-200 rounded-lg p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{u.name}</span>
                  <Badge variant="outline">{u.role}</Badge>
                  <Badge variant={u.status === 'active' ? 'success' : 'destructive'}>{u.status}</Badge>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{u.email} · Joined {formatDate(u.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.id !== user.id && (
                  <>
                    {u.status === 'active' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUserStatus(u.id, 'blocked')}>
                        <Ban size={14} className="mr-1 text-orange-500" /> Block
                      </Button>
                    ) : u.status === 'blocked' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUserStatus(u.id, 'active')}>
                        <UserCheck size={14} className="mr-1 text-green-500" /> Unblock
                      </Button>
                    ) : null}
                    {u.status !== 'banned' ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUserStatus(u.id, 'banned')}>
                        <Ban size={14} className="mr-1 text-red-500" /> Ban
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleUserStatus(u.id, 'active')}>
                        <UserCheck size={14} className="mr-1 text-green-500" /> Unban
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reported tab */}
      {tab === 'reported' && (
        <div className="space-y-2">
          {reported.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">No reported campaigns</div>
          ) : reported.map((c) => (
            <div key={c.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-sm hover:underline">
                      {c.title}
                    </Link>
                    <Badge variant={c.status === 'frozen' ? 'warning' : 'success'}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    <AlertTriangle size={11} className="inline mr-1" />
                    Report reason: {c.reportReason}
                  </p>
                </div>
                <div className="flex gap-2">
                  {c.status === 'active' ? (
                    <Button size="sm" variant="outline" onClick={() => handleFreeze(c.id)}>
                      <Snowflake size={13} className="mr-1" /> Freeze
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleUnfreeze(c.id)}>
                      <Play size={13} className="mr-1" /> Unfreeze
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
