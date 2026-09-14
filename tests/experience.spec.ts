import { test, expect } from '@playwright/test';

test('desktop opening, rituals, blessing and replay', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('#experience')).toHaveClass(/is-intro|is-ready/, { timeout: 30000 });
  if (await page.locator('#skip-intro').isVisible()) await page.locator('#skip-intro').click();
  await expect(page.locator('#light-diya')).toBeEnabled();
  await expect(page.locator('#scene')).toHaveAttribute('data-centerpiece', 'glb');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/desktop.png' });
  await page.locator('#light-diya').click();
  await expect(page.locator('#light-diya')).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('May this light illuminate your path.');
  await page.locator('#offer-flower').click();
  await expect(page.getByRole('status')).toContainText('offering of gratitude');
  await page.locator('#seek-blessings').click();
  await expect(page.locator('#experience')).toHaveClass(/is-blessing/);
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 25000 });
  await expect(page.getByRole('dialog')).toContainText('May Lord Ganesha remove');
  await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/blessing.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.locator('#replay').click();
  await expect(page.locator('#skip-intro')).toBeVisible();
  await page.locator('#skip-intro').click();
  await expect(page.locator('#offer-flower')).toBeEnabled();
  await expect(page.locator('#light-diya')).toBeDisabled();
  await page.locator('#scene canvas').hover({ position: { x: 1000, y: 400 } });
  await page.mouse.down(); await page.mouse.move(1100, 450, { steps: 10 }); await page.mouse.up();
  expect(errors).toEqual([]);
});

test.describe('touch devices', () => {
test.use({ hasTouch: true, isMobile: true });
test('mobile and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const modelResponse = page.waitForResponse('**/models/ganesha-mobile.glb');
  await page.goto('/');
  expect((await modelResponse).ok()).toBe(true);
  await expect(page.locator('#offer-flower')).toBeEnabled({ timeout: 30000 });
  await expect(page.locator('#scene')).toHaveAttribute('data-centerpiece', 'glb');
  await expect(page.locator('#skip-intro')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile.png' });
  await page.locator('#offer-flower').click();
  await page.locator('#light-diya').click();
  await expect(page.locator('#light-diya')).toBeDisabled();
  await page.locator('#seek-blessings').click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 25000 });
  await page.getByRole('button', { name: 'Return to the shrine' }).click();
  await expect(page.locator('#offer-flower')).toBeEnabled();
});
});

test('natural opening reveals the shrine and short mobile layout stays usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('#experience')).toHaveClass(/is-intro/, { timeout: 30000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/opening.png' });
  await expect(page.locator('#offer-flower')).toBeEnabled({ timeout: 25000 });
  await page.locator('#offer-flower').scrollIntoViewIfNeeded();
  await page.locator('#offer-flower').click();
  await expect(page.getByRole('status')).toContainText('offering of gratitude');
});

test('graceful WebGL fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.fallback')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.fallback')).toContainText('Happy Ganesh Chaturthi');
});

test('unavailable GLB uses the sculpted fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/models/*.glb', route => route.fulfill({ contentType: 'model/gltf-binary', body: 'invalid model' }));
  const fallbackResponse = page.waitForResponse('**/models/ganesha-sculpture.bin');
  await page.goto('/');
  expect((await fallbackResponse).ok()).toBe(true);
  await expect(page.locator('#light-diya')).toBeEnabled({ timeout: 30000 });
  await expect(page.locator('#scene')).toHaveAttribute('data-centerpiece', 'fallback');
  await page.locator('#offer-flower').click();
  await expect(page.getByRole('status')).toContainText('offering of gratitude');
});

test('missing GLB and sculpted geometry retain the interactive fallback idol', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/models/*.glb', route => route.abort());
  await page.route('**/models/ganesha-sculpture.bin', route => route.abort());
  await page.goto('/');
  await expect(page.locator('#light-diya')).toBeEnabled({ timeout: 30000 });
  await expect(page.locator('#scene')).toHaveAttribute('data-centerpiece', 'fallback');
  await expect(page.locator('.fallback')).not.toBeVisible();
  await page.locator('#light-diya').click();
  await expect(page.getByRole('status')).toContainText('illuminate your path');
});
