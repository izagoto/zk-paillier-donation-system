export function formatAmount(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '0';
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseAmountInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function truncateMiddle(value: string, start = 8, end = 6): string {
  if (value.length <= start + end + 3) {
    return value;
  }
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Aktif',
    confirmed: 'Terkonfirmasi',
    pending: 'Menunggu',
    failed: 'Gagal',
    draft: 'Draf',
  };
  return map[status] ?? status;
}
