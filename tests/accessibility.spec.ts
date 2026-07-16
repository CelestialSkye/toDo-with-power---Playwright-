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
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeEnabled({ timeout: 45_000 });
    await page.getByPlaceholder('Enter something...').fill(probeTask);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByText(probeTask).waitFor();

    // Task rows fade in; scanning mid-animation makes axe read the
    // semi-transparent text as low-contrast (false positives like 2.7:1 on
    // text that settles at ~17:1). Freeze transitions and let in-flight
    // animations finish before scanning.
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
    await page.waitForTimeout(3_000);

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
