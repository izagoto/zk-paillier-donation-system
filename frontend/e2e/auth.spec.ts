import { test, expect } from '@playwright/test';

const donorEmail = process.env.E2E_DONOR_EMAIL;
const donorPassword = process.env.E2E_DONOR_PASSWORD;

test.describe('login donatur @integration', () => {
  test.beforeEach(() => {
    test.skip(
      !donorEmail || !donorPassword,
      'Set E2E_DONOR_EMAIL dan E2E_DONOR_PASSWORD (backend + akun demo harus hidup)',
    );
  });

  test('login mengarah ke dashboard donatur', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(donorEmail!);
    await page.locator('input[name="password"]').fill(donorPassword!);
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page).toHaveURL(/\/donor$/);
    await expect(page.getByRole('heading', { name: /Halo,/ })).toBeVisible();
  });

  test('riwayat donasi dapat dibuka', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(donorEmail!);
    await page.locator('input[name="password"]').fill(donorPassword!);
    await page.getByRole('button', { name: 'Masuk' }).click();

    await page.getByRole('link', { name: 'Riwayat donasi' }).click();
    await expect(page).toHaveURL(/\/donor\/donations/);
    await expect(
      page.getByRole('heading', { name: 'Riwayat donasi' }),
    ).toBeVisible();
  });
});
