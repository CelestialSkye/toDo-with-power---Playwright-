import { test as base, expect } from '@playwright/test';
import { ChatPage } from './pages/chat.page';

const test = base.extend<{ chatPage: ChatPage }>({
  chatPage: async ({ page }, use) => {
    const cp = new ChatPage(page);
    await cp.goto();
    await use(cp);
  },
});

const AI_RESPONSE_TIMEOUT = 15_000;

test.describe('AI Actions', () => {

  test('1# AI adds task with special characters', async ({ chatPage }) => {
    await chatPage.page.waitForTimeout(3000);
    await chatPage.sendMessage('!@#$%^&*');
    await expect(
      chatPage.page.locator('div[role="button"]').filter({ hasText: '!@#$%^&*()' })
    ).toBeVisible({ timeout: AI_RESPONSE_TIMEOUT });
  });

  test('2# AI added task immediately appears', async ({ chatPage }) => {
    await chatPage.page.waitForTimeout(3000);
    await chatPage.sendMessage('Power add a task to buy milk');
    await expect(
      chatPage.page.locator('div[role="button"]').filter({ hasText: 'Power add a task to buy milk' })
    ).toBeVisible({ timeout: AI_RESPONSE_TIMEOUT });
  });

});
