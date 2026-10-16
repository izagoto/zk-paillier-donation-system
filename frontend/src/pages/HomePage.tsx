import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiRequest, type Campaign } from '../api/client';
import { CampaignCard } from '../components/CampaignCard';
import { ButtonLink } from '../components/workspace/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useCampaignAggregates } from '../hooks/useCampaignAggregates';
import { getPostLoginPath } from '../lib/flow';

const BENEFITS = [
  {
    title: 'Jejak donasi yang dapat ditelusuri',
    text: 'Setiap donasi meninggalkan catatan on-chain sehingga Anda bisa memverifikasi bahwa transaksi benar-benar terjadi.',
  },
  {
    title: 'Privasi nominal donatur',
    text: 'Nominal per donasi tidak perlu dipublikasikan; platform tetap menghitung total terkumpul secara aman.',
  },
  {
    title: 'Aturan campaign yang jelas',
    text: 'Batas donasi dan target campaign ditegakkan sistem agar donatur dan pengelola berada pada aturan yang sama.',
  },
];

export function HomePage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ data: Campaign[] }>('/api/campaigns')
      .then((result) => setCampaigns(result.data.slice(0, 3)))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const campaignIds = useMemo(() => campaigns.map((c) => c.id), [campaigns]);
  const { aggregates } = useCampaignAggregates(campaignIds);

  if (user) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

  return (
    <div className="pb-16">
      <section className="border-b border-trust-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm text-zinc-500">Platform donasi TrustGive</p>
          <h1 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Donasi yang transparan untuk pengelola, nyaman untuk donatur
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
            Kelola campaign, terima donasi, dan pantau perkembangan dalam satu workspace.
            Donatur dapat memilih campaign, mengirim donasi, dan melihat status donasi mereka.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink to="/campaigns">Jelajahi campaign</ButtonLink>
            <ButtonLink to="/login" variant="secondary">Masuk</ButtonLink>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-zinc-200 pt-8 text-sm">
            <div>
              <dt className="text-zinc-500">Campaign terdaftar</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-zinc-900">
                {campaigns.length}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Sedang berjalan</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-zinc-900">
                {activeCount}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-base font-semibold text-zinc-900">Mengapa TrustGive</h2>
        <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
          {BENEFITS.map((item) => (
            <li key={item.title} className="py-4 sm:flex sm:gap-8">
              <span className="shrink-0 text-sm font-medium text-zinc-900 sm:w-56">
                {item.title}
              </span>
              <p className="mt-1 text-sm text-zinc-600 sm:mt-0">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-trust-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Sudah punya akun?</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Masuk untuk mengelola campaign atau mengirim donasi.
              </p>
            </div>
            <ButtonLink to="/login" className="shrink-0">
              Masuk
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Campaign terbaru</h2>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-trust-primary hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        {loading ? (
          <Spinner label="Memuat campaign" />
        ) : campaigns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-trust-border bg-white px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">Belum ada campaign aktif.</p>
            <ButtonLink to="/login" variant="secondary" className="mt-4">
              Masuk untuk membuat campaign
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                aggregate={aggregates[campaign.id]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
