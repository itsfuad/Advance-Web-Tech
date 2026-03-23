import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";

export default function CategoriesPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <header className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-7">
          <p className="uppercase text-xs tracking-widest text-(--on-surface-variant) mb-3">Curated Impact</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-(--primary)">Where will your legacy begin?</h1>
        </div>
        <div className="md:col-span-5">
          <p className="text-(--on-surface-variant) text-lg max-w-md">Explore focused initiatives designed to address urgent challenges. Each category is a deliberate doorway to measurable change.</p>
        </div>
      </header>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
        {CATEGORIES.map((cat) => {
          const isFeatured = cat.layout === "featured";
          const isWide = cat.layout === "wide";
          const colClass = isFeatured ? "md:col-span-8 md:row-span-2" : isWide ? "md:col-span-8" : "md:col-span-4";

          return (
            <Link
              key={cat.id}
              href={`/campaigns?category=${encodeURIComponent(cat.title)}`}
              className={`${colClass} group relative overflow-hidden rounded-2xl cursor-pointer ${isFeatured ? "" : "bg-(--surface-container-low)"}`}
            >
              {isFeatured ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,52,38,0.85)] via-[rgba(0,52,38,0.25)] to-transparent z-10" />
                  <img src="/cover.png" alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="relative z-20 p-10 text-(--primary-foreground)">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">{cat.emoji}</div>
                      <span className="text-xs uppercase tracking-[0.18em]">Active Projects: {cat.count}</span>
                    </div>
                    <h3 className="text-4xl font-extrabold mb-2">{cat.title}</h3>
                    <p className="max-w-md text-(--primary-foreground)/90">{cat.description}</p>
                  </div>
                </>
              ) : (
                <div className="relative z-20 p-8 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="text-3xl text-(--primary)">{cat.emoji}</div>
                    <span className="text-[10px] uppercase tracking-widest text-(--on-surface-variant) font-bold">{cat.count} Projects</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-(--primary) mb-1">{cat.title}</h4>
                    <p className="text-sm text-(--on-surface-variant)">{cat.description}</p>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </section>

      {/* CTA */}
      <section className="mt-12 p-10 bg-(--surface-container-low) rounded-xl text-center">
        <h2 className="text-2xl font-bold text-(--primary) mb-4">Don&apos;t see your cause?</h2>
        <p className="text-(--on-surface-variant) max-w-xl mx-auto mb-6">We welcome proposals for new sectors. Start a conversation with our team to seed a new focus area.</p>
        <div className="flex justify-center gap-4">
          <Link href="mailto:me@itsfuad.com"><Button>Mail Us</Button></Link>
        </div>
      </section>
    </main>
  );
}
