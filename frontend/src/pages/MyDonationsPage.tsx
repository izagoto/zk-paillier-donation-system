import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, type Campaign, type Donation } from '../api/client';
import { Button } from '../components/workspace/Button';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/workspace/Button';
import { DataTable } from '../components/workspace/DataTable';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { TableSkeleton } from '../components/workspace/TableSkeleton';
import { NAV } from '../lib/navigation';
import { formatAmount, formatDateTime, truncateMiddle } from '../lib/format';
import { VISIBLE_BODY_ROWS_MY_DONATIONS } from '../lib/dataTableScroll';

export function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [retryingId, setRetryingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    return Promise.all([
      apiRequest<{ data: Donation[] }>('/api/me/donations', { auth: true }),
      apiRequest<{ data: Campaign[] }>('/api/campaigns'),
    ])
      .then(([donationRes, campaignRes]) => {
        setDonations(donationRes.data);
        setCampaigns(campaignRes.data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat data'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  async function retryDonation(donationId: string) {
    setRetryingId(donationId);
    setError('');
    try {
      await apiRequest(`/api/donations/${donationId}/retry`, {
        method: 'POST',
        auth: true,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry gagal');
    } finally {
      setRetryingId(null);
    }
  }

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) {
      map.set(c.id, c.title);
    }
    return map;
  }, [campaigns]);

  return (
    <PageShell
      title={NAV.donationHistory}
      subtitle="Semua donasi yang Anda kirim. Klik nama campaign untuk kembali ke detail."
    >
      {loading && donations.length === 0 ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <PageAlert message={error} onRetry={() => void load()} />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Belum ada donasi"
          description="Mulai dari jelajahi campaign, lalu pilih nominal dan konfirmasi donasi."
          action={<ButtonLink to="/campaigns">Jelajahi campaign</ButtonLink>}
        />
      ) : (
        <DataTable
          data={donations}
          rowKey={(d) => d.id}
          minWidth="800px"
          visibleBodyRows={VISIBLE_BODY_ROWS_MY_DONATIONS}
          pageSizeStorageKey="donor:donations"
          columns={[
            {
              id: 'campaign',
              header: 'Campaign',
              render: (donation) => (
                <Link
                  to={`/campaigns/${donation.campaign_id}`}
                  className="tg-table-action font-medium"
                >
                  {titleById.get(donation.campaign_id) ??
                    donation.campaign_id.slice(0, 8)}
                </Link>
              ),
            },
            {
              id: 'amount',
              header: 'Nominal',
              cellClassName: 'whitespace-nowrap font-medium',
              render: (donation) =>
                donation.amount
                  ? `Rp ${formatAmount(donation.amount)}`
                  : '—',
            },
            {
              id: 'status',
              header: 'Status',
              render: (donation) => (
                <StatusBadge status={donation.status} />
              ),
            },
            {
              id: 'commitment',
              header: 'Bukti',
              cellClassName: 'font-mono text-xs',
              render: (donation) =>
                truncateMiddle(donation.commitment, 10, 8),
            },
            {
              id: 'tx',
              header: 'Transaksi',
              cellClassName: 'font-mono text-xs',
              render: (donation) =>
                donation.tx_hash
                  ? truncateMiddle(donation.tx_hash, 10, 8)
                  : '—',
            },
            {
              id: 'actions',
              header: 'Aksi',
              render: (donation) => (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/verify/donation/${donation.id}`}
                    className="text-xs font-semibold text-trust-primary hover:underline"
                  >
                    Verifikasi
                  </Link>
                  {donation.status === 'failed' ? (
                    <Button
                      variant="secondary"
                      className="h-7 px-2 text-xs"
                      disabled={retryingId === donation.id}
                      onClick={() => void retryDonation(donation.id)}
                    >
                      {retryingId === donation.id ? 'Mencoba…' : 'Coba lagi'}
                    </Button>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'time',
              header: 'Waktu',
              cellClassName: 'whitespace-nowrap',
              render: (donation) => formatDateTime(donation.created_at),
            },
          ]}
        />
      )}
    </PageShell>
  );
}
