import { test, expect } from '@playwright/test';

test.describe('Task Management - Add Task', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://list-locker.net/');
    await expect(page.getByPlaceholder('Enter something...')).toBeVisible();
  });

  test('Adding a task', async ({ page }) => {
    await page.waitForTimeout(3000);
  await page.getByPlaceholder('Enter something...').fill('Buy milk');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByText('Buy milk').first()).toBeVisible({ timeout: 5000 });
});

test('Adding an empty task is blocked', async ({ page }) => {
  // Count tasks before
  const tasksBefore = await page.locator('[aria-label="task-item"]').count();


  await page.getByPlaceholder('Enter something...').fill('');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(1000);

  const tasksAfter = await page.locator('[aria-label="task-item"]').count();
  expect(tasksAfter).toBe(tasksBefore);
});

test('Add task with whitespace only', async ({ page }) => {
  // Count tasks before
  const tasksBefore = await page.locator('[aria-label="task-item"]').count();

 
  await page.getByPlaceholder('Enter something...').fill(' ');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(3000);

 
  const tasksAfter = await page.locator('[aria-label="task-item"]').count();
  expect(tasksAfter).toBe(tasksBefore);
});

test('Add task with special characters', async ({ page }) => {
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('Enter something...').fill('!@#$%^&*()');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('!@#$%^&*()')).toBeVisible({ timeout: 5000 });
});

test('Add a very long name', async ({ page }) => {
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('Enter something...').fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.')).toBeVisible({ timeout: 5000 });
});

test('Add multiple tasks', async ({ page }) => {
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('Enter something...').fill('Task 1');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter something...').fill('Task 2');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter something...').fill('Task 3');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter something...').fill('Task 4');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter something...').fill('Task 5');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByText('Task 1')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Task 2')).toBeVisible();
  await expect(page.getByText('Task 3')).toBeVisible();
  await expect(page.getByText('Task 4')).toBeVisible();
   await expect(page.getByText('Task 5')).toBeVisible();


});



});

test.describe('Task Management - Delete Task', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://list-locker.net/');
    await expect(page.getByPlaceholder('Enter something...')).toBeVisible();
    await page.getByPlaceholder('Enter something...').fill('Buy milk');
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText('Buy milk').first()).toBeVisible();
  });

  test('Delete single task', async ({ page }) => {
    await page.locator('div[role="button"]')
      .filter({ hasText: 'Buy milk' })
      .getByRole('button', { name: 'Delete' })
      .click();
    await expect(page.getByText('Buy milk')).not.toBeVisible({ timeout: 5000 });
  });

  test('Delete all tasks', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete all' }).click();
    await expect(page.getByText('Buy milk')).not.toBeVisible({ timeout: 5000 });
  });

  test('Deleted tasks does not reappear on refresh', async ({ page }) => {
    await page.locator('div[role="button"]')
      .filter({ hasText: 'Buy milk' })
      .getByRole('button', { name: 'Delete' })
      .click();
    await expect(page.getByText('Buy milk')).not.toBeVisible({ timeout: 5000 });
    await page.reload();
    await expect(page.getByText('Buy milk')).not.toBeVisible({ timeout: 5000 });
  });

  test('Delete one of multiple tasks', async ({ page }) => {
    
      await page.getByPlaceholder('Enter something...').fill('Buy food');
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.waitForTimeout(5000);
    await page.locator('div[role="button"]')
      .filter({ hasText: 'Buy milk' })
      .getByRole('button', { name: 'Delete' })
      .click();


    await expect(page.getByText('Buy milk')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Buy food')).toBeVisible({ timeout: 5000 });
  });

});


test.describe('Task Management - Complete Task', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://list-locker.net/');
    await expect(page.getByPlaceholder('Enter something...')).toBeVisible();
    await page.getByPlaceholder('Enter something...').fill('Buy milk');
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText('Buy milk').first()).toBeVisible();
  });

  test('Completed task persists after refresh', async ({ page }) => {
    await page.locator('div[role="button"]')
      .filter({ hasText: 'Buy milk' })
      .getByRole('button', { name: 'Complete Task' })
      .click();

      await page.waitForTimeout(3000);

      await page.reload();

      await expect(page.locator('div[role="button"]')
  .filter({ hasText: 'Buy milk' })
  .locator('div.rounded-full'))
  .toHaveClass(/bg-green-500/);

   await page.reload();

   await expect(page.locator('div[role="button"]')
  .filter({ hasText: 'Buy milk' })
  .locator('div.rounded-full'))
  .toHaveClass(/bg-green-500/);


  });





});

