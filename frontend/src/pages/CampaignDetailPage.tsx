import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  apiRequest,
  type AggregateSummary,
  type Campaign,
  type Donation,
  type ZKProof,
} from '../api/client';
import {
  DonationSteps,
  type DonationStep,
} from '../components/DonationSteps';
import { Alert } from '../components/ui/Alert';
import { Badge, statusTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field, Input } from '../components/ui/Field';
import { Spinner } from '../components/ui/Spinner';
import { Stat } from '../components/ui/Stat';
import { useAuth } from '../context/AuthContext';
import {
  formatAmount,
  formatDateTime,
  parseAmountInput,
  statusLabel,
  truncateMiddle,
} from '../lib/format';

function newIdempotencyKey() {
  return crypto.randomUUID();
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [aggregate, setAggregate] = useState<AggregateSummary | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successTx, setSuccessTx] = useState('');
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationStep, setDonationStep] = useState<DonationStep>('idle');

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

  async function onDonate(event: FormEvent) {
    event.preventDefault();
    if (!id || !user) {
      setError('Silakan masuk untuk berdonasi.');
      return;
    }

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
          campaign_id: id,
          amount: parseAmountInput(amount),
        },
      });

      setDonationStep('chain');

      const donation = await apiRequest<Donation>('/api/donations', {
        method: 'POST',
        auth: true,
        idempotencyKey: newIdempotencyKey(),
        body: {
          campaign_id: id,
          amount: proofPayload.amount,
          commitment: proofPayload.commitment,
          proof: proofPayload.proof,
        },
      });

      setDonationStep('done');
      setSuccessTx(donation.tx_hash || '');
      setAmount('');
      await load();
    } catch (err) {
      setDonationStep('idle');
      setError(err instanceof Error ? err.message : 'Donasi gagal');
    } finally {
      setDonating(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat detail campaign" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page">
        <Alert variant="error" title="Campaign tidak ditemukan">
          Periksa tautan atau kembali ke{' '}
          <Link to="/campaigns">daftar campaign</Link>.
        </Alert>
      </div>
    );
  }

  const raised =
    aggregate?.decrypted_total !== undefined
      ? formatAmount(aggregate.decrypted_total)
      : '—';

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/campaigns">Campaign</Link>
        <span aria-hidden>/</span>
        <span>{campaign.title}</span>
      </nav>

      <header className="detail-hero">
        <div>
          <Badge tone={statusTone(campaign.status)}>
            {statusLabel(campaign.status)}
          </Badge>
          <h1 className="detail-hero__title">{campaign.title}</h1>
          <p className="detail-hero__desc">
            {campaign.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
        <div className="detail-hero__stats">
          <Stat
            label="Terkumpul (demo)"
            value={raised === '—' ? raised : `Rp ${raised}`}
            hint="Dekripsi aggregate Paillier di server penelitian"
          />
          <Stat
            label="Donasi confirmed"
            value={String(aggregate?.donation_count ?? 0)}
          />
          <Stat
            label="Target"
            value={`Rp ${formatAmount(campaign.target_amount)}`}
          />
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <Card
            title="Riwayat donasi"
            subtitle="Commitment dan hash transaksi pada blockchain demo."
          >
            {donations.length === 0 ? (
              <div className="empty-state empty-state--compact">
                <p>Belum ada donasi untuk campaign ini.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Commitment</th>
                      <th>Tx hash</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td>
                          <Badge tone={statusTone(donation.status)}>
                            {statusLabel(donation.status)}
                          </Badge>
                        </td>
                        <td className="mono">
                          {truncateMiddle(donation.commitment, 10, 8)}
                        </td>
                        <td className="mono">
                          {donation.tx_hash
                            ? truncateMiddle(donation.tx_hash, 10, 8)
                            : '—'}
                        </td>
                        <td>{formatDateTime(donation.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card
            title="Transparansi teknis"
            subtitle="Ringkasan untuk auditor dan demo penelitian."
          >
            <ul className="check-list">
              <li>
                Batas maksimal donasi per transaksi:{' '}
                <strong>Rp {formatAmount(campaign.max_donation)}</strong>
              </li>
              <li>
                Nominal individual disimpan sebagai ciphertext Paillier di
                database dan referensi on-chain.
              </li>
              <li>
                Proof Groth16 membuktikan amount ∈ (0, campaign_max] dan
                konsistensi commitment Poseidon.
              </li>
            </ul>
          </Card>
        </div>

        <aside className="detail-aside">
          {user && campaign.status === 'active' ? (
            <Card
              title="Donasi sekarang"
              subtitle={`Maks. Rp ${formatAmount(campaign.max_donation)} per transaksi`}
              padding="md"
            >
              <form className="form-stack" onSubmit={onDonate}>
                <Field
                  label="Nominal (Rp)"
                  hint="Hanya angka; sistem akan membuat proof dan transaksi."
                >
                  <Input
                    value={amount}
                    onChange={(e) =>
                      setAmount(formatAmount(e.target.value))
                    }
                    inputMode="numeric"
                    placeholder="100.000"
                    required
                    disabled={donating}
                  />
                </Field>

                {donating || donationStep === 'done' ? (
                  <DonationSteps step={donationStep} />
                ) : null}

                {error ? <Alert variant="error">{error}</Alert> : null}
                {successTx ? (
                  <Alert variant="success" title="Donasi berhasil">
                    Transaksi:{' '}
                    <code className="mono">{truncateMiddle(successTx, 12, 10)}</code>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  loading={donating}
                  className="btn--block"
                >
                  {donating ? 'Memproses...' : 'Kirim donasi'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card title="Donasi" padding="md">
              {!user ? (
                <p>
                  <Link to="/login">Masuk</Link> untuk mengirim donasi ke
                  campaign ini.
                </p>
              ) : (
                <p>Campaign tidak aktif; donasi ditutup.</p>
              )}
            </Card>
          )}

          <Card title="Agregat Paillier" padding="md">
            <p className="muted small">
              Jumlah ciphertext yang dijumlahkan secara homomorfik.
            </p>
            <p className="mono aggregate-cipher">
              {aggregate?.encrypted_total
                ? truncateMiddle(aggregate.encrypted_total, 14, 10)
                : '0'}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
