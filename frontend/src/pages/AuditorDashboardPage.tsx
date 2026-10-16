import { FolderKanban, ShieldCheck } from 'lucide-react';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { EmptyState } from '../components/workspace/EmptyState';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { useCampaigns } from '../hooks/useCampaigns';
import { NAV } from '../lib/navigation';

export function AuditorDashboardPage() {
  const { campaigns, loading, error, reload } = useCampaigns();
  const active = campaigns.filter((c) => c.status === 'active');
  const previewIds = active.slice(0, 6).map((c) => c.id);
  const { aggregates } = useCampaignAggregates(previewIds);

  return (
    <PageShell
      title="Audit & transparansi"
      subtitle="Tinjau campaign aktif, agregat terkumpul, dan bukti donasi per transaksi."
      actions={
        <ButtonLink to="/campaigns" variant="secondary">
          {NAV.exploreCampaigns}
        </ButtonLink>
      }
    >
      {error ? <PageAlert message={error} onRetry={() => void reload()} /> : null}

      <Panel title="Cara verifikasi">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-600">
          <li>Buka detail campaign dan tab Transparansi untuk melihat daftar donasi.</li>
          <li>
            Buka tautan verifikasi pada baris donasi atau kunjungi{' '}
            <code className="text-xs">/verify/donation/:id</code> dengan ID donasi.
          </li>
          <li>Bandingkan hash transaksi dengan catatan di jaringan Hardhat lokal.</li>
        </ol>
      </Panel>

      <Panel title="Campaign aktif" className="mt-5">
        {loading ? (
          <p className="text-sm text-zinc-500">Memuat…</p>
        ) : active.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Tidak ada campaign aktif"
            description="Belum ada campaign yang dipublikasikan."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.slice(0, 6).map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                aggregate={aggregates[campaign.id]}
              />
            ))}
          </div>
        )}
      </Panel>

      <p className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4" aria-hidden />
        Peran auditor hanya membaca data publik dan bukti verifikasi.
      </p>
    </PageShell>
  );
}
