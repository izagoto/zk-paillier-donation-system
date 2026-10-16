import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { apiRequest, type Campaign } from '../api/client';
import { DonateCampaignForm } from '../components/DonateCampaignForm';
import { Spinner } from '../components/ui/Spinner';
import { ButtonLink } from '../components/workspace/Button';
import { PageAlert } from '../components/workspace/PageAlert';
import { PageShell } from '../components/workspace/PageShell';
import { useAuth } from '../context/AuthContext';
import { NAV } from '../lib/navigation';
import { canDonate } from '../lib/roles';

export function DonateCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    const data = await apiRequest<Campaign>(`/api/campaigns/${id}`);
    setCampaign(data);
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }
    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat campaign'),
      )
      .finally(() => setLoading(false));
  }, [id, load]);

  if (authLoading || loading) {
    return (
      <PageShell title="Donasi">
        <Spinner label="Memuat" />
      </PageShell>
    );
  }

  if (!user || !canDonate(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (!campaign) {
    return (
      <PageShell title="Campaign tidak ditemukan">
        <PageAlert message={error || 'Campaign tidak ditemukan.'} />
        <ButtonLink to="/campaigns" className="mt-4">Ke daftar campaign</ButtonLink>
      </PageShell>
    );
  }

  if (campaign.status !== 'active') {
    return (
      <PageShell title="Donasi tidak tersedia" breadcrumb={{ entityTitle: campaign.title }}>
        <PageAlert message="Campaign ini tidak menerima donasi baru." />
        <ButtonLink to={`/campaigns/${campaign.id}`} variant="secondary" className="mt-4">
          Kembali ke detail
        </ButtonLink>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Donasi"
      breadcrumb={{ entityTitle: campaign.title }}
      subtitle={campaign.title}
    >
      <div className="mx-auto max-w-lg rounded-lg border border-trust-border bg-white p-5 shadow-[var(--shadow-trust-card)] sm:p-6">
        <ButtonLink
          to={`/campaigns/${campaign.id}`}
          variant="ghost"
          className="-mt-1 mb-4 h-9 px-0 text-sm text-zinc-600 hover:bg-transparent"
        >
          ← Kembali ke {NAV.campaignDetail}
        </ButtonLink>
        <DonateCampaignForm
          campaignId={campaign.id}
          campaignTitle={campaign.title}
          maxDonation={campaign.max_donation}
        />
      </div>
    </PageShell>
  );
}
