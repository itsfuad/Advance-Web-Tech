import Link from "next/link";

const CATEGORIES = [
  "Technology",
  "Health",
  "Education",
  "Environment",
  "Arts",
  "Community",
  "Business",
  "Other",
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-neutral-500">Browse campaigns by category to find projects that match your interests.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/campaigns?category=${encodeURIComponent(c)}`}
            className="block p-6 bg-neutral-50 rounded-lg hover:shadow transition"
          >
            <h3 className="text-lg font-semibold mb-1">{c}</h3>
            <p className="text-sm text-neutral-500">View {c} campaigns</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
