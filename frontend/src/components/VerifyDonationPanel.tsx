import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spinner } from './ui/Spinner';
import { PageAlert } from './workspace/PageAlert';
import { StatusBadge } from './workspace/StatusBadge';
import { formatDateTime, truncateMiddle } from '../lib/format';
import type { DonationVerification } from '../pages/VerifyDonationPage';

type Props = {
  data: DonationVerification | null;
  loading: boolean;
  error: string;
  /** When set, campaign title is plain text (user is already on this campaign). */
  currentCampaignId?: string;
};

export function VerifyDonationPanel({
  data,
  loading,
  error,
  currentCampaignId,
}: Props) {
  if (loading) {
    return <Spinner label="Memuat bukti" />;
  }

  if (!data) {
    return <PageAlert message={error || 'Data tidak ditemukan.'} />;
  }

  const showCampaignLink =
    !currentCampaignId || currentCampaignId !== data.campaign_id;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-800">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <span className="text-sm font-medium">Bukti verifikasi</span>
      </div>

      <section className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)]">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-zinc-500">Campaign</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {showCampaignLink ? (
                <Link
                  to={`/campaigns/${data.campaign_id}`}
                  className="text-trust-primary hover:underline"
                >
                  {data.campaign_title}
                </Link>
              ) : (
                data.campaign_title
              )}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={data.status} />
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Waktu</dt>
            <dd className="mt-1 text-zinc-900">{formatDateTime(data.created_at)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Bukti (commitment)</dt>
            <dd className="mt-1 break-all font-mono text-xs text-zinc-800">
              {data.commitment}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Transaksi on-chain</dt>
            <dd className="mt-1 font-mono text-xs text-zinc-800">
              {data.tx_hash ? truncateMiddle(data.tx_hash, 16, 12) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">ID donasi</dt>
            <dd className="mt-1 font-mono text-xs text-zinc-600">{data.id}</dd>
          </div>
        </dl>
      </section>

      <p className="text-xs text-zinc-500">
        Nominal donasi tidak ditampilkan di bukti publik ini. Hanya donatur yang
        login dapat melihat nominal di riwayat pribadi.
      </p>
    </div>
  );
}
