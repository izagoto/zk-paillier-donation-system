import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  apiRequest,
  type Donation,
  type ZKProof,
} from '../../api/client';
import {
  DonationSteps,
  type DonationStep,
} from '../DonationSteps';
import { Alert } from '../ui/Alert';
import { FormField, TextInput } from '../workspace/FormField';
import { Modal } from '../workspace/Modal';
import { formatAmount, parseAmountInput, truncateMiddle } from '../../lib/format';

const QUICK_AMOUNTS = ['50000', '100000', '250000', '500000'];

type DonateUiStep = 'amount' | 'confirm';

type Props = {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  maxDonation: string;
  onSuccess?: () => void;
};

function newIdempotencyKey() {
  return crypto.randomUUID();
}

export function DonateCampaignModal({
  open,
  onClose,
  campaignId,
  campaignTitle,
  maxDonation,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successTx, setSuccessTx] = useState('');
  const [donating, setDonating] = useState(false);
  const [donationStep, setDonationStep] = useState<DonationStep>('idle');
  const [donateUiStep, setDonateUiStep] = useState<DonateUiStep>('amount');

  function reset() {
    setAmount('');
    setError('');
    setSuccessTx('');
    setDonating(false);
    setDonationStep('idle');
    setDonateUiStep('amount');
  }

  function handleClose() {
    if (donating) {
      return;
    }
    reset();
    onClose();
  }

  async function submitDonation() {
    setError('');
    setSuccessTx('');
    setDonating(true);
    setDonationStep('proof');

    try {
      const proofPayload = await apiRequest<{
        amount: string;
        commitment: string;
        proof: ZKProof;
      }>('/api/donations/generate-proof', {
        method: 'POST',
        auth: true,
        body: {
          campaign_id: campaignId,
          amount: parseAmountInput(amount),
        },
      });

      setDonationStep('chain');

      const donation = await apiRequest<Donation>('/api/donations', {
        method: 'POST',
        auth: true,
        idempotencyKey: newIdempotencyKey(),
        body: {
          campaign_id: campaignId,
          amount: proofPayload.amount,
          commitment: proofPayload.commitment,
          proof: proofPayload.proof,
        },
      });

      setDonationStep('done');
      setSuccessTx(donation.tx_hash || '');
      onSuccess?.();
    } catch (err) {
      setDonationStep('idle');
      setError(err instanceof Error ? err.message : 'Donasi gagal');
    } finally {
      setDonating(false);
    }
  }

  function onDonateWizard(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (donateUiStep === 'amount') {
      const parsed = parseAmountInput(amount);
      if (!parsed || parsed === '0') {
        setError('Masukkan nominal donasi yang valid.');
        return;
      }
      setDonateUiStep('confirm');
      return;
    }

    void submitDonation();
  }

  const stepTitle =
    donationStep === 'done'
      ? 'Donasi berhasil'
      : donating
        ? 'Memproses donasi'
        : donateUiStep === 'confirm'
          ? 'Konfirmasi donasi'
          : 'Nominal donasi';

  const wizardSteps = [
    { key: 'amount', label: 'Nominal' },
    { key: 'confirm', label: 'Konfirmasi' },
    { key: 'process', label: 'Proses' },
  ] as const;

  function wizardClass(key: string) {
    if (key === 'amount') {
      if (donateUiStep === 'amount' && !donating) {
        return 'tg-wizard__step--active';
      }
      if (donateUiStep !== 'amount' || donating || donationStep === 'done') {
        return 'tg-wizard__step--done';
      }
    }
    if (key === 'confirm') {
      if (donateUiStep === 'confirm' && !donating) {
        return 'tg-wizard__step--active';
      }
      if (donating || donationStep === 'done') {
        return 'tg-wizard__step--done';
      }
    }
    if (key === 'process' && (donating || donationStep === 'done')) {
      return donationStep === 'done' ? 'tg-wizard__step--done' : 'tg-wizard__step--active';
    }
    return '';
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={stepTitle}
      description={`${campaignTitle} · Maks. Rp ${formatAmount(maxDonation)} per transaksi`}
      size="lg"
    >
      {!donating && donationStep !== 'done' ? (
        <ol className="tg-wizard" aria-label="Langkah donasi">
          {wizardSteps.map((s) => (
            <li key={s.key} className={`tg-wizard__step ${wizardClass(s.key)}`}>
              {s.label}
            </li>
          ))}
        </ol>
      ) : null}

      <form className="space-y-4" onSubmit={onDonateWizard}>
        {donateUiStep === 'amount' && !donating && donationStep !== 'done' ? (
          <>
            <FormField label="Nominal (Rp)" hint="Pilih atau ketik nominal.">
              <div className="tg-chips">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`tg-chip ${
                      parseAmountInput(amount) === value ? 'tg-chip--selected' : ''
                    }`}
                    onClick={() => setAmount(formatAmount(value))}
                  >
                    Rp {formatAmount(value)}
                  </button>
                ))}
              </div>
              <TextInput
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                inputMode="numeric"
                placeholder="100.000"
                required
              />
            </FormField>
            <button type="submit" className="tg-btn tg-btn--primary tg-btn--block">
              Lanjut ke konfirmasi
            </button>
          </>
        ) : null}

        {donateUiStep === 'confirm' && !donating && donationStep !== 'done' ? (
          <>
            <div className="tg-confirm">
              <p className="text-xs font-medium uppercase tracking-wide text-trust-muted">
                Anda akan mendonasi
              </p>
              <p className="tg-confirm__value">
                Rp {formatAmount(parseAmountInput(amount))}
              </p>
              <p className="mt-2 text-xs text-trust-muted">
                Setelah konfirmasi, donasi akan diverifikasi dan dicatat. Anda dapat
                memantau statusnya di riwayat donasi.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="tg-btn tg-btn--secondary flex-1"
                onClick={() => setDonateUiStep('amount')}
              >
                Ubah nominal
              </button>
              <button type="submit" className="tg-btn tg-btn--primary flex-1">
                Konfirmasi & kirim
              </button>
            </div>
          </>
        ) : null}

        {donating || donationStep === 'done' ? (
          <DonationSteps step={donationStep} />
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}
        {successTx ? (
          <Alert variant="success" title="Donasi berhasil">
            Transaksi:{' '}
            <code className="font-mono text-xs">{truncateMiddle(successTx, 12, 10)}</code>.
            Lihat juga di{' '}
            <Link to="/donor/donations">riwayat donasi</Link>.
          </Alert>
        ) : null}

        {donationStep === 'done' ? (
          <button
            type="button"
            onClick={handleClose}
            className="tg-btn tg-btn--secondary tg-btn--block"
          >
            Tutup
          </button>
        ) : null}
      </form>
    </Modal>
  );
}
