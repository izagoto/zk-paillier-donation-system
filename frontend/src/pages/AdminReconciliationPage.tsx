import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Button } from '../components/workspace/Button';
import { DataTable } from '../components/workspace/DataTable';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { SummaryCard } from '../components/workspace/SummaryCard';
import { useCampaigns } from '../hooks/useCampaigns';
import { formatDateTime, truncateMiddle } from '../lib/format';
import { FolderKanban, Archive, AlertTriangle } from 'lucide-react';

type Overview = {
  live_donations: number;
  archive_rows: number;
  pending_donations: number;
  confirmed_donations: number;
  failed_donations: number;
};

type ArchiveRow = {
  id: string;
  campaign_id: string;
  donor_id: string;
  commitment: string;
  status: string;
  archive_reason: string;
  archived_at: string;
};

export function AdminReconciliationPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [archive, setArchive] = useState<ArchiveRow[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { campaigns } = useCampaigns();

  const load = () => {
    setLoading(true);
    setError('');
    return Promise.all([
      apiRequest<Overview>('/api/admin/reconciliation/overview', { auth: true }),
      apiRequest<{ data: ArchiveRow[] }>('/api/admin/donations/archive?limit=30', {
        auth: true,
      }),
    ])
      .then(([ov, arch]) => {
        setOverview(ov);
        setArchive(arch.data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat data admin'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  async function reconcilePending() {
    setMessage('');
    try {
      const result = await apiRequest<{
        processed: number;
        confirmed: number;
        failed: number;
        errors?: string[];
      }>('/api/admin/donations/reconcile-pending', {
        method: 'POST',
        auth: true,
      });
      setMessage(
        `Pending: ${result.processed} diproses, ${result.confirmed} berhasil, ${result.failed} gagal.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rekonsiliasi pending gagal');
    }
  }

  async function reconcileCampaign(campaignId: string) {
    setMessage('');
    try {
      const result = await apiRequest<{
        recomputed_changed: boolean;
        encrypted_before: string;
        encrypted_after: string;
      }>(`/api/admin/campaigns/${campaignId}/reconcile-aggregate`, {
        method: 'POST',
        auth: true,
      });
      setMessage(
        result.recomputed_changed
          ? 'Agregat diperbarui setelah perhitungan ulang.'
          : 'Agregat sudah selaras; tidak ada perubahan.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rekonsiliasi gagal');
    }
  }

  return (
    <PageShell
      title="Rekonsiliasi"
      subtitle="Pantau archive duplikat dan selaraskan agregat terenkripsi per campaign."
    >
      {error ? <PageAlert message={error} onRetry={() => void load()} /> : null}
      {message ? (
        <p className="mb-4 text-sm text-emerald-700">{message}</p>
      ) : null}

      {loading || !overview ? (
        <p className="text-sm text-zinc-500">Memuat…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Donasi live"
            value={String(overview.live_donations)}
            icon={FolderKanban}
            hint={`${overview.confirmed_donations} confirmed · ${overview.failed_donations} gagal`}
            accent="blue"
          />
          <SummaryCard
            label="Archive duplikat"
            value={String(overview.archive_rows)}
            icon={Archive}
            accent="amber"
          />
          <SummaryCard
            label="Pending"
            value={String(overview.pending_donations)}
            icon={AlertTriangle}
            accent="emerald"
          />
        </div>
      )}

      <Panel title="Selesaikan donasi pending" className="mt-6">
        <p className="mb-4 text-sm text-zinc-600">
          Coba lagi transaksi chain untuk donasi yang tertahan di status pending (mis.
          setelah gangguan RPC).
        </p>
        <Button
          variant="secondary"
          disabled={loading || !overview || overview.pending_donations === 0}
          onClick={() => void reconcilePending()}
        >
          Proses pending ({overview?.pending_donations ?? 0})
        </Button>
      </Panel>

      <Panel title="Hitung ulang agregat campaign" className="mt-6">
        <p className="mb-4 text-sm text-zinc-600">
          Menjumlahkan ulang ciphertext donasi terkonfirmasi ke tabel agregat.
        </p>
        <ul className="space-y-2">
          {campaigns.slice(0, 12).map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-900">{c.title}</span>
              <Button
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => void reconcileCampaign(c.id)}
              >
                Rekonsiliasi
              </Button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Cuplikan archive" className="mt-6" flush>
        {archive.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Tidak ada baris archive.</p>
        ) : (
          <DataTable
            variant="embedded"
            data={archive}
            rowKey={(row) => row.id}
            minWidth="720px"
            columns={[
              {
                id: 'reason',
                header: 'Alasan',
                render: (row) => row.archive_reason,
              },
              {
                id: 'status',
                header: 'Status',
                render: (row) => row.status,
              },
              {
                id: 'commitment',
                header: 'Commitment',
                cellClassName: 'font-mono text-xs',
                render: (row) => truncateMiddle(row.commitment, 10, 8),
              },
              {
                id: 'archived',
                header: 'Diarsipkan',
                render: (row) => formatDateTime(row.archived_at),
              },
            ]}
          />
        )}
      </Panel>
    </PageShell>
  );
}
