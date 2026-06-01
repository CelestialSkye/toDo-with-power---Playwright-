import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://list-locker.net/');
    await expect(page.getByPlaceholder('Ask power anything')).toBeVisible();
  });

  test('Send empty message is blocked', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Send message' });
    
    await expect(sendButton).toBeDisabled();
  });

  test('Chat history visible', async ({ page }) => {
    await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Test message 1');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Test message 2');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Test message 3');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Test message 4');
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForTimeout(3000);
      await page.getByPlaceholder('Ask power anything').fill('Test message 5');
      await page.getByRole('button', { name: 'Send message' }).click();

        await expect (page.getByText('Test message 1')).toBeVisible({ timeout: 5000 });
    
    
  });

test('Messages appear in correct order', async ({ page }) => {
  const userMessage = page.locator('div.self-end');
await page.waitForTimeout(3000);
  // Send 3 messages
  await page.getByPlaceholder('Ask power anything').fill('Test message 1');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Test message 1')).toBeVisible({});

  await page.getByPlaceholder('Ask power anything').fill('Test message 2');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Test message 2')).toBeVisible({ });

  await page.getByPlaceholder('Ask power anything').fill('Test message 3');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Test message 3')).toBeVisible({});
await page.waitForTimeout(3000);
  // Verify order
  await expect(userMessage.nth(0)).toContainText('Test message 1');
  await expect(userMessage.nth(1)).toContainText('Test message 2');
  await expect(userMessage.nth(2)).toContainText('Test message 3');
});




});