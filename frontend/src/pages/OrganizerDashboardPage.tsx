import { CheckCircle2, FolderKanban, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { SummaryCard } from '../components/workspace/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { useCampaigns } from '../hooks/useCampaigns';
import { displayNameFromEmail } from '../lib/displayName';
import { NAV } from '../lib/navigation';

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const { campaigns, loading, error, reload } = useCampaigns();

  const mine = useMemo(() => {
    if (!user) {
      return [];
    }
    return campaigns.filter((c) => c.created_by === user.id);
  }, [campaigns, user]);

  const activeMine = mine.filter((c) => c.status === 'active').length;

  const previewIds = useMemo(() => mine.slice(0, 4).map((c) => c.id), [mine]);
  const { aggregates } = useCampaignAggregates(previewIds);

  const greeting = user?.email
    ? `Halo, ${displayNameFromEmail(user.email)}`
    : NAV.dashboard;

  return (
    <PageShell
      title={greeting}
      subtitle="Kelola campaign dan pantau donasi yang masuk."
      actions={
        <ButtonLink to="/campaigns/new">
          <Plus className="h-4 w-4" aria-hidden />
          {NAV.createCampaign}
        </ButtonLink>
      }
    >
      {error ? <PageAlert message={error} onRetry={() => void reload()} /> : null}

      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Total campaign"
            value={loading ? '—' : String(mine.length)}
            icon={FolderKanban}
            accent="blue"
          />
          <SummaryCard
            label="Campaign aktif"
            value={loading ? '—' : String(activeMine)}
            icon={CheckCircle2}
            accent="emerald"
          />
        </div>

        <Panel
          title="Campaign terbaru"
          actions={
            mine.length > 0 ? (
              <ButtonLink
                to="/campaigns?mine=1"
                variant="ghost"
                className="h-9 px-3 text-xs font-semibold text-trust-primary"
              >
                Kelola semua
              </ButtonLink>
            ) : null
          }
        >
          {loading ? (
            <p className="text-sm text-trust-muted">Memuat…</p>
          ) : mine.length === 0 ? (
            <div className="text-sm text-trust-muted">
              <p>Anda belum memiliki campaign.</p>
              <ButtonLink to="/campaigns/new" className="mt-4">
                {NAV.createCampaign}
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {mine.slice(0, 4).map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  aggregate={aggregates[campaign.id]}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
