import { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly userMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.getByPlaceholder('Ask power anything');
    this.sendButton = page.getByRole('button', { name: 'Send message' });
    this.userMessages = page.locator('div.self-end');
  }

  async goto() {
    await this.page.goto('/');
    await this.chatInput.waitFor();
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text);
    await this.sendButton.click();
  }
}
