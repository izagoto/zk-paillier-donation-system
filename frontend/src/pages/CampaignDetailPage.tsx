import { Link2, Pencil, ShieldCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  apiRequest,
  type AggregateSummary,
  type Campaign,
  type Donation,
} from '../api/client';
import { CampaignCover } from '../components/CampaignCover';
import { EditCampaignModal } from '../components/modals/EditCampaignModal';
import { copyText } from '../lib/copyText';
import { Spinner } from '../components/ui/Spinner';
import { Button, ButtonLink } from '../components/workspace/Button';
import { PageAlert } from '../components/workspace/PageAlert';
import { DataTable } from '../components/workspace/DataTable';
import { PageShell } from '../components/workspace/PageShell';
import { SegmentTabs } from '../components/workspace/SegmentTabs';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { campaignProgressPercent } from '../lib/campaignProgress';
import { NAV } from '../lib/navigation';
import { canCreateCampaign, canDonate } from '../lib/roles';
import { formatAmount, formatDateTime, truncateMiddle } from '../lib/format';

type DetailTab = 'about' | 'donations' | 'transparency';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [aggregate, setAggregate] = useState<AggregateSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareHint, setShareHint] = useState('');
  const [tab, setTab] = useState<DetailTab>('about');

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    const [campaignData, donationData, aggregateData] = await Promise.all([
      apiRequest<Campaign>(`/api/campaigns/${id}`),
      apiRequest<{ data: Donation[] }>(`/api/campaigns/${id}/donations`),
      apiRequest<AggregateSummary>(`/api/campaigns/${id}/aggregate`),
    ]);

    setCampaign(campaignData);
    setDonations(donationData.data);
    setAggregate(aggregateData);
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat data'),
      )
      .finally(() => setLoading(false));
  }, [id, load]);

  if (loading) {
    return (
      <PageShell title="Memuat campaign…">
        <Spinner label="Memuat detail campaign" />
      </PageShell>
    );
  }

  if (!campaign) {
    return (
      <PageShell title="Campaign tidak ditemukan">
        <PageAlert
          message="Campaign tidak ditemukan. Periksa tautan atau kembali ke daftar."
        />
        <ButtonLink to="/campaigns" variant="secondary" className="mt-4">
          Ke daftar campaign
        </ButtonLink>
      </PageShell>
    );
  }

  const raisedFormatted =
    aggregate?.decrypted_total !== undefined
      ? formatAmount(aggregate.decrypted_total)
      : '0';

  const canShowDonate =
    user && canDonate(user.role) && campaign.status === 'active';

  const isOrganizerView =
    user && canCreateCampaign(user.role) && !canDonate(user.role);

  const isOwner =
    user && campaign.created_by === user.id && canCreateCampaign(user.role);

  async function shareCampaign() {
    if (!id) {
      return;
    }
    const url = `${window.location.origin}/campaigns/${id}`;
    const ok = await copyText(url);
    setShareHint(ok ? 'Tautan disalin ke clipboard.' : 'Gagal menyalin tautan.');
    window.setTimeout(() => setShareHint(''), 3000);
  }

  const progressPct = campaignProgressPercent(campaign, aggregate);
  const donorCount = aggregate?.donation_count ?? 0;

  const backTo = isOrganizerView ? '/campaigns?mine=1' : '/campaigns';
  const backLabel = isOrganizerView ? NAV.myCampaigns : NAV.exploreCampaigns;

  return (
    <PageShell
      title={campaign.title}
      breadcrumb={{ entityTitle: campaign.title }}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={campaign.status} />
          {isOwner ? (
            <Button
              variant="secondary"
              className="h-9"
              onClick={() => setEditModalOpen(true)}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Kelola
            </Button>
          ) : null}
          <Button variant="secondary" className="h-9" onClick={() => void shareCampaign()}>
            <Link2 className="h-4 w-4" aria-hidden />
            Bagikan
          </Button>
        </div>
      }
    >
      {error ? <PageAlert message={error} onRetry={() => void load()} /> : null}
      {shareHint ? (
        <p className="mb-2 text-sm text-emerald-700">{shareHint}</p>
      ) : null}

      <ButtonLink
        to={backTo}
        variant="ghost"
        className="-mt-2 mb-4 h-9 px-0 text-sm text-zinc-600 hover:bg-transparent"
      >
        ← Kembali ke {backLabel}
      </ButtonLink>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-lg border border-trust-border bg-white shadow-[var(--shadow-trust-card)]">
            <CampaignCover
              imageUrl={campaign.image_url}
              title={campaign.title}
              className="h-40 w-full sm:h-48"
            />
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Donasi tercatat & dapat diaudit
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {donorCount} donatur
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {campaign.description || 'Tidak ada deskripsi.'}
              </p>

              <div className="mt-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-900">
                      Rp {raisedFormatted}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      terkumpul dari Rp {formatAmount(campaign.target_amount)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold tabular-nums text-trust-primary">
                    {progressPct}%
                  </p>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-trust-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <SegmentTabs
            ariaLabel="Bagian campaign"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'about', label: 'Tentang' },
              { value: 'donations', label: 'Donasi masuk' },
              { value: 'transparency', label: 'Transparansi' },
            ]}
          />

          {tab === 'about' ? (
            <section className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)] sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-900">Tentang campaign</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {campaign.description || 'Belum ada deskripsi tambahan.'}
              </p>
              <dl className="mt-6 grid gap-4 border-t border-zinc-100 pt-6 text-sm sm:grid-cols-2">
                {campaign.category ? (
                  <div>
                    <dt className="text-zinc-500">Kategori</dt>
                    <dd className="mt-1 font-medium text-zinc-900">{campaign.category}</dd>
                  </div>
                ) : null}
                {campaign.location ? (
                  <div>
                    <dt className="text-zinc-500">Lokasi</dt>
                    <dd className="mt-1 font-medium text-zinc-900">{campaign.location}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-zinc-500">Target</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    Rp {formatAmount(campaign.target_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Maksimal per donasi</dt>
                  <dd className="mt-1 font-medium text-zinc-900">
                    Rp {formatAmount(campaign.max_donation)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Privasi donatur</dt>
                  <dd className="mt-1 text-zinc-600">
                    Nominal per donatur tidak ditampilkan ke publik. Total terkumpul
                    tetap dapat dipantau di halaman ini.
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          {tab === 'donations' ? (
            <section className="tg-panel overflow-hidden">
              {donations.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-zinc-500">
                  Belum ada donasi untuk campaign ini.
                </p>
              ) : (
                <DataTable
                  variant="embedded"
                  data={donations}
                  rowKey={(d) => d.id}
                  minWidth="640px"
                  columns={[
                    {
                      id: 'status',
                      header: 'Status',
                      render: (donation) => (
                        <StatusBadge status={donation.status} />
                      ),
                    },
                    {
                      id: 'time',
                      header: 'Waktu',
                      cellClassName: 'whitespace-nowrap',
                      render: (donation) =>
                        formatDateTime(donation.created_at),
                    },
                    {
                      id: 'tx',
                      header: 'Transaksi',
                      cellClassName: 'font-mono text-xs text-zinc-600',
                      render: (donation) =>
                        donation.tx_hash
                          ? truncateMiddle(donation.tx_hash, 10, 8)
                          : '—',
                    },
                    {
                      id: 'verify',
                      header: 'Verifikasi',
                      render: (donation) => (
                        <Link
                          to={`/verify/donation/${donation.id}`}
                          className="text-xs font-semibold text-trust-primary hover:underline"
                        >
                          Lihat bukti
                        </Link>
                      ),
                    },
                  ]}
                />
              )}
            </section>
          ) : null}

          {tab === 'transparency' ? (
            <section className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)] sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-900">Transparansi</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Setiap donasi memiliki referensi bukti dan transaksi yang dapat
                dilacak. Detail teknis tersedia untuk keperluan audit.
              </p>
              {donations.length === 0 ? (
                <p className="mt-6 text-sm text-zinc-500">Belum ada data donasi.</p>
              ) : (
                <div className="mt-4">
                <DataTable
                  data={donations}
                  rowKey={(d) => d.id}
                  minWidth="640px"
                  columns={[
                    {
                      id: 'status',
                      header: 'Status',
                      render: (d) => <StatusBadge status={d.status} />,
                    },
                    {
                      id: 'commitment',
                      header: 'Bukti',
                      cellClassName: 'font-mono text-xs',
                      render: (d) => truncateMiddle(d.commitment, 12, 10),
                    },
                    {
                      id: 'tx',
                      header: 'Transaksi',
                      cellClassName: 'font-mono text-xs',
                      render: (d) =>
                        d.tx_hash ? truncateMiddle(d.tx_hash, 12, 10) : '—',
                    },
                    {
                      id: 'verify',
                      header: 'Verifikasi',
                      render: (d) => (
                        <Link
                          to={`/verify/donation/${d.id}`}
                          className="text-xs font-semibold text-trust-primary hover:underline"
                        >
                          Publik
                        </Link>
                      ),
                    },
                  ]}
                />
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--height-header)+1rem)] lg:self-start">
          {canShowDonate ? (
            <div className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)]">
              <p className="text-sm font-semibold text-zinc-900">Dukung campaign ini</p>
              <p className="mt-1 text-xs text-zinc-500">
                Hingga Rp {formatAmount(campaign.max_donation)} per donasi
              </p>
              <ButtonLink
                to={`/campaigns/${id}/donate`}
                block
                className="mt-4"
              >
                Donasi sekarang
              </ButtonLink>
            </div>
          ) : null}

          {isOrganizerView ? (
            <div className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)]">
              <p className="text-sm font-semibold text-zinc-900">Tampilan pengelola</p>
              <p className="mt-2 text-sm text-zinc-600">
                Pantau donasi masuk dari menu utama atau bagikan tautan campaign ini
                ke calon donatur.
              </p>
              <ButtonLink
                to="/organizer/donations"
                variant="secondary"
                block
                className="mt-4"
              >
                {NAV.incomingDonations}
              </ButtonLink>
            </div>
          ) : null}

          {!canShowDonate && !isOrganizerView ? (
            <div className="rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)]">
              <p className="text-sm font-semibold text-zinc-900">Ingin berdonasi?</p>
              {!user ? (
                <p className="mt-2 text-sm text-zinc-600">
                  <Link to="/login" className="font-semibold text-trust-primary">
                    Masuk
                  </Link>{' '}
                  untuk mengirim donasi.
                </p>
              ) : campaign.status !== 'active' ? (
                <p className="mt-2 text-sm text-zinc-600">
                  Campaign ini tidak menerima donasi baru saat ini.
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-600">
                  Gunakan akun donatur untuk mengirim donasi.
                </p>
              )}
            </div>
          ) : null}
        </aside>
      </div>

      {isOwner ? (
        <EditCampaignModal
          open={editModalOpen}
          campaign={campaign}
          onClose={() => setEditModalOpen(false)}
          onUpdated={(updated) => setCampaign(updated)}
        />
      ) : null}

    </PageShell>
  );
}
