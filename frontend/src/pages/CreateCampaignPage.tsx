import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, type Campaign } from '../api/client';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field, Input, Textarea } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { formatAmount, parseAmountInput } from '../lib/format';

export function CreateCampaignPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [maxDonation, setMaxDonation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const campaign = await apiRequest<Campaign>('/api/campaigns', {
        method: 'POST',
        auth: true,
        body: {
          title,
          description,
          target_amount: parseAmountInput(targetAmount),
          max_donation: parseAmountInput(maxDonation),
        },
      });
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat campaign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--narrow">
      <PageHeader
        title="Buat campaign baru"
        description="Batas maksimal donasi akan didaftarkan ke smart contract DonationRegistry pada jaringan demo."
      />

      <Card title="Informasi campaign" subtitle="Semua field wajib diisi.">
        <form className="form-stack" onSubmit={onSubmit}>
          <Field label="Judul campaign">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bantuan Pendidikan Desa X"
              required
            />
          </Field>
          <Field label="Deskripsi">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Ceritakan tujuan dan penggunaan dana secara singkat."
            />
          </Field>
          <div className="form-row">
            <Field
              label="Target donasi (Rp)"
              hint="Total yang ingin dikumpulkan (satuan integer)."
            >
              <Input
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(formatAmount(e.target.value))
                }
                inputMode="numeric"
                placeholder="50.000.000"
                required
              />
            </Field>
            <Field
              label="Maksimal per donasi (Rp)"
              hint="Digunakan sebagai batas proof zk-SNARK."
            >
              <Input
                value={maxDonation}
                onChange={(e) =>
                  setMaxDonation(formatAmount(e.target.value))
                }
                inputMode="numeric"
                placeholder="5.000.000"
                required
              />
            </Field>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div className="form-actions">
            <Link to="/campaigns" className="link-btn link-btn--ghost">
              Batal
            </Link>
            <Button type="submit" loading={loading}>
              Publikasikan campaign
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
