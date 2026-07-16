import { chromium, firefox, webkit, expect, type Browser, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const STATE_PATH = 'playwright/.auth/user.json';

// Proves the session can actually write to Firestore: "No tasks yet" renders
// even when auth fails, so adding a task and seeing it appear is the only
// reliable auth signal.
async function probeAuth(browser: Browser, baseURL: string, storageState?: string): Promise<boolean> {
  const context = await browser.newContext(storageState ? { storageState } : {});
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  try {
    await page.goto(baseURL);
    // The Add Task button stays disabled until Firebase auth completes —
    // clicking before that silently drops the write.
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeEnabled({ timeout: 45_000 });
    const probeTask = `Auth warmup ${Date.now()}`;
    await page.getByPlaceholder('Enter something...').fill(probeTask);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByText(probeTask).waitFor({ timeout: 30_000 });

    if (!storageState) {
      await context.storageState({ path: STATE_PATH, indexedDB: true });
    }

    // Reset the shared test user's data so it doesn't grow run over run
    // (the session is reused indefinitely via cache). Covers the probe task.
    await page.getByRole('button', { name: 'Delete all' }).click({ timeout: 5_000 }).catch(() => {});
    await page.getByRole('button', { name: 'Clear history' }).click({ timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(2_000);

    await context.close();
    return true;
  } catch (e) {
    console.error(`[global-setup] auth probe failed (${storageState ? 'cached session' : 'fresh sign-up'}): ${e}`);
    for (const err of consoleErrors) console.error(`  browser console: ${err}`);
    await context.close();
    return false;
  }
}

// The app signs every visitor in as a brand-new anonymous Firebase user.
// Without a shared session, each test triggers its own anonymous sign-up and
// Firebase's per-IP sign-up rate limit (auth/too-many-requests) starts
// rejecting auth mid-suite — GitHub's shared runner IPs are frequently
// already throttled by other projects' CI. So: reuse a previously saved
// session when one exists (CI caches playwright/.auth between runs, meaning
// steady-state runs perform ZERO sign-ups), and only sign up fresh when
// there is no valid saved session.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

  // CI matrix jobs only install their own browser, so the warm-up must use
  // the same engine as the job (PW_ENGINE is set from the matrix).
  const engines = { chromium, firefox, webkit } as const;
  const engine = engines[process.env.PW_ENGINE as keyof typeof engines] ?? chromium;

  const browser = await engine.launch();
  try {
    if (fs.existsSync(STATE_PATH)) {
      console.log('[global-setup] found saved auth session, validating...');
      if (await probeAuth(browser, baseURL, STATE_PATH)) {
        console.log('[global-setup] reusing saved session (no sign-up needed)');
        return;
      }
      console.log('[global-setup] saved session invalid, falling back to fresh sign-up');
      fs.rmSync(STATE_PATH, { force: true });
    }

    for (let attempt = 1; attempt <= 5; attempt++) {
      if (await probeAuth(browser, baseURL)) {
        console.log(`[global-setup] fresh anonymous sign-up succeeded on attempt ${attempt}`);
        return;
      }
      if (attempt < 5) {
        // Firebase's sign-up throttle needs time to cool down.
        await new Promise((r) => setTimeout(r, 30_000 * attempt));
      }
    }
    throw new Error(
      'Anonymous auth warm-up failed after 5 attempts — Firebase is likely rate-limiting sign-ups from this IP (auth/too-many-requests).'
    );
  } finally {
    await browser.close();
  }
}
