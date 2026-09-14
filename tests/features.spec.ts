import { test, expect } from '@playwright/test';

async function openMoment(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#light-diya')).toBeEnabled({ timeout: 30000 });
  await page.locator('#open-moment').click();
  await expect(page.getByRole('heading', { name: 'Make this moment yours.' })).toBeVisible();
}

test('private intention persists only on opt-in and can be cleared', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openMoment(page);
  await page.screenshot({ path: 'test-results/your-moment.png' });
  await page.getByRole('button', { name: /Set an intention/ }).click();
  await page.getByLabel('Your intention', { exact: true }).fill('Make room for family & <kindness>.');
  await expect(page.getByLabel('Remember on this device')).not.toBeChecked();
  await page.getByRole('button', { name: /Keep my intention/ }).click();
  await expect(page.locator('.saved-intention p')).toHaveText('Make room for family & <kindness>.');
  expect(await page.evaluate(() => localStorage.getItem('ganesh.private-intention.v1'))).toBeNull();
  await page.reload();
  await expect(page.locator('#light-diya')).toBeEnabled();
  await page.locator('#open-moment').click();
  await expect(page.locator('.saved-intention')).not.toBeVisible();
  await page.getByRole('button', { name: /Set an intention/ }).click();
  await page.getByLabel('Your intention', { exact: true }).fill('Begin with patience.');
  await page.getByLabel('Remember on this device').check();
  await page.getByRole('button', { name: /Keep my intention/ }).click();
  await page.reload();
  await expect(page.locator('#light-diya')).toBeEnabled();
  await page.locator('#open-moment').click();
  await expect(page.locator('.saved-intention p')).toHaveText('Begin with patience.');
  await page.getByRole('button', { name: /Revisit your intention/ }).click();
  await page.getByRole('button', { name: 'Clear intention' }).click();
  expect(await page.evaluate(() => localStorage.getItem('ganesh.private-intention.v1'))).toBeNull();
});

test('guided minute pauses, resumes, completes and restores the shrine', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openMoment(page);
  await page.clock.install();
  await page.getByRole('button', { name: /One quiet minute/ }).click();
  await expect(page.locator('#experience')).toHaveClass(/is-focus/);
  await page.clock.fastForward(16000);
  await expect(page.locator('#minute-title')).toHaveText('Notice');
  await page.screenshot({ path: 'test-results/quiet-minute.png' });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const remaining = await page.locator('.minute-seconds').textContent();
  await page.clock.fastForward(20000);
  await expect(page.locator('.minute-seconds')).toHaveText(remaining!);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.clock.fastForward(45000);
  await expect(page.locator('#minute-title')).toHaveText('Carry this calm with you.');
  await page.getByRole('button', { name: 'Return to the shrine', exact: true }).click();
  await expect(page.locator('#experience')).not.toHaveClass(/is-focus/);
  await expect(page.locator('#offer-flower')).toBeVisible();
});

test('card downloads as a PNG and keeps private intention excluded by default', async ({ page }) => {
  await openMoment(page);
  await page.getByRole('button', { name: /Set an intention/ }).click();
  await page.getByLabel('Your intention', { exact: true }).fill('Be kind to myself.');
  await page.getByRole('button', { name: /Keep my intention/ }).click();
  await page.getByRole('button', { name: /Keep a blessing/ }).click();
  await expect(page.getByLabel('Include my private intention on the card')).not.toBeChecked();
  await expect(page.locator('.card-intention')).not.toBeVisible();
  await page.getByLabel('Include my private intention on the card').check();
  await expect(page.locator('.card-intention')).toHaveText('Be kind to myself.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download blessing/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('a-blessing-from-ganesh.png');
  await download.saveAs('test-results/blessing-card.png');
  await expect(page.locator('#card-status')).toContainText('Your card is ready');
});

test.describe('mobile features', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('guide, focus view and dialog keyboard dismissal', async ({ page }) => {
    await openMoment(page);
    await page.screenshot({ path: 'test-results/mobile-moment.png' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: /Discover the shrine/ }).click();
    await expect(page.getByRole('link', { name: 'Smithsonian' })).toHaveAttribute('href', /asia.si.edu/);
    await page.getByRole('button', { name: /Look closer at the shrine/ }).click();
    await expect(page.locator('#experience')).toHaveClass(/is-focus/);
    await page.getByRole('button', { name: /Return to the shrine/ }).click();
    await page.locator('#open-moment').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.feature-dialog')).not.toBeVisible();
    await expect(page.locator('#open-moment')).toBeFocused();
  });
});
