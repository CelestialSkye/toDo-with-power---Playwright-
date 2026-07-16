import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('main page has no critical/serious a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Ask power anything').waitFor();

    // Scan with a task row present — task-item markup (drag handles, action
    // buttons) is only rendered when tasks exist, and scanning an empty list
    // previously hid real violations in it.
    const probeTask = `A11y scan probe ${Date.now()}`;
    await page.getByPlaceholder('Enter something...').fill(probeTask);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByText(probeTask).waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Clean up the probe task before asserting so a failure doesn't leak it.
    await page
      .getByTestId('task-item')
      .filter({ hasText: probeTask })
      .getByRole('button', { name: 'Delete' })
      .click({ timeout: 5_000 })
      .catch(() => {});

    const seriousOrWorse = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (seriousOrWorse.length > 0) {
      console.log(JSON.stringify(seriousOrWorse, null, 2));
    }

    expect(seriousOrWorse).toEqual([]);
  });
});
