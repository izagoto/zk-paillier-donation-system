import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { Spinner } from '../components/ui/Spinner';
import { ButtonLink } from '../components/workspace/Button';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { formatDateTime, truncateMiddle } from '../lib/format';

export type DonationVerification = {
  id: string;
  campaign_id: string;
  campaign_title: string;
  status: string;
  tx_hash: string;
  commitment: string;
  created_at: string;
};

export function VerifyDonationPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DonationVerification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiRequest<DonationVerification>(`/api/donations/${id}/verify`)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Donasi tidak ditemukan'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Verifikasi donasi">
        <Spinner label="Memuat bukti" />
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell title="Verifikasi donasi">
        <PageAlert message={error || 'Data tidak ditemukan.'} />
        <ButtonLink to="/campaigns" className="mt-4">Jelajahi campaign</ButtonLink>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Verifikasi donasi"
      subtitle="Bukti publik bahwa donasi tercatat pada campaign dan blockchain."
    >
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          <span className="text-sm font-medium">Bukti verifikasi</span>
        </div>

        <section className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)]">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500">Campaign</dt>
              <dd className="mt-1 font-medium text-zinc-900">
                <Link
                  to={`/campaigns/${data.campaign_id}`}
                  className="text-trust-primary hover:underline"
                >
                  {data.campaign_title}
                </Link>
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
          Nominal donasi tidak ditampilkan di halaman publik ini. Hanya donatur
          yang login dapat melihat nominal di riwayat pribadi.
        </p>
      </div>
    </PageShell>
  );
}
