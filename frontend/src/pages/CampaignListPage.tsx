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
import { SelectMenu } from '../components/workspace/SelectMenu';
import { SegmentTabs } from '../components/workspace/SegmentTabs';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { useCampaigns } from '../hooks/useCampaigns';
import { NAV } from '../lib/navigation';
import { canCreateCampaign } from '../lib/roles';
import { MyCampaignsPage } from './MyCampaignsPage';

/** Grid kartu campaign: satu/two item tidak memakai kolom 1/3 lebar penuh. */
function campaignGridClass(count: number): string {
  const base = 'grid w-full gap-4 p-6';
  if (count <= 1) {
    return `${base} max-w-xl grid-cols-1 justify-items-stretch`;
  }
  if (count === 2) {
    return `${base} max-w-5xl grid-cols-1 justify-items-stretch sm:grid-cols-2`;
  }
  return `${base} sm:grid-cols-2 xl:grid-cols-3`;
}

/** Isi cukup banyak — kartu fill + scroll body (≈2 baris di xl). */
const EXPLORE_CARD_FILL_MIN = 6;

export function CampaignListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mineOnly = searchParams.get('mine') === '1';
  const showMine =
    mineOnly && user !== null && canCreateCampaign(user.role);

  const { campaigns, loading, error, reload } = useCampaigns();
  const [filter, setFilter] = useState<'all' | 'active'>('active');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of campaigns) {
      if (c.category?.trim()) {
        set.add(c.category.trim());
      }
    }
    return [...set].sort();
  }, [campaigns]);

  const filtered = useMemo(() => {
    let list = campaigns;
    if (filter === 'active') {
      list = list.filter((c) => c.status === 'active');
    }
    if (category) {
      list = list.filter((c) => (c.category ?? '').trim() === category);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.location ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [campaigns, filter, search, category]);

  const filteredIds = useMemo(
    () => filtered.map((c) => c.id),
    [filtered],
  );
  const { aggregates } = useCampaignAggregates(showMine ? [] : filteredIds);

  if (showMine) {
    return <MyCampaignsPage />;
  }

  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const cardFillLayout = !loading && filtered.length >= EXPLORE_CARD_FILL_MIN;
  const gridClass = campaignGridClass(filtered.length);

  return (
    <PageShell
      contentLayout="pane"
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
      <div
        className={
          cardFillLayout
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'w-full shrink-0'
        }
      >
      <DataTableCard
        scrollBody={cardFillLayout ? 'fill' : undefined}
        className={cardFillLayout ? 'min-h-0 flex-1' : undefined}
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Cari judul atau deskripsi…"
              className="w-full max-w-md"
            />
            <div className="flex flex-wrap items-center gap-3">
              {categories.length > 0 ? (
                <SelectMenu
                  value={category}
                  onChange={setCategory}
                  aria-label="Filter kategori"
                  className="min-w-[10rem]"
                  options={[
                    { value: '', label: 'Semua kategori' },
                    ...categories.map((cat) => ({ value: cat, label: cat })),
                  ]}
                />
              ) : null}
              <SegmentTabs
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: `Semua (${campaigns.length})` },
                  { value: 'active', label: `Aktif (${activeCount})` },
                ]}
              />
            </div>
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
          <div className={gridClass}>
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
      </div>
    </PageShell>
  );
}
