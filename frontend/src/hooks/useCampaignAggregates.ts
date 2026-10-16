import { useEffect, useState } from 'react';
import { apiRequest, type AggregateSummary } from '../api/client';

const emptyAggregate: AggregateSummary = {
  encrypted_total: '0',
  donation_count: 0,
};

export function useCampaignAggregates(campaignIds: string[]) {
  const [aggregates, setAggregates] = useState<
    Record<string, AggregateSummary>
  >({});
  const [loading, setLoading] = useState(false);

  const key = campaignIds.join(',');

  useEffect(() => {
    if (campaignIds.length === 0) {
      setAggregates({});
      return;
    }

    setLoading(true);
    Promise.all(
      campaignIds.map((id) =>
        apiRequest<AggregateSummary>(`/api/campaigns/${id}/aggregate`)
          .then((agg) => ({ id, agg }))
          .catch(() => ({ id, agg: emptyAggregate })),
      ),
    )
      .then((rows) => {
        const next: Record<string, AggregateSummary> = {};
        for (const row of rows) {
          next[row.id] = row.agg;
        }
        setAggregates(next);
      })
      .finally(() => setLoading(false));
  }, [key]);

  return { aggregates, loading };
}
