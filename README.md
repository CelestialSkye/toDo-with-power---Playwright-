# List Locker QA Suite

![Playwright Tests](https://github.com/CelestialSkye/toDo-with-power---Playwright-/actions/workflows/playwright.yml/badge.svg)

Manual and automated testing suite for [List Locker](https://list-locker.net) —
a todo app featuring Power from Chainsaw Man as an AI assistant.

## Project Overview

List Locker is a full-stack todo application with AI integration. Users can manage
tasks and interact with Power, an AI assistant built on LLaMA via Groq, who reacts
to tasks and can create new ones through chat.

## Test Coverage

### Manual Testing

- 45 test cases across 4 feature areas
- Executed in Qase with full pass/fail documentation
- 1 test blocked by design (AI memory limited to last 5-10 messages — intentional token management)

### Automated Testing

- Playwright + TypeScript automation suite
- Covers Task Management, AI Chat, AI Actions, error/rate-limit handling, and accessibility
- Tests run against live production environment
- Cross-browser CI on every push/PR (Chromium + Firefox, run in a parallel matrix)

### Feature Areas Tested

Task Management → add, edit, delete, complete tasks
AI Chat → message sending, order, history, empty input
AI Actions → AI-triggered task creation, persistence
Memory & Context → conversation history, refresh behavior
Error Handling → chat API rate limiting (per-minute throttle and daily quota exhaustion)
Accessibility → automated WCAG 2 A/AA scans (axe-core) on the main page

## Bugs Found

| ID      | Title                                                                             | Severity | Status |
| ------- | ---------------------------------------------------------------------------------- | -------- | ------ |
| BUG-001 | API rate limit (429) not handled gracefully in chat                                | High     | Fixed  |
| BUG-002 | Rate-limit message didn't scale wait time for daily quota vs. per-minute throttle   | Medium   | Fixed  |
| BUG-003 | Quota-exhausted wording missing from the visible error banner (only reached the hidden chat log) | Medium | Fixed |
| BUG-004 | Power avatar images missing `alt` text (WCAG 2 A, critical)                        | High     | Fixed  |
| BUG-005 | Icon-only chat toggle button had no accessible name (WCAG 2 A, critical)           | High     | Fixed  |
| BUG-006 | Chat placeholder text failed WCAG AA color contrast (4.39:1, needed 4.5:1)          | Medium   | Fixed  |

Each fix above shipped with a Playwright regression test that failed against the bug and passes against the fix, verified live on production.

## CI Performance

Migrated GitHub Actions from a single sequential job (both browsers in one runner) to a parallel matrix (one job per browser). Measured wall-clock CI time dropped from 5m15s to 3m19s (~37% faster), with failures now isolated per browser instead of one shared job.

## Tools Used

| Tool                    | Purpose                             |
| ----------------------- | ------------------------------------ |
| Playwright + TypeScript | Test automation                     |
| @axe-core/playwright    | Automated accessibility (WCAG) scans |
| GitHub Actions          | CI, parallel cross-browser matrix   |
| Qase                    | Test case management and execution  |
| Jira                    | Bug tracking                        |
| Browser DevTools        | Console monitoring, DOM inspection  |
| Postman                 | API exploration                     |

## How to Run Automated Tests

```bash
# Install dependencies
npm install

# Run all tests with UI
npx playwright test --ui

# Run specific feature file
npx playwright test task-management.spec.ts --ui

# Run headless and view report
npx playwright test
npx playwright show-report
```

## Test Structure

tests/
├── task-management.spec.ts → CRUD operations
├── ai-chat.spec.ts → chat feature tests
├── ai-actions.spec.ts → AI task creation tests
├── ai-chat-rate-limit.spec.ts → rate-limit and quota-exhaustion error handling
└── accessibility.spec.ts → automated WCAG 2 A/AA scan (axe-core)

## Notes

- AI-related tests are primarily manual due to non-deterministic AI responses
- Memory limitation (5-10 messages) is by design to manage API token consumption
- App tested on Chrome and Firefox, desktop and mobile viewports
