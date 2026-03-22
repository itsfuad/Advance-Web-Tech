import Link from "next/link";
import { ArrowRight, Target, TrendingUp, Users } from "lucide-react";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types";
import HomeCta from "@/components/home/HomeCta";

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
      <section className="bg-black text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Fund What
            <br />
            <span className="text-neutral-400">Matters.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Create campaigns, support causes, and build a community around the
            things you care about most.
          </p>
          <HomeCta />
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
              <div className="text-3xl font-bold mb-1">1,000+</div>
              <div className="text-neutral-500 text-sm">Campaigns Funded</div>
            </div>
            <div suppressHydrationWarning className="p-6">
              <div className="flex justify-center mb-3">
                <Users size={32} />
              </div>
              <div className="text-3xl font-bold mb-1">50,000+</div>
              <div className="text-neutral-500 text-sm">Community Members</div>
            </div>
            <div suppressHydrationWarning className="p-6">
              <div className="flex justify-center mb-3">
                <TrendingUp size={32} />
              </div>
              <div className="text-3xl font-bold mb-1">$5M+</div>
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
