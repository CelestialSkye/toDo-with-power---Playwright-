import { chromium, firefox, webkit, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const STATE_PATH = 'playwright/.auth/user.json';

// The app signs every visitor in as a brand-new anonymous Firebase user.
// Without a shared session, each test triggers its own anonymous sign-up and
// Firebase's per-IP sign-up rate limit (auth/too-many-requests) starts
// rejecting auth mid-suite, so Firestore writes silently fail and tests
// flake. Signing in once here and reusing the session (Firebase stores auth
// in IndexedDB) keeps the whole run at a single sign-up.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

  // CI matrix jobs only install their own browser, so the warm-up must use
  // the same engine as the job (PW_ENGINE is set from the matrix).
  const engines = { chromium, firefox, webkit } as const;
  const engine = engines[process.env.PW_ENGINE as keyof typeof engines] ?? chromium;

  const browser = await engine.launch();
  try {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const consoleErrors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      });
      page.on('pageerror', (e) => consoleErrors.push(e.message));
      try {
        await page.goto(baseURL);

        // "No tasks yet" renders even when auth fails, so the only reliable
        // proof the session is authenticated is a successful Firestore write:
        // add a task and wait for it to appear.
        const probeTask = `Auth warmup ${Date.now()}`;
        await page.getByPlaceholder('Enter something...').fill(probeTask);
        await page.getByRole('button', { name: 'Add Task' }).click();
        await page.getByText(probeTask).waitFor({ timeout: 30_000 });

        await context.storageState({ path: STATE_PATH, indexedDB: true });

        // Best-effort cleanup of the probe task; the state is already saved.
        await page
          .locator('div[role="button"]')
          .filter({ hasText: probeTask })
          .getByRole('button', { name: 'Delete' })
          .click({ timeout: 5_000 })
          .catch(() => {});

        await context.close();
        return;
      } catch (e) {
        lastError = e;
        console.error(`[global-setup] warm-up attempt ${attempt} failed: ${e}`);
        console.error(`[global-setup] browser console errors during attempt ${attempt}:`);
        for (const err of consoleErrors) console.error(`  ${err}`);
        await context.close();
        if (attempt < 5) {
          // Firebase's sign-up throttle needs time to cool down.
          await new Promise((r) => setTimeout(r, 30_000 * attempt));
        }
      }
    }
    throw new Error(`Anonymous auth warm-up failed after 5 attempts: ${lastError}`);
  } finally {
    await browser.close();
  }
}
