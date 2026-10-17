import { test, expect } from '@playwright/test';

test.describe('API via proxy @integration', () => {
  test.beforeEach(() => {
    test.skip(
      process.env.E2E_EXPECT_BACKEND !== '1',
      'Set E2E_EXPECT_BACKEND=1 dengan backend di :8080 dan dev server proxy aktif',
    );
  });

  test('health ready', async ({ request }) => {
    const response = await request.get('/health/ready');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('up');
  });
});
