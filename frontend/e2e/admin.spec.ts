import { expect, test } from '@playwright/test';
import { STORAGE } from '../src/lib/storageKeys';

test.describe('T-ADMIN-06: admin console access', () => {
  test('admin reaches dashboard; standard user blocked', async ({ page }) => {
    test.setTimeout(60_000);
    const email = `admin-e2e-${Date.now()}@intentdraft.local`;
    const password = 'testpass1';

    await page.goto('/#/register');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).first().fill(password);
    await page.getByLabel(/display|nome/i).fill('E2E Admin');
    await page.getByRole('button', { name: /registr|register|crea/i }).click();
    await expect(page).toHaveURL(/#\/app/, { timeout: 20_000 });

    await page.evaluate(
      ({ storageKey }) => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          state: { currentUser: { role: string }; users: { role: string }[] };
        };
        parsed.state.currentUser.role = 'admin';
        parsed.state.users = parsed.state.users.map((u) => ({ ...u, role: 'admin' }));
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      },
      { storageKey: STORAGE.auth },
    );
    await page.reload();
    await expect(page).toHaveURL(/#\/app/, { timeout: 15_000 });

    await page.goto('/#/app/admin');
    await expect(page.getByRole('heading', { name: /console|amministrazione|admin/i })).toBeVisible({
      timeout: 10_000,
    });

    await page.evaluate(
      ({ storageKey }) => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          state: { currentUser: { role: string }; users: { role: string }[] };
        };
        parsed.state.currentUser.role = 'user';
        parsed.state.users = parsed.state.users.map((u) => ({ ...u, role: 'user' }));
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      },
      { storageKey: STORAGE.auth },
    );
    await page.goto('/#/app/admin');
    await expect(page).toHaveURL(/#\/app\/?$/, { timeout: 10_000 });
  });
});
