import { Receipt } from 'lucide-react';
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
import { useAuth } from '../context/AuthContext';
import { useCampaigns } from '../hooks/useCampaigns';
import { NAV } from '../lib/navigation';
import { formatDateTime, truncateMiddle } from '../lib/format';
import { VISIBLE_BODY_ROWS_ORGANIZER_LIST } from '../lib/dataTableScroll';

type Row = Donation & { campaignTitle: string };

function primaryCampaignPath(mine: Campaign[]): string {
  if (mine.length === 1) {
    return `/campaigns/${mine[0].id}`;
  }
  return '/campaigns?mine=1';
}

export function OrganizerDonationsPage() {
  const { user } = useAuth();
  const { campaigns, loading: campaignsLoading, error, reload } = useCampaigns();
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  const mine = useMemo(() => {
    if (!user) {
      return [];
    }
    return campaigns.filter((c) => c.created_by === user.id);
  }, [campaigns, user]);

  useEffect(() => {
    if (mine.length === 0) {
      setRows([]);
      return;
    }

    setLoadingDonations(true);
    Promise.all(
      mine.map(async (campaign: Campaign) => {
        const result = await apiRequest<{ data: Donation[] }>(
          `/api/campaigns/${campaign.id}/donations`,
        );
        return result.data.map((d) => ({
          ...d,
          campaignTitle: campaign.title,
        }));
      }),
    )
      .then((groups) => {
        const merged = groups.flat().sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setRows(merged);
      })
      .catch(() => setRows([]))
      .finally(() => setLoadingDonations(false));
  }, [mine]);

  const loading = campaignsLoading || loadingDonations;
  const showSkeleton = loading && rows.length === 0;

  const subtitle =
    rows.length > 0
      ? 'Klik nama campaign untuk membuka detail lengkap.'
      : mine.length === 0
        ? 'Buat campaign terlebih dahulu; donasi yang masuk akan tercatat di halaman ini.'
        : 'Belum ada donasi. Buka detail campaign dan bagikan tautannya ke calon donatur.';

  const campaignPath = primaryCampaignPath(mine);

  return (
    <PageShell
      title={NAV.incomingDonations}
      subtitle={subtitle}
      actions={
        mine.length === 0 ? (
          <ButtonLink to="/campaigns/new">{NAV.createCampaign}</ButtonLink>
        ) : (
          <ButtonLink to={campaignPath} variant="secondary">
            {mine.length === 1 ? 'Buka detail campaign' : NAV.myCampaigns}
          </ButtonLink>
        )
      }
    >
      {showSkeleton ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <PageAlert message={error} onRetry={() => void reload()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada donasi"
          description={
            mine.length === 0
              ? 'Anda belum memiliki campaign.'
              : 'Donasi akan muncul di sini setelah donatur mengirim melalui halaman campaign.'
          }
          action={
            mine.length === 0 ? (
              <ButtonLink to="/campaigns/new">{NAV.createCampaign}</ButtonLink>
            ) : (
              <ButtonLink to={campaignPath}>
                Buka detail campaign
              </ButtonLink>
            )
          }
        />
      ) : (
        <DataTable
          data={rows}
          rowKey={(row) => row.id}
          minWidth="800px"
          visibleBodyRows={VISIBLE_BODY_ROWS_ORGANIZER_LIST}
          pageSizeStorageKey="organizer:donations"
          columns={[
            {
              id: 'campaign',
              header: 'Campaign',
              render: (row) => (
                <Link
                  to={`/campaigns/${row.campaign_id}`}
                  className="tg-table-action font-medium"
                >
                  {row.campaignTitle}
                </Link>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              id: 'tx',
              header: 'Transaksi',
              cellClassName: 'font-mono text-xs',
              render: (row) =>
                row.tx_hash ? truncateMiddle(row.tx_hash, 8, 6) : '—',
            },
            {
              id: 'time',
              header: 'Waktu',
              cellClassName: 'whitespace-nowrap',
              render: (row) => formatDateTime(row.created_at),
            },
          ]}
        />
      )}
    </PageShell>
  );
}
