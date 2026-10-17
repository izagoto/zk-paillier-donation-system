import {
  CheckCircle2,
  Flag,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest, type AggregateSummary, type Campaign } from '../api/client';
import { ButtonLink } from '../components/workspace/Button';
import { DataTable } from '../components/workspace/DataTable';
import { DataTableCard } from '../components/workspace/DataTableCard';
import { TableIconLink } from '../components/workspace/TableIconLink';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { SearchField } from '../components/workspace/SearchField';
import { SegmentTabs } from '../components/workspace/SegmentTabs';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { SummaryCard } from '../components/workspace/SummaryCard';
import { TableSkeleton } from '../components/workspace/TableSkeleton';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { useCampaigns } from '../hooks/useCampaigns';
import {
  campaignProgressPercent,
  formatCampaignProgressPercent,
} from '../lib/campaignProgress';
import { NAV } from '../lib/navigation';
import { formatAmount, formatDateTime } from '../lib/format';
import { VISIBLE_BODY_ROWS_MY_CAMPAIGNS } from '../lib/dataTableScroll';

type StatusFilter = 'all' | 'active' | 'other';

function statusFilterFromParam(raw: string | null): StatusFilter {
  if (raw === 'active' || raw === 'other') {
    return raw;
  }
  return 'all';
}

export function MyCampaignsPage() {
  const { user } = useAuth();
  const { campaigns, loading, error, reload } = useCampaigns();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const statusFilter = statusFilterFromParam(searchParams.get('status'));

  const setStatusFilter = (value: StatusFilter) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('mine', '1');
        if (value === 'all') {
          next.delete('status');
        } else {
          next.set('status', value);
        }
        return next;
      },
      { replace: true },
    );
  };
  const [donationCountTotal, setDonationCountTotal] = useState<number | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(false);

  const mine = useMemo(() => {
    if (!user) {
      return [];
    }
    return campaigns.filter((c) => c.created_by === user.id);
  }, [campaigns, user]);

  const filtered = useMemo(() => {
    let list = mine;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter === 'active') {
      list = list.filter((c) => c.status === 'active');
    } else if (statusFilter === 'other') {
      list = list.filter((c) => c.status !== 'active');
    }
    return list;
  }, [mine, search, statusFilter]);

  const activeCount = mine.filter((c) => c.status === 'active').length;
  const doneCount = mine.filter((c) => c.status !== 'active').length;

  useEffect(() => {
    if (mine.length === 0) {
      setDonationCountTotal(0);
      return;
    }

    setStatsLoading(true);
    Promise.all(
      mine.map((c) =>
        apiRequest<AggregateSummary>(`/api/campaigns/${c.id}/aggregate`).catch(
          () => ({ donation_count: 0 } as AggregateSummary),
        ),
      ),
    )
      .then((aggregates) => {
        const total = aggregates.reduce(
          (sum, a) => sum + (a.donation_count ?? 0),
          0,
        );
        setDonationCountTotal(total);
      })
      .finally(() => setStatsLoading(false));
  }, [mine]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const { aggregates } = useCampaignAggregates(filteredIds);

  const tableFillLayout =
    !loading && filtered.length >= VISIBLE_BODY_ROWS_MY_CAMPAIGNS;

  return (
    <PageShell
      contentLayout="pane"
      title={NAV.myCampaigns}
      subtitle="Daftar campaign yang Anda kelola. Buka detail untuk melihat donasi masuk."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink to="/campaigns" variant="secondary">
            {NAV.exploreCampaigns}
          </ButtonLink>
          <ButtonLink to="/campaigns/new">
            <Plus className="h-4 w-4" aria-hidden />
            {NAV.createCampaign}
          </ButtonLink>
        </div>
      }
    >
      <div
        className={
          tableFillLayout
            ? 'flex min-h-0 flex-1 flex-col gap-5 overflow-hidden'
            : 'tg-scroll-y min-h-0 flex-1 basis-0 pr-0.5'
        }
      >
      <div className="grid shrink-0 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total campaign"
          value={loading ? '—' : String(mine.length)}
          icon={FolderKanban}
          accent="blue"
        />
        <SummaryCard
          label="Campaign aktif"
          value={loading ? '—' : String(activeCount)}
          icon={CheckCircle2}
          accent="emerald"
        />
        <SummaryCard
          label="Donasi tercatat"
          value={
            loading || statsLoading || donationCountTotal === null
              ? '—'
              : String(donationCountTotal)
          }
          icon={Flag}
          hint="Seluruh campaign Anda"
          accent="amber"
        />
      </div>

      <DataTableCard
        scrollBody={tableFillLayout ? 'fill' : undefined}
        className={tableFillLayout ? 'min-h-0 flex-1' : undefined}
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Cari campaign…"
              className="w-full max-w-md"
            />
            <SegmentTabs
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: `Semua (${mine.length})` },
                { value: 'active', label: `Aktif (${activeCount})` },
                { value: 'other', label: `Lainnya (${doneCount})` },
              ]}
            />
          </>
        }
      >
        {loading && mine.length === 0 ? (
          <TableSkeleton embedded />
        ) : error ? (
          <div className="border-t border-[#e4e4e7] p-5">
            <PageAlert message={error} onRetry={() => void reload()} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            inset
            icon={FolderKanban}
            title={mine.length === 0 ? 'Belum ada campaign' : 'Tidak ada hasil'}
            description={
              mine.length === 0
                ? `Anda belum membuat campaign dengan akun ${user?.email}.`
                : 'Ubah kata kunci pencarian atau filter status.'
            }
            action={
              mine.length === 0 ? (
                <ButtonLink to="/campaigns/new">Buat campaign</ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            variant="embedded"
            scrollBody={tableFillLayout ? 'fill' : undefined}
            data={filtered}
            rowKey={(campaign) => campaign.id}
            minWidth="880px"
            visibleBodyRows={VISIBLE_BODY_ROWS_MY_CAMPAIGNS}
            pageSizeStorageKey="campaigns:mine"
            columns={[
            {
              id: 'campaign',
              header: 'Campaign',
              render: (campaign: Campaign) => (
                <div>
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    className="font-medium text-trust-primary hover:underline"
                  >
                    {campaign.title}
                  </Link>
                  {campaign.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#71717a]">
                      {campaign.description}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'raised',
              header: 'Terkumpul',
              cellClassName: 'whitespace-nowrap',
              render: (campaign: Campaign) => {
                const agg = aggregates[campaign.id];
                const raised =
                  agg?.decrypted_total !== undefined
                    ? formatAmount(agg.decrypted_total)
                    : '0';
                const pct = campaignProgressPercent(campaign, agg);
                return (
                  <span>
                    Rp {raised}{' '}
                    <span className="text-xs text-zinc-500">
                      ({formatCampaignProgressPercent(pct)}%)
                    </span>
                  </span>
                );
              },
            },
            {
              id: 'target',
              header: 'Target',
              cellClassName: 'whitespace-nowrap',
              render: (campaign: Campaign) =>
                `Rp ${formatAmount(campaign.target_amount)}`,
            },
            {
              id: 'max',
              header: 'Maks. donasi',
              cellClassName: 'whitespace-nowrap',
              render: (campaign: Campaign) =>
                `Rp ${formatAmount(campaign.max_donation)}`,
            },
            {
              id: 'status',
              header: 'Status',
              render: (campaign: Campaign) => (
                <StatusBadge status={campaign.status} />
              ),
            },
            {
              id: 'created',
              header: 'Dibuat',
              cellClassName: 'whitespace-nowrap',
              render: (campaign: Campaign) =>
                formatDateTime(campaign.created_at),
            },
            {
              id: 'action',
              header: 'Aksi',
              headerClassName: 'text-left',
              render: (campaign: Campaign) => (
                <TableIconLink
                  to={`/campaigns/${campaign.id}`}
                  icon={Eye}
                  label="Buka detail campaign"
                />
              ),
            },
          ]}
          />
        )}
      </DataTableCard>
      </div>
    </PageShell>
  );
}
