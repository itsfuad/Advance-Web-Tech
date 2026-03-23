import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">How it Works</h1>
        <p className="text-neutral-500">A quick guide to starting, supporting, and managing campaigns on FundRise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-neutral-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">1. Start a campaign</h3>
          <p className="text-neutral-600">Create a clear campaign page with a goal, timeline, and images. Tell your story and explain how funds will be used.</p>
        </div>

        <div className="p-6 bg-neutral-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">2. Share & raise</h3>
          <p className="text-neutral-600">Share your campaign with friends and communities. Engage backers with updates and transparent progress reports.</p>
        </div>

        <div className="p-6 bg-neutral-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">3. Deliver & report</h3>
          <p className="text-neutral-600">Use funds for the stated purpose, publish final results, and provide receipts or proof of impact to maintain trust.</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">For supporters</h2>
        <p className="text-neutral-600 mb-4">Browse campaigns, filter by categories, and support projects you believe in. Donations are processed securely.</p>
        <Link href="/campaigns">
          <Button>Browse Campaigns</Button>
        </Link>
      </div>
    </div>
  );
}
