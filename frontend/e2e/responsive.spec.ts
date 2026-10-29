import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe('responsive pass (NFR-007)', () => {
  test('home e login senza scroll orizzontale', async ({ page }) => {
    await page.goto('/#/');
    await expectNoHorizontalOverflow(page);

    await page.goto('/#/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('chat mobile: menu hamburger e composer visibili', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/#/login');
    await page.getByRole('button', { name: /demo|valutazione|evaluation/i }).click();
    await expect(page).toHaveURL(/#\/app/, { timeout: 15_000 });

    await expectNoHorizontalOverflow(page);

    const menuBtn = page.getByRole('button', { name: /apri menu chat|open chat menu/i });
    await expect(menuBtn).toBeVisible();

    const newChat = page.getByRole('button', { name: /nuova chat|new chat/i }).first();
    const sidebarAlreadyOpen = await newChat.isVisible();
    if (!sidebarAlreadyOpen) {
      await menuBtn.click({ force: true });
      await expect(newChat).toBeVisible();
      const backdrop = page.locator('button.fixed.inset-0.z-40');
      if (await backdrop.isVisible()) await backdrop.click();
    }

    const composer = page.getByPlaceholder(/scrivi|write|frase|sentences/i);
    await expect(composer).toBeVisible({ timeout: 15_000 });
    await expectNoHorizontalOverflow(page);
  });
});
