const PREFIX = 'trustgive.datatable.pageSize:';

export function readStoredPageSize(
  storageKey: string,
  defaultSize: number,
  allowed: readonly number[],
): number {
  try {
    const raw = sessionStorage.getItem(PREFIX + storageKey);
    if (raw === null) {
      return defaultSize;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || !allowed.includes(parsed)) {
      return defaultSize;
    }
    return parsed;
  } catch {
    return defaultSize;
  }
}

export function writeStoredPageSize(storageKey: string, size: number): void {
  try {
    sessionStorage.setItem(PREFIX + storageKey, String(size));
  } catch {
    /* quota / private mode */
  }
}
