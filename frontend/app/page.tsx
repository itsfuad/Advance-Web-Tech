import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, TrendingUp, Users } from "lucide-react";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types";
import HomeCta from "@/components/home/HomeCta";
import StatCounter from "@/components/home/StatCounter";

async function getFeaturedCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/campaigns?limit=6&sort=top`,
      { cache: "no-store" },
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const campaigns = await getFeaturedCampaigns();

  return (
    <div suppressHydrationWarning>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-3xl transform rotate-12 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Image src="/icon.png" alt="Fundrise" width={56} height={56} className="rounded-full bg-white/10 p-2" />
                <div>
                  <h3 className="text-sm uppercase tracking-wider font-semibold">Fundrise</h3>
                  <p className="text-xs text-white/80">Community-powered fundraising</p>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                Fund what truly
                <br />
                <span className="text-white/95">matters — together.</span>
              </h1>

              <p className="text-lg text-white/90 mb-6 max-w-xl">
                Create campaigns, support causes, and build a community around the things you care about most.
              </p>

              <div className="flex items-center gap-3">
                <Link href="/campaigns/new">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90">Start a campaign</Button>
                </Link>
                <Link href="/campaigns">
                  <Button variant="ghost" className="text-white/90 border-white/20">Browse campaigns <ArrowRight size={14} className="ml-2 inline" /></Button>
                </Link>
              </div>

              <div className="mt-8 flex gap-8">
                <div>
                  <div className="text-2xl font-bold">100K+</div>
                  <div className="text-sm text-white/80">Backers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-white/80">Campaigns</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">$5M+</div>
                  <div className="text-sm text-white/80">Total raised</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
                <Image src="/icon.png" alt="Plant" width={360} height={360} className="mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            suppressHydrationWarning
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div suppressHydrationWarning className="p-6">
              <div className="flex justify-center mb-3">
                <Target size={32} />
              </div>
              <StatCounter
                className="text-3xl font-bold mb-1"
                target={1000}
                suffix="+"
              />
              <div className="text-neutral-500 text-sm">Campaigns Funded</div>
            </div>
            <div suppressHydrationWarning className="p-6">
              <div className="flex justify-center mb-3">
                <Users size={32} />
              </div>
              <StatCounter
                className="text-3xl font-bold mb-1"
                target={50000}
                suffix="+"
              />
              <div className="text-neutral-500 text-sm">Community Members</div>
            </div>
            <div suppressHydrationWarning className="p-6">
              <div className="flex justify-center mb-3">
                <TrendingUp size={32} />
              </div>
              <StatCounter
                className="text-3xl font-bold mb-1"
                target={5}
                prefix="$"
                suffix="M+"
              />
              <div className="text-neutral-500 text-sm">Total Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {campaigns.length > 0 && (
        <section suppressHydrationWarning className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div
              suppressHydrationWarning
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl font-bold">Featured Campaigns</h2>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight size={14} className="ml-1 inline" />
                </Button>
              </Link>
            </div>
            <div
              suppressHydrationWarning
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section suppressHydrationWarning className="py-20 bg-neutral-50 px-4">
        <div suppressHydrationWarning className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make an impact?</h2>
          <p className="text-neutral-500 mb-8">
            Join thousands of creators and backers who are changing the world
            through community funding.
          </p>
          <HomeCta />
        </div>
      </section>
    </div>
  );
}
