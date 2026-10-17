import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import type { DonationVerification } from '../../pages/VerifyDonationPage';
import { VerifyDonationPanel } from '../VerifyDonationPanel';
import { Modal } from '../workspace/Modal';

type Props = {
  open: boolean;
  donationId: string | null;
  onClose: () => void;
  currentCampaignId?: string;
};

export function VerifyDonationModal({
  open,
  donationId,
  onClose,
  currentCampaignId,
}: Props) {
  const [data, setData] = useState<DonationVerification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !donationId) {
      return;
    }

    setData(null);
    setError('');
    setLoading(true);

    apiRequest<DonationVerification>(`/api/donations/${donationId}/verify`)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Donasi tidak ditemukan'),
      )
      .finally(() => setLoading(false));
  }, [open, donationId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verifikasi donasi"
      description="Bukti publik bahwa donasi tercatat pada campaign dan blockchain."
      size="lg"
    >
      <VerifyDonationPanel
        data={data}
        loading={loading}
        error={error}
        currentCampaignId={currentCampaignId}
      />
    </Modal>
  );
}
