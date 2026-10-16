import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, type Campaign } from '../api/client';
import { CampaignCard } from '../components/CampaignCard';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ data: Campaign[] }>('/api/campaigns')
      .then((result) => setCampaigns(result.data.slice(0, 6)))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Prototipe penelitian · Demo lokal</p>
          <h1 className="hero__title">
            Donasi yang dapat diaudit, dengan privasi nominal terbatas
          </h1>
          <p className="hero__lead">
            TrustGive menggabungkan pencatatan blockchain, enkripsi homomorfik
            Paillier, dan bukti zk-SNARK agar setiap donasi tervalidasi tanpa
            mempublikasikan nominal plaintext on-chain.
          </p>
          <div className="hero__actions">
            <Link to="/campaigns" className="link-btn link-btn--primary link-btn--lg">
              Jelajahi campaign
            </Link>
            {user ? (
              <Link to="/campaigns/new" className="link-btn link-btn--ghost link-btn--lg">
                Buat campaign baru
              </Link>
            ) : (
              <Link to="/login" className="link-btn link-btn--ghost link-btn--lg">
                Masuk untuk berdonasi
              </Link>
            )}
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Campaign terdaftar</dt>
              <dd>{campaigns.length}</dd>
            </div>
            <div>
              <dt>Sedang aktif</dt>
              <dd>{activeCount}</dd>
            </div>
            <div>
              <dt>Teknologi</dt>
              <dd>Groth16 · EVM · Paillier</dd>
            </div>
          </dl>
        </div>
        <div className="hero__visual" aria-hidden>
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__card-preview">
            <span className="hero__card-label">Agregat terenkripsi</span>
            <span className="hero__card-value">Σ E(amount)</span>
            <span className="hero__card-sub">Homomorphic sum · Paillier</span>
          </div>
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <h2>Campaign terbaru</h2>
          <Link to="/campaigns">Lihat semua</Link>
        </header>
        {loading ? (
          <Spinner label="Memuat campaign" />
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada campaign</h3>
            <p>Login dan buat campaign pertama untuk memulai demo.</p>
            <Link to={user ? '/campaigns/new' : '/login'} className="link-btn link-btn--primary">
              {user ? 'Buat campaign' : 'Masuk'}
            </Link>
          </div>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
