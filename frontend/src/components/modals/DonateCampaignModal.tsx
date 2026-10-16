import { DonateCampaignForm } from '../DonateCampaignForm';
import { Modal } from '../workspace/Modal';
import { formatAmount } from '../../lib/format';

type Props = {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  maxDonation: string;
  onSuccess?: () => void;
};

export function DonateCampaignModal({
  open,
  onClose,
  campaignId,
  campaignTitle,
  maxDonation,
  onSuccess,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Donasi"
      description={`${campaignTitle} · Maks. Rp ${formatAmount(maxDonation)} per transaksi`}
      size="lg"
    >
      <DonateCampaignForm
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        maxDonation={maxDonation}
        onSuccess={() => onSuccess?.()}
      />
    </Modal>
  );
}
