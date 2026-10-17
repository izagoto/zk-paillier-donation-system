import { test, expect } from '@playwright/test';

test.describe('publik @public', () => {
  test('beranda menampilkan navigasi TrustGive', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Beranda' }).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Jelajahi campaign' }).first(),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible();
  });

  test('halaman login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Masuk ke TrustGive/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });

  test('jelajahi campaign', async ({ page }) => {
    await page.goto('/campaigns');
    await expect(
      page.getByRole('heading', { name: 'Jelajahi campaign' }),
    ).toBeVisible();
  });
});
