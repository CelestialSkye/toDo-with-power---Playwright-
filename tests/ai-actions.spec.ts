import { test, expect } from '@playwright/test';

test.describe('AI Actions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://list-locker.net/');
    await expect(page.getByPlaceholder('Ask power anything')).toBeVisible();
  });


  test('AI adds task with special characters', async ({ page }) => {
    await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('!@#$%^&*');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);

       await expect(page.locator('div[role="button"]')
  .filter({ hasText: '!@#$%^&*()' }))
  .toBeVisible({ timeout: 8000 });
    
  });

  test('AI added task immediatly appears', async ({ page }) => {
    await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Power add a task to buy milk');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);

       await expect(page.locator('div[role="button"]')
  .filter({ hasText: 'Power add a task to buy milk' }))
  .toBeVisible({ timeout: 8000 });
    
  });





});