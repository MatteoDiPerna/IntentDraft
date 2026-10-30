import { expect, test } from '@playwright/test';

const apiUrl = process.env.VITE_API_URL ?? 'http://127.0.0.1:3001';

test.describe('smoke-api: register → chat → prompt', () => {
  test.beforeAll(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      if (!res.ok) test.skip(true, 'Backend not reachable — start backend + frontend with VITE_USE_MOCK=false');
    } catch {
      test.skip(true, 'Backend not reachable');
    }
  });

  test('API mode chat produces copyable prompt', async ({ page, context }) => {
    test.setTimeout(90_000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const email = `e2e-${Date.now()}@smoke.intentdraft.local`;
    const password = 'testpass1';

    await page.goto('/#/register');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).first().fill(password);
    await page.getByLabel(/display|nome/i).fill('E2E User');
    await page.getByRole('button', { name: /registr|register|crea/i }).click();

    await expect(page).toHaveURL(/#\/app/, { timeout: 20_000 });

    const composer = page.getByPlaceholder(/scrivi|write|frase|sentences/i);
    await expect(composer).toBeVisible({ timeout: 15_000 });
    await composer.fill('organizza appunti riunione');
    await page.getByRole('button', { name: /invia|send/i }).click();

    const copyBtn = page.getByRole('button', { name: /^copia$|^copy$/i });
    await expect(copyBtn).toBeEnabled({ timeout: 30_000 });
    await copyBtn.click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.trim().length).toBeGreaterThan(20);
  });
});
