import type { AggregateSummary, Campaign } from '../api/client';

export function campaignRaisedAmount(aggregate?: AggregateSummary | null): bigint {
  if (aggregate?.decrypted_total === undefined) {
    return BigInt(0);
  }
  try {
    return BigInt(aggregate.decrypted_total);
  } catch {
    return BigInt(0);
  }
}

export function campaignProgressPercent(
  campaign: Campaign,
  aggregate?: AggregateSummary | null,
): number {
  try {
    const target = BigInt(campaign.target_amount || '0');
    if (target <= 0) {
      return 0;
    }
    const raised = campaignRaisedAmount(aggregate);
    return Math.min(100, Number((raised * BigInt(100)) / target));
  } catch {
    return 0;
  }
}
