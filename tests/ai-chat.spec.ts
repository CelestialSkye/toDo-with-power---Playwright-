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
    const runId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await chatPage.page.waitForTimeout(3000);
    for (let i = 1; i <= 5; i++) {
      await chatPage.sendMessage(`History test ${runId} #${i}`);
      await expect(chatPage.page.getByText(`History test ${runId} #${i}`)).toBeVisible();
    }
    await expect(chatPage.page.getByText(`History test ${runId} #1`)).toBeVisible();
  });

  test('3# Messages appear in correct order', async ({ chatPage }) => {
    // Chat history persists across tests sharing the run's auth session
    // (see global-setup.ts), so a unique run marker keeps assertions scoped
    // to this test's own messages.
    const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await chatPage.page.waitForTimeout(3000);
    for (let i = 1; i <= 3; i++) {
      await chatPage.sendMessage(`Order test ${runId} #${i}`);
      await expect(chatPage.page.getByText(`Order test ${runId} #${i}`)).toBeVisible();
    }

    const ownMessages = chatPage.userMessages.filter({ hasText: `Order test ${runId} #` });
    await expect(ownMessages).toHaveCount(3);
    await expect(ownMessages.nth(0)).toContainText(`#1`);
    await expect(ownMessages.nth(1)).toContainText(`#2`);
    await expect(ownMessages.nth(2)).toContainText(`#3`);
  });

});
