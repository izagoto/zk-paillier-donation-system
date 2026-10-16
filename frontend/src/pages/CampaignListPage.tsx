import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { DataTableCard } from '../components/workspace/DataTableCard';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { SearchField } from '../components/workspace/SearchField';
import { SegmentTabs } from '../components/workspace/SegmentTabs';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { useCampaigns } from '../hooks/useCampaigns';
import { NAV } from '../lib/navigation';
import { canCreateCampaign } from '../lib/roles';
import { MyCampaignsPage } from './MyCampaignsPage';

export function CampaignListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mineOnly = searchParams.get('mine') === '1';
  const showMine =
    mineOnly && user !== null && canCreateCampaign(user.role);

  const { campaigns, loading, error, reload } = useCampaigns();
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = campaigns;
    if (filter === 'active') {
      list = list.filter((c) => c.status === 'active');
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [campaigns, filter, search]);

  const filteredIds = useMemo(
    () => filtered.map((c) => c.id),
    [filtered],
  );
  const { aggregates } = useCampaignAggregates(showMine ? [] : filteredIds);

  if (showMine) {
    return <MyCampaignsPage />;
  }

  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <PageShell
      title={NAV.exploreCampaigns}
      subtitle="Buka detail campaign untuk melihat perkembangan dan mengirim donasi."
      actions={
        user && canCreateCampaign(user.role) ? (
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/campaigns?mine=1" variant="secondary">
              {NAV.myCampaigns}
            </ButtonLink>
            <ButtonLink to="/campaigns/new">{NAV.createCampaign}</ButtonLink>
          </div>
        ) : null
      }
    >
      <DataTableCard
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Cari judul atau deskripsi…"
              className="w-full max-w-md"
            />
            <SegmentTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: `Semua (${campaigns.length})` },
                { value: 'active', label: `Aktif (${activeCount})` },
              ]}
            />
          </>
        }
      >
        {loading ? (
          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg border border-[#e4e4e7] bg-zinc-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="border-t border-[#e4e4e7] p-5">
            <PageAlert message={error} onRetry={() => void reload()} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            inset
            icon={Search}
            title="Tidak ada campaign"
            description="Ubah kata kunci pencarian atau filter status."
          />
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                aggregate={aggregates[campaign.id]}
              />
            ))}
          </div>
        )}
      </DataTableCard>
    </PageShell>
  );
}
