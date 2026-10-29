import { expect, test } from '@playwright/test';

test.describe('smoke: login → chat → copia', () => {
  test('demo login, invio messaggio e copia prompt', async ({ page, context }) => {
    test.setTimeout(60_000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#/login');

    await page.getByRole('button', { name: /demo|valutazione|evaluation/i }).click();
    await expect(page).toHaveURL(/#\/app\/?$/, { timeout: 15_000 });

    const composer = page.getByPlaceholder(/scrivi|write|frase|sentences/i);
    await expect(composer).toBeVisible({ timeout: 15_000 });
    await composer.fill('organizza appunti riunione');
    await page.getByRole('button', { name: /invia|send/i }).click();

    const copyBtn = page.getByRole('button', { name: /^copia$|^copy$/i });
    await expect(copyBtn).toBeEnabled({ timeout: 25_000 });
    await copyBtn.click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.trim().length).toBeGreaterThan(20);
  });
});
