import { test, expect } from '@playwright/test';
import {
  shouldScrollTableBody,
  VISIBLE_BODY_ROWS_MY_CAMPAIGNS,
  VISIBLE_BODY_ROWS_MY_DONATIONS,
  VISIBLE_BODY_ROWS_ORGANIZER_LIST,
} from '../src/lib/dataTableScroll.js';

const organizerEmail =
  process.env.E2E_ORGANIZER_EMAIL ?? 'pengelola@demo.local';
const organizerPassword =
  process.env.E2E_ORGANIZER_PASSWORD ?? 'demo12345';

test.describe('logika scroll DataTable', () => {
  test('shouldScrollTableBody: scroll hanya jika > ambang baris per halaman', () => {
    expect(shouldScrollTableBody(0)).toBe(false);
    expect(shouldScrollTableBody(2)).toBe(false);
    expect(shouldScrollTableBody(5)).toBe(false);
    expect(shouldScrollTableBody(6)).toBe(true);
    expect(shouldScrollTableBody(10)).toBe(true);

    expect(shouldScrollTableBody(6, VISIBLE_BODY_ROWS_MY_CAMPAIGNS)).toBe(false);
    expect(shouldScrollTableBody(7, VISIBLE_BODY_ROWS_MY_CAMPAIGNS)).toBe(true);

    expect(shouldScrollTableBody(7, VISIBLE_BODY_ROWS_ORGANIZER_LIST)).toBe(
      false,
    );
    expect(shouldScrollTableBody(8, VISIBLE_BODY_ROWS_ORGANIZER_LIST)).toBe(
      true,
    );

    expect(shouldScrollTableBody(10, VISIBLE_BODY_ROWS_MY_DONATIONS)).toBe(
      false,
    );
    expect(shouldScrollTableBody(11, VISIBLE_BODY_ROWS_MY_DONATIONS)).toBe(true);
  });
});

test.describe('DataTable di UI @integration', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      process.env.E2E_EXPECT_BACKEND !== '1',
      'Set E2E_EXPECT_BACKEND=1 (backend :8080 + vite proxy)',
    );

    const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
    let frontendUp = false;
    try {
      const res = await request.get(base, { timeout: 8000 });
      frontendUp = res.ok();
    } catch {
      frontendUp = false;
    }
    if (!frontendUp) {
      throw new Error(
        `Frontend tidak tersedia di ${base}.\n\n` +
          '• Opsional A — dev server sudah jalan: cd frontend && npm run dev, lalu:\n' +
          '    PLAYWRIGHT_SKIP_WEBSERVER=1 E2E_EXPECT_BACKEND=1 npm run test:e2e -- e2e/datatable.spec.ts\n\n' +
          '• Opsional B — biarkan Playwright menyalakan Vite (tanpa SKIP):\n' +
          '    E2E_EXPECT_BACKEND=1 npm run test:e2e -- e2e/datatable.spec.ts\n\n' +
          'Backend API tetap harus aktif di :8080.',
      );
    }
  });

  async function loginOrganizer(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(organizerEmail);
    await page.locator('input[name="password"]').fill(organizerPassword);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/(organizer|campaigns)/);
  }

  test('tab Donasi masuk: kelas scroll mengikuti jumlah baris', async ({
    page,
  }) => {
    await loginOrganizer(page);
    await page.goto('/campaigns?mine=1');
    await expect(page.getByRole('heading', { name: 'Campaign saya' })).toBeVisible();
    const openDetail = page.getByRole('link', { name: 'Buka detail campaign' }).first();
    await expect(openDetail).toBeVisible({ timeout: 15_000 });
    await openDetail.click();
    await expect(page).toHaveURL(/\/campaigns\/[0-9a-f-]+$/i);

    await page
      .getByRole('tablist', { name: 'Bagian campaign' })
      .getByRole('tab', { name: 'Donasi masuk' })
      .click();

    const bodyScroll = page.locator('.tg-data-table__body-scroll').first();
    await expect(bodyScroll).toBeVisible();

    const rowCount = await page
      .locator('.tg-data-table__body-scroll tbody tr')
      .count();
    const expectScroll = shouldScrollTableBody(rowCount);

    if (expectScroll) {
      await expect(bodyScroll).toHaveClass(/tg-data-table__body-scroll--paged/);
      const metrics = await bodyScroll.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    } else {
      await expect(bodyScroll).not.toHaveClass(
        /tg-data-table__body-scroll--paged/,
      );
    }
  });

  test('Campaign saya: tabel embedded tanpa ruang flex berlebihan', async ({
    page,
  }) => {
    await loginOrganizer(page);
    await page.goto('/campaigns?mine=1');

    const footer = page.locator('.tg-data-table__footer').first();
    await expect(footer).toBeVisible();

    const table = page.locator('.tg-data-table').first();
    const box = await table.boundingBox();
    const footerBox = await footer.boundingBox();
    expect(box).toBeTruthy();
    expect(footerBox).toBeTruthy();
    if (box && footerBox) {
      const gapBelowFooter = box.y + box.height - (footerBox.y + footerBox.height);
      expect(gapBelowFooter).toBeLessThan(48);
    }
  });
});
