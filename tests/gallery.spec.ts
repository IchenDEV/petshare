import { expect, test } from '@playwright/test';
import pets from '../public/pets.json' with { type: 'json' };

test('shows the character gallery and opens details', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Codex 桌面人物' })).toBeVisible();
  await expect(page.locator('.pet-card')).toHaveCount(pets.length);
  await expect(page.locator('.codex-pet').first()).toHaveCSS('--codex-pet-src', /spritesheet\.webp/);
  await expect(page.locator('.codex-pet').first()).toHaveCSS('--codex-pet-background-height', '2288px');
  await expect(page.locator('.codex-pet').first()).toHaveAttribute('data-animation', 'idle');
  const positions = new Set<string>();
  for (let index = 0; index < 12; index += 1) {
    positions.add(
      await page
        .locator('.codex-pet')
        .first()
        .evaluate((el) => getComputedStyle(el).getPropertyValue('--codex-pet-x').trim()),
    );
    await page.waitForTimeout(80);
  }
  expect(positions).not.toContain('-1152px');
  expect(positions).not.toContain('-1344px');

  await page.getByPlaceholder('搜索名字、id 或描述').fill('jobs');
  await expect(page.locator('.pet-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();

  await page.getByPlaceholder('搜索名字、id 或描述').fill('nahida');
  await expect(page.locator('.pet-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '纳西妲' })).toBeVisible();

  await page.getByRole('button', { name: '详情' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Wave' }).click();
  await expect(page.getByRole('dialog').locator('.codex-pet')).toHaveAttribute('data-animation', 'waving');
  await expect(page.getByRole('link', { name: '下载完整 zip' })).toHaveAttribute('href', '/downloads/nahida.zip');
});
