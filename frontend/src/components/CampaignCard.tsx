import { Link } from 'react-router-dom';
import type { Campaign } from '../api/client';
import { formatAmount, statusLabel } from '../lib/format';
import { Badge, statusTone } from './ui/Badge';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="campaign-card">
      <div className="campaign-card__top">
        <Badge tone={statusTone(campaign.status)}>
          {statusLabel(campaign.status)}
        </Badge>
      </div>
      <h3 className="campaign-card__title">
        <Link to={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
      </h3>
      <p className="campaign-card__desc">
        {campaign.description || 'Tidak ada deskripsi.'}
      </p>
      <dl className="campaign-card__meta">
        <div>
          <dt>Target</dt>
          <dd>Rp {formatAmount(campaign.target_amount)}</dd>
        </div>
        <div>
          <dt>Maks. per donasi</dt>
          <dd>Rp {formatAmount(campaign.max_donation)}</dd>
        </div>
      </dl>
      <Link to={`/campaigns/${campaign.id}`} className="campaign-card__cta">
        Lihat detail & donasi
      </Link>
    </article>
  );
}
