import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, type Campaign, type Donation } from '../api/client';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/workspace/Button';
import { DataTable } from '../components/workspace/DataTable';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { TableSkeleton } from '../components/workspace/TableSkeleton';
import { NAV } from '../lib/navigation';
import { formatDateTime, truncateMiddle } from '../lib/format';

export function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
      {loading ? (
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
