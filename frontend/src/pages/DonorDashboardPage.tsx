import { CheckCircle2, FolderHeart, Heart, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, type Campaign, type Donation } from '../api/client';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { SummaryCard } from '../components/workspace/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { NAV } from '../lib/navigation';
import { displayNameFromEmail } from '../lib/displayName';
import { formatAmount, statusLabel } from '../lib/format';

export function DonorDashboardPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    return Promise.all([
      apiRequest<{ data: Donation[] }>('/api/me/donations', { auth: true }),
      apiRequest<{ data: Campaign[] }>('/api/campaigns'),
    ])
      .then(([donationRes, campaignRes]) => {
        setDonations(donationRes.data);
        setCampaigns(campaignRes.data);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat riwayat. Pastikan backend sudah di-restart.',
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const confirmed = useMemo(
    () => donations.filter((d) => d.status === 'confirmed').length,
    [donations],
  );

  const supportedCampaignCount = useMemo(
    () => new Set(donations.map((d) => d.campaign_id)).size,
    [donations],
  );

  const totalDonated = useMemo(() => {
    let sum = 0n;
    for (const d of donations) {
      if (d.status === 'confirmed' && d.amount) {
        try {
          sum += BigInt(d.amount);
        } catch {
          /* ignore invalid */
        }
      }
    }
    return sum.toString();
  }, [donations]);

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) {
      map.set(c.id, c.title);
    }
    return map;
  }, [campaigns]);

  const featured = useMemo(
    () => campaigns.filter((c) => c.status === 'active').slice(0, 3),
    [campaigns],
  );

  const featuredIds = useMemo(() => featured.map((c) => c.id), [featured]);
  const { aggregates } = useCampaignAggregates(featuredIds);

  const greeting = user?.email
    ? `Halo, ${displayNameFromEmail(user.email)}`
    : NAV.dashboard;

  return (
    <PageShell
      title={greeting}
      subtitle="Temukan campaign yang ingin Anda dukung."
      actions={
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/campaigns" variant="secondary">
            {NAV.exploreCampaigns}
          </ButtonLink>
          <ButtonLink to="/donor/donations">
            {NAV.donationHistory}
          </ButtonLink>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {error ? <PageAlert message={error} onRetry={() => void load()} /> : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Donasi dikirim"
            value={loading ? '—' : String(donations.length)}
            icon={Heart}
            hint={`${confirmed} terkonfirmasi`}
            accent="blue"
          />
          <SummaryCard
            label="Campaign didukung"
            value={loading ? '—' : String(supportedCampaignCount)}
            icon={FolderHeart}
            accent="emerald"
          />
          <SummaryCard
            label="Total donasi"
            value={loading ? '—' : `Rp ${formatAmount(totalDonated)}`}
            icon={CheckCircle2}
            hint={`${confirmed} transaksi terkonfirmasi`}
            accent="amber"
          />
        </div>

        <Panel
          title="Campaign pilihan"
          actions={
            <ButtonLink to="/campaigns" variant="ghost" className="h-9 px-3 text-xs">
              Lihat semua
            </ButtonLink>
          }
        >
          {loading ? (
            <p className="text-sm text-trust-muted">Memuat…</p>
          ) : featured.length === 0 ? (
            <p className="text-sm text-trust-muted">
              Belum ada campaign aktif.{' '}
              <Link to="/campaigns" className="font-semibold text-trust-primary">
                {NAV.exploreCampaigns}
              </Link>
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  aggregate={aggregates[campaign.id]}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Donasi terbaru"
          titleIcon={List}
          actions={
            <ButtonLink to="/donor/donations" variant="ghost" className="h-9 px-3 text-xs">
              {NAV.donationHistory}
            </ButtonLink>
          }
        >
          {loading ? (
            <p className="text-sm text-trust-muted">Memuat…</p>
          ) : donations.length === 0 ? (
            <p className="text-sm text-trust-muted">
              Belum ada donasi.{' '}
              <Link to="/campaigns" className="font-semibold text-trust-primary">
                {NAV.exploreCampaigns}
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-trust-border text-sm">
              {donations.slice(0, 5).map((d) => (
                <li key={d.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                  <Link
                    to={`/campaigns/${d.campaign_id}`}
                    className="font-medium text-trust-primary hover:underline"
                  >
                    {titleById.get(d.campaign_id) ??
                      `Campaign ${d.campaign_id.slice(0, 8)}…`}
                  </Link>
                  <span className="text-xs text-trust-muted">
                    {statusLabel(d.status)} ·{' '}
                    {new Date(d.created_at).toLocaleString('id-ID')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
