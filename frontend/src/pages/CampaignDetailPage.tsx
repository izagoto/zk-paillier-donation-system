import { Link2, Pencil, ShieldCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VerifyDonationModal } from '../components/modals/VerifyDonationModal';
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
import { Panel } from '../components/workspace/Panel';
import { SegmentTabs } from '../components/workspace/SegmentTabs';
import { StatusBadge } from '../components/workspace/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  campaignProgressPercent,
  formatCampaignProgressPercent,
} from '../lib/campaignProgress';
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
  const [verifyDonationId, setVerifyDonationId] = useState<string | null>(null);

  const verifyLinkClass =
    'text-xs font-semibold text-trust-primary hover:underline';

  function openVerifyModal(donationId: string) {
    setVerifyDonationId(donationId);
  }

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

  const metaSubtitle = [
    campaign.category,
    campaign.location,
    `${donorCount} donatur`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageShell
      contentLayout="pane"
      title={campaign.title}
      subtitle={metaSubtitle || undefined}
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
        <p className="shrink-0 text-sm text-emerald-700">{shareHint}</p>
      ) : null}

      <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
        <div className="grid shrink-0 gap-5 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
          <section className="overflow-hidden rounded-lg border border-trust-border bg-white shadow-[var(--shadow-trust-card)]">
            <CampaignCover
              imageUrl={campaign.image_url}
              title={campaign.title}
              className="h-36 w-full sm:h-40"
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

              <div className="mt-5">
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
                    {formatCampaignProgressPercent(progressPct)}%
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

          <aside className="flex flex-col gap-4">
            {canShowDonate ? (
              <Panel title="Dukung campaign ini">
                <p className="text-xs text-zinc-500">
                  Hingga Rp {formatAmount(campaign.max_donation)} per donasi
                </p>
                <ButtonLink
                  to={`/campaigns/${id}/donate`}
                  block
                  className="mt-4"
                >
                  Donasi sekarang
                </ButtonLink>
              </Panel>
            ) : null}

            {isOrganizerView ? (
              <Panel title="Tampilan pengelola">
                <p className="text-sm text-zinc-600">
                  Pantau donasi masuk dari menu utama atau bagikan tautan campaign ke
                  calon donatur.
                </p>
                <ButtonLink
                  to="/organizer/donations"
                  variant="secondary"
                  block
                  className="mt-4"
                >
                  {NAV.incomingDonations}
                </ButtonLink>
              </Panel>
            ) : null}

            {!canShowDonate && !isOrganizerView ? (
              <Panel title="Ingin berdonasi?">
                {!user ? (
                  <p className="text-sm text-zinc-600">
                    <Link to="/login" className="font-semibold text-trust-primary">
                      Masuk
                    </Link>{' '}
                    untuk mengirim donasi.
                  </p>
                ) : campaign.status !== 'active' ? (
                  <p className="text-sm text-zinc-600">
                    Campaign ini tidak menerima donasi baru saat ini.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600">
                    Gunakan akun donatur untuk mengirim donasi.
                  </p>
                )}
              </Panel>
            ) : null}
          </aside>
        </div>

        <section
          className={`tg-panel flex flex-col overflow-hidden ${
            tab === 'about' ? 'min-h-0 flex-1' : 'shrink-0'
          }`}
        >
          <div className="shrink-0 border-b border-trust-border bg-[#fafafa] px-4 py-3 sm:px-5">
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
          </div>

          <div
            className={
              tab === 'about'
                ? 'flex min-h-0 flex-1 basis-0 flex-col overflow-hidden pb-3'
                : 'pb-3'
            }
          >
          {tab === 'about' ? (
            <div className="tg-scroll-y min-h-0 flex-1 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-900">Tentang campaign</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {campaign.description || 'Belum ada deskripsi.'}
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
            </div>
          ) : null}

          {tab === 'donations' ? (
            donations.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-500">
                Belum ada donasi untuk campaign ini.
              </p>
            ) : (
              <DataTable
                variant="embedded"
                data={donations}
                rowKey={(d) => d.id}
                minWidth="640px"
                pageSizeStorageKey="campaign-detail:donations"
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
                    render: (donation) => formatDateTime(donation.created_at),
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
                      <button
                        type="button"
                        className={verifyLinkClass}
                        onClick={() => openVerifyModal(donation.id)}
                      >
                        Lihat bukti
                      </button>
                    ),
                  },
                ]}
              />
            )
          ) : null}

          {tab === 'transparency' ? (
            <div>
              <div className="border-b border-zinc-100 px-4 py-2 sm:px-5">
                <h2 className="text-sm font-semibold text-zinc-900">Transparansi</h2>
                <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                  Bukti dan transaksi donasi dapat dilacak untuk audit.
                </p>
              </div>
              {donations.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-500 sm:px-5">
                  Belum ada data donasi.
                </p>
              ) : (
                  <DataTable
                    variant="embedded"
                    data={donations}
                    rowKey={(d) => d.id}
                    minWidth="640px"
                    pageSizeStorageKey="campaign-detail:transparency"
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
                          <button
                            type="button"
                            className={verifyLinkClass}
                            onClick={() => openVerifyModal(d.id)}
                          >
                            Publik
                          </button>
                        ),
                      },
                    ]}
                  />
              )}
            </div>
          ) : null}
          </div>
        </section>
      </div>

      {isOwner ? (
        <EditCampaignModal
          open={editModalOpen}
          campaign={campaign}
          onClose={() => setEditModalOpen(false)}
          onUpdated={(updated) => setCampaign(updated)}
        />
      ) : null}

      <VerifyDonationModal
        open={verifyDonationId !== null}
        donationId={verifyDonationId}
        onClose={() => setVerifyDonationId(null)}
        currentCampaignId={id}
      />
    </PageShell>
  );
}
