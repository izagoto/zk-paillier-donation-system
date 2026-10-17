import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { VerifyDonationPanel } from '../components/VerifyDonationPanel';
import { ButtonLink } from '../components/workspace/Button';
import { PageShell } from '../components/workspace/PageShell';

export type DonationVerification = {
  id: string;
  campaign_id: string;
  campaign_title: string;
  status: string;
  tx_hash: string;
  commitment: string;
  created_at: string;
};

export function VerifyDonationPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DonationVerification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiRequest<DonationVerification>(`/api/donations/${id}/verify`)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Donasi tidak ditemukan'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (!loading && !data) {
    return (
      <PageShell title="Verifikasi donasi">
        <VerifyDonationPanel data={null} loading={false} error={error} />
        <ButtonLink to="/campaigns" className="mt-4">Jelajahi campaign</ButtonLink>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Verifikasi donasi"
      subtitle="Bukti publik bahwa donasi tercatat pada campaign dan blockchain."
    >
      <div className="mx-auto max-w-xl">
        <VerifyDonationPanel data={data} loading={loading} error={error} />
      </div>
    </PageShell>
  );
}
