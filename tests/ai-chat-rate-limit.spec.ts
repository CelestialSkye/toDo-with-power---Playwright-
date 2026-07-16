import { test as base, expect } from '@playwright/test';
import { ChatPage } from './pages/chat.page';

const test = base.extend<{ chatPage: ChatPage }>({
  chatPage: async ({ page }, use) => {
    const cp = new ChatPage(page);
    await cp.goto();
    await use(cp);
  },
});


test.describe('AI Chat - rate limit handling', () => {
  test('shows a graceful message when the chat API returns 429', async ({ chatPage }) => {
    await chatPage.page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Power is overwhelmed — too many messages sent too fast. Try again shortly.',
          retryAfter: 5,
        }),
      });
    });

    await chatPage.sendMessage('Test message triggering rate limit');

    // The message renders in both the chat log and the error banner.
    await expect(
      chatPage.page.getByText(/needs a breather|too many messages sent too fast|rate limited/i).first()
    ).toBeVisible();

    await expect(
      chatPage.page.getByText('System Error: Failed to get AI response. HTTP error! Status: 429')
    ).not.toBeVisible();
  });

  test('shows a quota-exhausted message when the daily limit is fully used', async ({ chatPage }) => {
    await chatPage.page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Power has hit the daily usage limit and is out of energy. Try again later.',
          retryAfter: 3600,
          quotaExhausted: true,
        }),
      });
    });

    await chatPage.sendMessage('Test message triggering quota exhaustion');

    // The message renders in both the chat log and the error banner.
    await expect(
      chatPage.page.getByText(/daily usage limit|out of energy/i).first()
    ).toBeVisible();

    await expect(
      chatPage.page.getByText(/wait 3600s/i)
    ).not.toBeVisible();
  });
});
