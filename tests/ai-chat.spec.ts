import { test as base, expect } from '@playwright/test';
import { ChatPage } from './pages/chat.page';

const test = base.extend<{ chatPage: ChatPage }>({
  chatPage: async ({ page }, use) => {
    const cp = new ChatPage(page);
    await cp.goto();
    await use(cp);
  },
});

test.describe('AI Chat', () => {

  test('1# Send empty message is blocked', async ({ chatPage }) => {
    await expect(chatPage.sendButton).toBeDisabled();
  });

  test('2# Chat history visible', async ({ chatPage }) => {
     await chatPage.page.waitForTimeout(3000);
    for (let i = 1; i <= 5; i++) {
      await chatPage.sendMessage(`Test message ${i}`);
      await expect(chatPage.page.getByText(`Test message ${i}`)).toBeVisible();
    }
    await expect(chatPage.page.getByText('Test message 1')).toBeVisible();
  });

  test('3# Messages appear in correct order', async ({ chatPage }) => {
    await chatPage.page.waitForTimeout(3000);
    for (let i = 1; i <= 3; i++) {
      await chatPage.sendMessage(`Test message ${i}`);
      await expect(chatPage.page.getByText(`Test message ${i}`)).toBeVisible();
    }

    await expect(chatPage.userMessages.nth(0)).toContainText('Test message 1');
    await expect(chatPage.userMessages.nth(1)).toContainText('Test message 2');
    await expect(chatPage.userMessages.nth(2)).toContainText('Test message 3');
  });

});
