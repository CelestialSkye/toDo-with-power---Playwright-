import { test, expect } from '@playwright/test';

test.describe("toDoList feautre", () =>{
    test.beforeEach(async({page}) => {
        await page.goto('https://list-locker.net/');
        expect(page.getByText('Enter something...')).toBeVisible();
    })

      test('A task is added when typing it in the searchbar', async ({ page }) => {
    //Enter gold ship inside the search bar
  await page.getByPlaceholder('Search by name...').fill('Gold Ship');

  // Gold Ship is in the modal
  await expect(page.getByText('Gold Ship').first()).toBeVisible();
    // Other results are expected to NOT be visible
  await expect(page.getByText('Tokai Teio').first()).not.toBeVisible();

  // Silence Suzuka is no longer on the wheel
  await expect (page.locator('label').filter({hasText:'Gold Ship'})).toHaveCount(1);
});


})