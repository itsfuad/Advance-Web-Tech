import Link from "next/link";
import Image from "next/image";
import { Campaign } from "@/types";
import {
  formatCurrency,
  formatDate,
  getProgressPercentage,
  resolveImageUrl,
} from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = getProgressPercentage(
    campaign.raisedAmount,
    campaign.goalAmount,
  );

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="group bg-(--surface-container-low) rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-56 bg-(--surface-container-lowest) overflow-hidden">
          {campaign.coverImage ? (
            <Image
              src={resolveImageUrl(campaign.coverImage)}
              alt={campaign.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <Target size={40} className="text-neutral-400" />
            </div>
          )}
        </div>

        <div className="p-4">
          {campaign.category && (
            <span className="text-xs uppercase tracking-wide text-neutral-500 font-medium">
              {campaign.category}
            </span>
          )}
          <h3 className="text-xl font-bold text-(--primary) mb-1 group-hover:text-(--primary-container) transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-(--on-surface-variant) mt-1 line-clamp-2">
            {campaign.description}
          </p>

          <div className="mt-4">
            <Progress value={progress} className="h-[0.85rem]" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-semibold text-(--on-surface)">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-xs text-(--on-surface-variant)">
                {progress}% of {formatCurrency(campaign.goalAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-(--on-surface-variant)">
              <span>by {campaign.creator?.name}</span>
            </div>
            {campaign.deadline && (
              <div className="flex items-center gap-1 text-xs text-(--on-surface-variant)">
                <Calendar size={12} />
                <span>{formatDate(campaign.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
