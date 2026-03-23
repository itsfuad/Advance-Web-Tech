import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, TrendingUp, Users, Rocket, Globe } from "lucide-react";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types";
import { formatCurrency, getProgressPercentage, resolveImageUrl } from "@/lib/utils";
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

  const topCampaign = campaigns[0];

  return (
    <div suppressHydrationWarning>
      {/* Hero */}
      <section className="relative px-8 py-24 max-w-screen-2xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 z-10 relative">
            <span className="inline-block px-3 py-1 bg-(--surface-container-low) text-(--on-surface-variant) text-xs font-bold tracking-widest uppercase mb-6 rounded">Global Impact</span>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.92] text-(--primary) mb-6">
              Empowering Change,
              <br />
              <span className="text-(--outline)">One Project</span>
              <br />
              at a Time
            </h1>

            <p className="text-xl text-(--on-surface-variant) max-w-md mb-8 leading-relaxed">
              Join a global network of visionaries and supporters turning bold ideas into community-led realities.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/campaigns/new">
                <Button size="lg" className="bg-(--primary) text-(--primary-foreground) px-8 py-4 rounded-xl font-bold">Start a Campaign</Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" size="lg" className="text-(--primary) border-(--outline) px-8 py-4 rounded-xl font-bold">Explore Projects</Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 relative h-130 w-full">
            <div className="absolute inset-0 bg-(--primary-fixed) rounded-2xl -rotate-3 translate-x-4 translate-y-4 opacity-20" />

            <Image src="/cover.png" alt="Community" fill className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl z-0" />

            <div className="absolute bottom-12 -left-12 bg-(--surface-container-lowest) p-6 rounded-2xl shadow-xl max-w-xs hidden lg:block">
              {topCampaign ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {topCampaign.creator?.profileImage ? (
                        <Image
                          alt={topCampaign.creator.name || "Fundraiser"}
                          src={resolveImageUrl(topCampaign.creator.profileImage)}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-(--primary) rounded-full flex items-center justify-center text-(--primary-foreground)">
                          <Image alt="Icon" src="/icon.png" width={20} height={20}/>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-(--primary)">{topCampaign.status === "active" ? "Top Campaign" : topCampaign.status}</p>
                      <p className="text-xs text-(--on-surface-variant) line-clamp-1">{topCampaign.title}</p>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-(--primary-fixed) rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-(--primary)" style={{ width: `${getProgressPercentage(topCampaign.raisedAmount, topCampaign.goalAmount)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>{getProgressPercentage(topCampaign.raisedAmount, topCampaign.goalAmount)}% Raised</span>
                    <span className="text-(--primary)">{formatCurrency(topCampaign.raisedAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-(--primary) rounded-full flex items-center justify-center text-(--primary-foreground)">
                      <Image alt="Icon" src="/icon.png" width={20} height={20}/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-(--primary)">Live Campaign</p>
                      <p className="text-xs text-(--on-surface-variant)">Community Health Hub</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-(--primary-fixed) rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-(--primary) w-[82%]" />
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>82% Raised</span>
                    <span className="text-(--primary)">$41,000</span>
                  </div>
                </>
              )}
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

      {/* How It Works: Journey to Impact */}
      <section className="bg-[var(--surface-container)] py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[var(--primary)] mb-4">Your Journey to Impact</h2>
          <p className="text-[var(--on-surface-variant)] max-w-2xl mx-auto mb-12">Three simple steps to transform your vision into a community-supported success story.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[var(--surface-container-lowest)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Rocket size={28} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Launch Your Idea</h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed">Share your story and vision with our intuitive campaign builder tools designed for storytelling.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[var(--surface-container-lowest)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Users size={28} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Build Your Community</h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed">Engage with supporters and build a movement around your cause with integrated social tools.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[var(--surface-container-lowest)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Globe size={28} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Make an Impact</h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed">Collect funds, execute your project, and share the results with your community of backers.</p>
            </div>
          </div>
        </div>
      </section>

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
