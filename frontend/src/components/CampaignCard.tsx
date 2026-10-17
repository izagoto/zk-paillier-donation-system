import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AggregateSummary, Campaign } from '../api/client';
import { CampaignCover } from './CampaignCover';
import {
  campaignProgressPercent,
  formatCampaignProgressPercent,
} from '../lib/campaignProgress';
import { formatAmount } from '../lib/format';
import { ButtonLink } from './workspace/Button';
import { StatusBadge } from './workspace/StatusBadge';

type Props = {
  campaign: Campaign;
  aggregate?: AggregateSummary | null;
};

export function CampaignCard({ campaign, aggregate }: Props) {
  const progress = campaignProgressPercent(campaign, aggregate);
  const raised =
    aggregate?.decrypted_total !== undefined
      ? formatAmount(aggregate.decrypted_total)
      : '0';
  const donorCount = aggregate?.donation_count ?? 0;

  return (
    <article className="tg-campaign-card flex flex-col">
      <CampaignCover
        imageUrl={campaign.image_url}
        title={campaign.title}
        className="-mx-4 -mt-4 mb-3 h-28 w-[calc(100%+2rem)] rounded-t-lg"
      />
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={campaign.status} />
          {campaign.category ? (
            <span className="text-xs text-zinc-500">{campaign.category}</span>
          ) : null}
        </div>
        <span className="text-xs font-medium tabular-nums text-zinc-500">
          {formatCampaignProgressPercent(progress)}%
        </span>
      </div>
      <h3 className="text-[15px] font-semibold text-zinc-900">
        <Link
          to={`/campaigns/${campaign.id}`}
          className="text-inherit no-underline hover:text-trust-primary"
        >
          {campaign.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-zinc-500">
        {campaign.description || 'Tidak ada deskripsi.'}
      </p>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-trust-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          <span className="font-medium text-zinc-900">Rp {raised}</span>
          {' '}
          dari Rp {formatAmount(campaign.target_amount)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {donorCount} donatur
        </p>
      </div>

      <ButtonLink
        to={`/campaigns/${campaign.id}`}
        variant="secondary"
        block
        className="mt-4"
      >
        Lihat detail
      </ButtonLink>
    </article>
  );
}
