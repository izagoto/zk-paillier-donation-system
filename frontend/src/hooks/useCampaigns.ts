import { useCallback, useEffect, useState } from 'react';
import { apiRequest, type Campaign } from '../api/client';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return apiRequest<{ data: Campaign[] }>('/api/campaigns')
      .then((result) => setCampaigns(result.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Gagal memuat campaign'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { campaigns, loading, error, reload };
}
