import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, type Campaign } from '../api/client';
import { CampaignCard } from '../components/CampaignCard';
import { Alert } from '../components/ui/Alert';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

export function CampaignListPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  useEffect(() => {
    apiRequest<{ data: Campaign[] }>('/api/campaigns')
      .then((result) => setCampaigns(result.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat campaign'),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return campaigns.filter((c) => c.status === 'active');
    }
    return campaigns;
  }, [campaigns, filter]);

  return (
    <div className="page">
      <PageHeader
        title="Semua campaign"
        description="Pilih campaign untuk melihat detail, riwayat donasi on-chain, dan ringkasan agregat terenkripsi."
        actions={
          user ? (
            <Link to="/campaigns/new" className="link-btn link-btn--primary">
              + Buat campaign
            </Link>
          ) : null
        }
      />

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="Filter status">
          <button
            type="button"
            className={`segmented__btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Semua ({campaigns.length})
          </button>
          <button
            type="button"
            className={`segmented__btn ${filter === 'active' ? 'is-active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Aktif ({campaigns.filter((c) => c.status === 'active').length})
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner label="Memuat daftar campaign" />
      ) : error ? (
        <Alert variant="error" title="Gagal memuat">
          {error}
        </Alert>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Tidak ada campaign</h3>
          <p>
            {filter === 'active'
              ? 'Tidak ada campaign berstatus aktif saat ini.'
              : 'Belum ada campaign terdaftar.'}
          </p>
        </div>
      ) : (
        <div className="campaign-grid">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
