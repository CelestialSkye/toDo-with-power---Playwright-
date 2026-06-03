import { test as base, expect } from '@playwright/test';
import { TaskPage } from './pages/task.page';

const test = base.extend<{ taskPage: TaskPage }>({
  taskPage: async ({ page }, use) => {
    const tp = new TaskPage(page);
    await tp.goto();
    await use(tp);
  },
});

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

test.describe('Task Management - Add Task', () => {

  test('Adding a task', async ({ taskPage }) => {
    await taskPage.addTask('Buy milk');
    await expect(taskPage.taskText('Buy milk')).toBeVisible();
  });

  test('Adding an empty task is blocked', async ({ taskPage }) => {
    const countBefore = await taskPage.taskItems.count();
    await taskPage.addTask('');
    expect(await taskPage.taskItems.count()).toBe(countBefore);
  });

  test('Add task with whitespace only', async ({ taskPage }) => {
    const countBefore = await taskPage.taskItems.count();
    await taskPage.addTask(' ');
    expect(await taskPage.taskItems.count()).toBe(countBefore);
  });

  test('Add task with special characters', async ({ taskPage }) => {
    await taskPage.addTask('!@#$%^&*()');
    await expect(taskPage.taskText('!@#$%^&*()')).toBeVisible();
  });

  test('Add a very long name', async ({ taskPage }) => {
    await taskPage.addTask(LONG_TEXT);
    await expect(taskPage.taskText(LONG_TEXT)).toBeVisible();
  });

  test('Add multiple tasks', async ({ taskPage }) => {
    for (let i = 1; i <= 5; i++) {
      await taskPage.addTask(`Task ${i}`);
      await expect(taskPage.taskText(`Task ${i}`)).toBeVisible();
    }
  });

});

test.describe('Task Management - Delete Task', () => {

  test.beforeEach(async ({ taskPage }) => {
    await taskPage.addTask('Buy milk');
  });

  test('Delete single task', async ({ taskPage }) => {
    await taskPage.deleteTask('Buy milk');
    await expect(taskPage.taskText('Buy milk')).not.toBeVisible();
  });

  test('Delete all tasks', async ({ taskPage }) => {
    await taskPage.deleteAll();
    await expect(taskPage.taskText('Buy milk')).not.toBeVisible();
  });

  test('Deleted task does not reappear on refresh', async ({ taskPage }) => {
    await taskPage.deleteTask('Buy milk');
    await expect(taskPage.taskText('Buy milk')).not.toBeVisible();
    await taskPage.reload();
    await expect(taskPage.taskText('Buy milk')).not.toBeVisible();
  });

  test('Delete one of multiple tasks', async ({ taskPage }) => {
    await taskPage.addTask('Buy food');

    await taskPage.deleteTask('Buy milk');

    await expect(taskPage.taskText('Buy milk')).not.toBeVisible();
    await expect(taskPage.taskText('Buy food')).toBeVisible();
  });

});

test.describe('Task Management - Complete Task', () => {

  test('Completed task persists after refresh', async ({ taskPage }) => {
     await taskPage.page.waitForTimeout(3000);
    await taskPage.addTask('Buy milk');
         await taskPage.page.waitForTimeout(3000);

    await expect(taskPage.taskText('Buy milk')).toBeVisible();

    await taskPage.page.locator('div[role="button"]')
      .filter({ hasText: 'Buy milk' })
      .getByRole('button', { name: 'Complete Task' })
      .click();
    await taskPage.page.waitForTimeout(3000);

    await taskPage.reload();
    await expect(
      taskPage.page.locator('div[role="button"]')
        .filter({ hasText: 'Buy milk' })
        .locator('div.rounded-full')
    ).toHaveClass(/bg-green-500/);

    await taskPage.reload();
    await expect(
      taskPage.page.locator('div[role="button"]')
        .filter({ hasText: 'Buy milk' })
        .locator('div.rounded-full')
    ).toHaveClass(/bg-green-500/);
  });

});
