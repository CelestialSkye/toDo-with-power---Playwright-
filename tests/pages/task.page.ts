import { Page, Locator } from '@playwright/test';

export class TaskPage {
  readonly page: Page;
  readonly taskInput: Locator;
  readonly addTaskButton: Locator;
  readonly taskItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskInput = page.getByPlaceholder('Enter something...');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
    this.taskItems = page.getByTestId('task-item');
  }

  async goto() {
    await this.page.goto('/');
    await this.taskInput.waitFor();
    await this.page.waitForTimeout(3000);
  }

  async reload() {
    await this.page.reload();
    await this.taskInput.waitFor();
    await this.page.waitForTimeout(3000);
  }

  async addTask(text: string) {
    await this.taskInput.fill(text);
    await this.addTaskButton.click();
    await this.page.waitForTimeout(3000);
  }

  taskText(text: string): Locator {
    return this.page.getByText(text).first();
  }

  taskItem(text: string): Locator {
    return this.page.getByTestId('task-item').filter({ hasText: text });
  }

  async deleteTask(text: string) {
    await this.taskItem(text).getByRole('button', { name: 'Delete' }).click();
  }

  async deleteAll() {
    await this.page.getByRole('button', { name: 'Delete all' }).click();
  }

  async completeTask(text: string) {
    await this.taskItem(text).getByRole('button', { name: 'Complete Task' }).click();
    await this.page.waitForTimeout(3000);
  }

  taskCompletionDot(text: string): Locator {
    return this.taskItem(text).locator('div.rounded-full');
  }
}
