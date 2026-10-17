/** Default: tab detail campaign, transparansi, dll. */
export const VISIBLE_BODY_ROWS = 5;

/** Halaman Campaign saya (`/campaigns?mine=1`). */
export const VISIBLE_BODY_ROWS_MY_CAMPAIGNS = 6;

/** Menu Donasi masuk organizer (`/organizer/donations`). */
export const VISIBLE_BODY_ROWS_ORGANIZER_LIST = 7;

/** Riwayat donasi donatur (`/donor/donations`). */
export const VISIBLE_BODY_ROWS_MY_DONATIONS = 10;

/** Scroll vertikal jika halaman ini menampilkan lebih dari ambang baris. */
export function shouldScrollTableBody(
  rowCountOnPage: number,
  visibleBodyRows: number = VISIBLE_BODY_ROWS,
): boolean {
  return rowCountOnPage > visibleBodyRows;
}

