import Link from 'next/link';
import { Campaign } from '@/types';
import { formatCurrency, formatDate, getProgressPercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = getProgressPercentage(campaign.raisedAmount, campaign.goalAmount);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Cover Image */}
        <div className="h-48 bg-neutral-100 overflow-hidden">
          {campaign.coverImage ? (
            <img
              src={`${API_BASE}${campaign.coverImage}`}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <h3 className="font-semibold text-neutral-900 mt-1 line-clamp-2 group-hover:text-black">
            {campaign.title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {campaign.description}
          </p>

          <div className="mt-4">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-semibold">{formatCurrency(campaign.raisedAmount)}</span>
              <span className="text-xs text-neutral-500">{progress}% of {formatCurrency(campaign.goalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <span>by {campaign.creator?.name}</span>
            </div>
            {campaign.deadline && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
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
