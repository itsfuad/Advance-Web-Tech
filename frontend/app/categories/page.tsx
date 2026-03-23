import Link from "next/link";

const CATEGORIES = [
  { id: "environment", title: "Environment", count: 142 },
  { id: "education", title: "Education", count: 84 },
  { id: "health", title: "Community Health", count: 67 },
  { id: "digital", title: "Digital Literacy", count: 39 },
  { id: "arts", title: "Sustainable Arts", count: 52 },
  { id: "business", title: "Business", count: 28 },
];

export default function CategoriesPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <header className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-7">
          <p className="uppercase text-xs tracking-widest text-[var(--on-surface-variant)] mb-3">Curated Impact</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[var(--primary)]">Where will your legacy begin?</h1>
        </div>
        <div className="md:col-span-5">
          <p className="text-[var(--on-surface-variant)] text-lg max-w-md">Explore focused initiatives designed to address urgent challenges. Each category is a deliberate doorway to measurable change.</p>
        </div>
      </header>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
        {/* Featured */}
        <Link href={`/campaigns?category=Environment`} className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-2xl cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,52,38,0.85)] via-[rgba(0,52,38,0.25)] to-transparent z-10" />
          <img src="/cover.png" alt="Environment" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="relative z-20 p-10 text-[var(--primary-foreground)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🌿</div>
              <span className="text-xs uppercase tracking-[0.18em]">Active Projects: 142</span>
            </div>
            <h3 className="text-4xl font-extrabold mb-2">Environment</h3>
            <p className="max-w-md text-[var(--primary-foreground)]/90">Protecting biodiversity and restoring vital ecosystems with community-led solutions.</p>
          </div>
        </Link>

        {/* Education */}
        <Link href={`/campaigns?category=Education`} className="md:col-span-4 group relative overflow-hidden rounded-2xl cursor-pointer bg-[var(--surface-container-low)]">
          <div className="relative z-20 p-8 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="text-3xl text-[var(--primary)]">📚</div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-bold">84 Projects</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[var(--primary)] mb-1">Education</h4>
              <p className="text-sm text-[var(--on-surface-variant)]">Bridging learning gaps with accessible tools and curricula.</p>
            </div>
          </div>
        </Link>

        {/* Community Health */}
        <Link href={`/campaigns?category=Community Health`} className="md:col-span-4 group relative overflow-hidden rounded-2xl cursor-pointer bg-[var(--surface-container-low)]">
          <div className="relative z-20 p-8 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="text-3xl text-[var(--primary)]">⚕️</div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-bold">67 Projects</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[var(--primary)] mb-1">Community Health</h4>
              <p className="text-sm text-[var(--on-surface-variant)]">Local initiatives improving health outcomes for neighborhoods.</p>
            </div>
          </div>
        </Link>

        {/* Digital Literacy */}
        <Link href={`/campaigns?category=Digital Literacy`} className="md:col-span-4 group relative overflow-hidden rounded-2xl cursor-pointer bg-[var(--surface-container-low)]">
          <div className="relative z-20 p-8 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="text-3xl text-[var(--primary)]">💻</div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-bold">39 Projects</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[var(--primary)] mb-1">Digital Literacy</h4>
              <p className="text-sm text-[var(--on-surface-variant)]">Skills and training for the next generation of makers.</p>
            </div>
          </div>
        </Link>

        {/* Sustainable Arts (wide) */}
        <Link href={`/campaigns?category=Arts`} className="md:col-span-8 group relative overflow-hidden rounded-2xl cursor-pointer bg-[var(--surface-container-low)]">
          <div className="relative z-20 p-8 flex flex-col h-full justify-center max-w-md">
            <span className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-bold mb-4">52 Projects</span>
            <h3 className="text-3xl font-bold text-[var(--primary)] mb-2">Sustainable Arts</h3>
            <p className="text-[var(--on-surface-variant)]">Creative projects that preserve culture and foreground sustainability.</p>
          </div>
        </Link>
      </section>

      {/* CTA */}
      <section className="mt-12 p-10 bg-[var(--surface-container-low)] rounded-xl text-center">
        <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">Don't see your cause?</h2>
        <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto mb-6">We welcome proposals for new sectors. Start a conversation with our team to seed a new focus area.</p>
        <div className="flex justify-center gap-4">
          <Link href="/contact"><button className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md">Contact our Board</button></Link>
          <Link href="/proposal"><button className="px-6 py-3 border border-[var(--outline)] text-[var(--primary)] rounded-md">Submit a Proposal</button></Link>
        </div>
      </section>
    </main>
  );
}
