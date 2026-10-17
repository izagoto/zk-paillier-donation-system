import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiRequest, type Campaign } from '../api/client';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { getPostLoginPath } from '../lib/flow';
import { NAV } from '../lib/navigation';

function campaignGridClass(count: number): string {
  if (count <= 1) {
    return 'mx-auto grid w-full max-w-sm gap-4';
  }
  if (count === 2) {
    return 'mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-2';
  }
  return 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';
}

export function HomePage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ data: Campaign[] }>('/api/campaigns')
      .then((result) =>
        setCampaigns(
          result.data.filter((c) => c.status === 'active').slice(0, 6),
        ),
      )
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const campaignIds = useMemo(() => campaigns.map((c) => c.id), [campaigns]);
  const { aggregates } = useCampaignAggregates(campaignIds);

  if (user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

  return (
    <PageShell
      contentLayout="pane"
      title={NAV.home}
      subtitle="Campaign aktif yang bisa Anda dukung. Masuk untuk mengirim donasi."
      actions={
        <ButtonLink to="/campaigns" variant="secondary">
          {NAV.exploreCampaigns}
        </ButtonLink>
      }
    >
      <Panel
        title="Campaign aktif"
        subtitle="Maksimal 6 campaign terbaru"
        actions={
          campaigns.length > 0 ? (
            <ButtonLink
              to="/campaigns"
              variant="ghost"
              className="h-9 px-3 text-xs font-semibold text-trust-primary"
            >
              Lihat semua
            </ButtonLink>
          ) : null
        }
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Memuat campaign" />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Belum ada campaign aktif"
            description="Cek kembali nanti atau jelajahi daftar lengkap."
            action={
              <ButtonLink to="/campaigns" variant="secondary">
                {NAV.exploreCampaigns}
              </ButtonLink>
            }
          />
        ) : (
          <div className={campaignGridClass(campaigns.length)}>
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                aggregate={aggregates[campaign.id]}
              />
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
