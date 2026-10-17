import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest, type Campaign } from '../../api/client';
import { FormField, TextArea, TextInput } from '../workspace/FormField';
import { Modal } from '../workspace/Modal';

type Props = {
  open: boolean;
  campaign: Campaign;
  onClose: () => void;
  onUpdated?: (campaign: Campaign) => void;
};

export function EditCampaignModal({
  open,
  campaign,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description);
  const [status, setStatus] = useState(campaign.status);
  const [imageUrl, setImageUrl] = useState(campaign.image_url ?? '');
  const [category, setCategory] = useState(campaign.category ?? '');
  const [location, setLocation] = useState(campaign.location ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(campaign.title);
    setDescription(campaign.description);
    setStatus(campaign.status);
    setImageUrl(campaign.image_url ?? '');
    setCategory(campaign.category ?? '');
    setLocation(campaign.location ?? '');
  }, [campaign]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await apiRequest<Campaign>(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        auth: true,
        body: {
          title,
          description,
          status,
          image_url: imageUrl,
          category,
          location,
        },
      });
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kelola campaign"
      description="Perbarui informasi atau tutup campaign agar tidak menerima donasi baru."
      size="xl"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Judul">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>
          <FormField label="URL gambar (opsional)" hint="Tautan cover campaign.">
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

          <FormField label="Status">
            <select
              className="tg-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="active">Aktif — menerima donasi</option>
              <option value="closed">Ditutup — tidak menerima donasi baru</option>
            </select>
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
            onClick={onClose}
            disabled={loading}
            className="tg-btn tg-btn--secondary"
          >
            Batal
          </button>
          <button type="submit" disabled={loading} className="tg-btn tg-btn--primary">
            {loading ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
