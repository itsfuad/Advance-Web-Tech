import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Users, ChartLine } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <header className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-8">
          <p className="uppercase text-xs tracking-widest text-(--primary) font-bold mb-3">The architecture of impact</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">Redefining how we support meaningful change</h1>
          <p className="text-(--on-surface-variant) text-lg max-w-xl">We help creators tell a clear story, set measurable milestones and connect with backers who want to fund lasting outcomes.</p>
        </div>
        <div className="md:col-span-4">
          <p className="text-sm text-(--on-surface-variant)">An editorial approach to fundraising — prioritizing narrative, transparency and durable impact.</p>
        </div>
      </header>

      {/* Phase One: Asymmetric */}
      <section className="mb-20 flex flex-col md:flex-row gap-12">
        <aside className="md:w-5/12 top-28">
          <div className="bg-(--surface-container-low) p-10 rounded-2xl">
            <span className="uppercase text-xs tracking-widest text-(--primary) font-bold">Phase One</span>
            <h2 className="text-3xl font-bold mt-4 mb-3">Start a Movement</h2>
            <p className="text-(--on-surface-variant)">Craft a campaign page that reads like a short feature: goals, timeline and the visual story that persuades.</p>

            <div className="mt-6 w-full h-48 bg-(--surface-container-lowest) rounded-lg overflow-hidden">
              <img src="/cover.png" alt="Campaign hero" className="w-full h-full object-cover" />
            </div>
          </div>
        </aside>

        <div className="md:w-7/12 space-y-10 pt-6">
          {[
            { title: "Curate Your Narrative", body: "Use rich media and structured storytelling to show the change you plan to create." },
            { title: "Define Impact Milestones", body: "Set clear, verifiable goals so supporters can follow progress with confidence." },
            { title: "Launch to the Circle", body: "Activate your community and invite institutional partners for scaled impact." },
          ].map((step, i) => (
            <div key={step.title} className="flex gap-6 items-start">
              <div className="text-6xl font-extrabold text-(--outline)">0{String(i + 1)}</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-(--on-surface-variant) max-w-xl">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Phase Two: Glass & Tonal Shift */}
      <section className="mb-20 bg-(--surface-container-high) rounded-3xl p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <span className="uppercase text-xs tracking-widest text-(--primary) font-bold">Phase Two</span>
            <h3 className="text-3xl font-bold my-4">Fuel the Change</h3>
            <p className="text-(--on-surface-variant) mb-8">We streamline giving and ensure funds are released only when verifiable milestones are met.</p>

            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Target size={24} className="text-(--primary)" />
                  <div>
                    <h4 className="font-bold">Discovery & Diligence</h4>
                    <p className="text-sm text-(--on-surface-variant)">Curated, scored projects to make discovery efficient for serious backers.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Users size={24} className="text-(--primary)" />
                  <div>
                    <h4 className="font-bold">Secure Allocation</h4>
                    <p className="text-sm text-(--on-surface-variant)">Payments held and released via milestone verification for maximum trust.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm bg-(--surface-container-lowest) rounded-2xl p-8 shadow-sm">
              <div className="mb-6 flex justify-between items-center">
                <div className="text-xs uppercase tracking-widest text-(--outline)">Contribution</div>
                <div className="w-10 h-10 bg-(--primary) text-(--primary-foreground) rounded-lg flex items-center justify-center">✓</div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-(--on-surface-variant)">Contribution to Community Clinic</div>
                <div className="text-3xl font-extrabold text-(--primary)">$12,000</div>
              </div>

              <div className="pt-6 border-t border-(--outline)/20 space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-widest text-(--on-surface-variant)"><span>Impact Tier</span><strong>FOUNDATION</strong></div>
                <div className="flex justify-between text-xs uppercase tracking-widest text-(--on-surface-variant)"><span>Reach</span><strong>800 LIVES</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Three: Bento Grid */}
      <section className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="uppercase text-xs tracking-widest text-(--primary) font-bold">Phase Three</span>
          <h2 className="text-3xl font-bold mt-3 mb-2">Make an Impact</h2>
          <p className="text-(--on-surface-variant)">We track implementation so that every contribution becomes evidence of change.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          <div className="md:col-span-2 bg-(--surface-container-low) rounded-2xl p-8 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-12 h-12 bg-(--primary) text-(--primary-foreground) rounded-full flex items-center justify-center font-bold">1</div>
              <ChartLine size={20} />
            </div>

            <div>
                <h3 className="text-2xl font-bold mt-6">Real-Time Verification</h3>
                <p className="text-(--on-surface-variant)">Updates, audits and progress metrics available to all backers in a live feed.</p>
            </div>
          </div>

          <div className="relative bg-(--primary-container) text-(--primary-foreground) rounded-2xl p-8 flex flex-col justify-between">
            <div className="w-10 h-10 bg-(--primary) rounded-full flex items-center justify-center font-bold">2</div>
            <Users size={90} className="text-(--primary) absolute right-10" />
            <div>
              <h3 className="text-2xl font-bold mt-2">Community Governance</h3>
              <p className="text-(--secondary) text-sm">Voting and local participation in implementation decisions.</p>
            </div>
          </div>

          <div className="bg-(--surface-container-lowest) rounded-2xl p-8 flex flex-col justify-between border border-(--outline)/10 shadow-sm">
            <div className="w-10 h-10 bg-(--primary) text-(--primary-foreground) rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="text-2xl font-bold mt-2">Legacy Reporting</h3>
              <p className="text-(--on-surface-variant) text-sm">Comprehensive post-campaign impact ledgers and stories.</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl overflow-hidden group">
            <img src="/cover.png" alt="community" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 bg-(--surface-container-low) rounded-xl">
        <h2 className="text-3xl font-bold mb-4">Ready to architect change?</h2>
        <div className="flex justify-center gap-4">
          <Link href="/campaigns/new"><Button>Start a Movement</Button></Link>
          <Link href="/campaigns"><Button variant="outline">Browse Projects</Button></Link>
        </div>
      </section>
    </main>
  );
}