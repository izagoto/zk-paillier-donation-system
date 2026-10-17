import { useState, type FormEvent } from 'react';
import { apiRequest, type Campaign } from '../../api/client';
import {
  FormField,
  TextArea,
  TextInput,
} from '../workspace/FormField';
import { Modal } from '../workspace/Modal';
import { formatAmount, parseAmountInput } from '../../lib/format';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (campaign: Campaign) => void;
};

export function CreateCampaignModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [maxDonation, setMaxDonation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setMaxDonation('');
    setImageUrl('');
    setCategory('');
    setLocation('');
    setError('');
    setLoading(false);
  }

  function handleClose() {
    if (loading) {
      return;
    }
    reset();
    onClose();
  }

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
          image_url: imageUrl,
          category,
          location,
        },
      });
      reset();
      onCreated?.(campaign);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat campaign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Buat campaign"
      description="Tetapkan target, deskripsi, dan batas maksimal donasi per transaksi."
      size="xl"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Judul campaign">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bantuan Pendidikan Desa X"
              required
              disabled={loading}
            />
          </FormField>
          <FormField label="URL gambar (opsional)">
            <TextInput
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              disabled={loading}
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Deskripsi">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ceritakan tujuan dan penggunaan dana secara singkat."
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField label="Kategori">
            <TextInput
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Pendidikan, kesehatan, …"
              disabled={loading}
            />
          </FormField>
          <FormField label="Lokasi">
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Kota atau wilayah"
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Target donasi (Rp)"
            hint="Total yang ingin dikumpulkan."
          >
            <TextInput
              value={targetAmount}
              onChange={(e) => setTargetAmount(formatAmount(e.target.value))}
              inputMode="numeric"
              placeholder="50.000.000"
              required
              disabled={loading}
            />
          </FormField>
          <FormField
            label="Maksimal per donasi (Rp)"
            hint="Batas satu kali donasi."
          >
            <TextInput
              value={maxDonation}
              onChange={(e) => setMaxDonation(formatAmount(e.target.value))}
              inputMode="numeric"
              placeholder="5.000.000"
              required
              disabled={loading}
            />
          </FormField>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-trust-border pt-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="tg-btn tg-btn--secondary"
          >
            Batal
          </button>
          <button type="submit" disabled={loading} className="tg-btn tg-btn--primary">
            {loading ? 'Menyimpan…' : 'Publikasikan campaign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
