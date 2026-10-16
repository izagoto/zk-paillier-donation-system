import { CheckCircle2, FolderKanban, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, type DayDonationStat } from '../api/client';
import { OrganizerDonationChart } from '../components/OrganizerDonationChart';
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

  const mineIds = useMemo(() => mine.map((c) => c.id), [mine]);
  const { aggregates } = useCampaignAggregates(mineIds);
  const [stats, setStats] = useState<DayDonationStat[]>([]);

  useEffect(() => {
    apiRequest<{ data: DayDonationStat[] }>(
      '/api/me/organizer/donation-stats?days=7',
      { auth: true },
    )
      .then((res) => setStats(res.data))
      .catch(() => setStats([]));
  }, []);

  const greeting = user?.email
    ? `Halo, ${displayNameFromEmail(user.email)}`
    : NAV.dashboard;

  return (
    <PageShell
      contentLayout="pane"
      title={greeting}
      subtitle="Kelola campaign dan pantau donasi yang masuk."
      actions={
        <ButtonLink to="/campaigns/new">
          <Plus className="h-4 w-4" aria-hidden />
          {NAV.createCampaign}
        </ButtonLink>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex shrink-0 flex-col gap-5">
          {error ? <PageAlert message={error} onRetry={() => void reload()} /> : null}

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
            title="Donasi 7 hari terakhir"
            subtitle="Donasi terkonfirmasi ke campaign Anda"
          >
            <OrganizerDonationChart data={stats} days={7} />
          </Panel>
        </div>

        <Panel
          scrollBody="fill"
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mine.map((campaign) => (
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
