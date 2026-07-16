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


// All tests share one authenticated session per run (see global-setup.ts),
// so task data persists across tests and retries within a run — names must
// be unique or text-based locators match leftovers from earlier tests.
const uniqueTask = (label: string) => `${label} ${Date.now()}-${Math.floor(Math.random() * 100000)}`;

test.describe('Task Management - Add Task', () => {

  test('Adding a task', async ({ taskPage }) => {
    const task = uniqueTask('Buy milk');
    await taskPage.addTask(task);
    await expect(taskPage.taskText(task)).toBeVisible();
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
    const task = uniqueTask('!@#$%^&*()');
    await taskPage.addTask(task);
    await expect(taskPage.taskText(task)).toBeVisible();
  });

  test('Add a very long name', async ({ taskPage }) => {
    const task = `${LONG_TEXT} ${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    await taskPage.addTask(task);
    await expect(taskPage.taskText(task)).toBeVisible();
  });

  test('Add multiple tasks', async ({ taskPage }) => {
    const runId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    for (let i = 1; i <= 5; i++) {
      const task = `Task ${runId} #${i}`;
      await taskPage.addTask(task);
      await expect(taskPage.taskText(task)).toBeVisible();
    }
  });

});

test.describe('Task Management - Delete Task', () => {

  let task: string;

  test.beforeEach(async ({ taskPage }) => {
    task = uniqueTask('Buy milk');
    await taskPage.addTask(task);
  });

  test('Delete single task', async ({ taskPage }) => {
    await taskPage.deleteTask(task);
    await expect(taskPage.taskText(task)).not.toBeVisible();
  });

  test('Delete all tasks', async ({ taskPage }) => {
    await taskPage.deleteAll();
    await expect(taskPage.taskText(task)).not.toBeVisible();
  });

  test('Deleted task does not reappear on refresh', async ({ taskPage }) => {
    await taskPage.deleteTask(task);
    await expect(taskPage.taskText(task)).not.toBeVisible();
    await taskPage.reload();
    await expect(taskPage.taskText(task)).not.toBeVisible();
  });

  test('Delete one of multiple tasks', async ({ taskPage }) => {
    const otherTask = uniqueTask('Buy food');
    await taskPage.addTask(otherTask);

    await taskPage.deleteTask(task);

    await expect(taskPage.taskText(task)).not.toBeVisible();
    await expect(taskPage.taskText(otherTask)).toBeVisible();
  });

});

test.describe('Task Management - Complete Task', () => {

  test('Completed task persists after refresh', async ({ taskPage }) => {
    const task = uniqueTask('Buy milk');
    await taskPage.page.waitForTimeout(3000);
    await taskPage.addTask(task);
    await taskPage.page.waitForTimeout(3000);

    await expect(taskPage.taskText(task)).toBeVisible();

    await taskPage.taskItem(task)
      .getByRole('button', { name: 'Complete Task' })
      .click();
    await taskPage.page.waitForTimeout(3000);

    await taskPage.reload();
    await expect(taskPage.taskCompletionDot(task)).toHaveClass(/bg-green-500/);

    await taskPage.reload();
    await expect(taskPage.taskCompletionDot(task)).toHaveClass(/bg-green-500/);
  });

});
