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
    if (raised <= 0) {
      return 0;
    }
    // Hindari 0% saat sudah ada terkumpul (integer BigInt / target membulatkan ke bawah).
    const pct = (Number(raised) * 100) / Number(target);
    return Math.min(100, Math.round(pct * 10) / 10);
  } catch {
    return 0;
  }
}

/** Label persen untuk UI (satu desimal jika &lt; 10%). */
export function formatCampaignProgressPercent(pct: number): string {
  if (pct <= 0) {
    return '0';
  }
  if (pct < 10 && !Number.isInteger(pct)) {
    return pct.toFixed(1).replace('.', ',');
  }
  return String(Math.round(pct));
}
