# List Locker QA Suite

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
- Covers Task Management, AI Chat, and AI Actions
- Tests run against live production environment

### Feature Areas Tested

Task Management → add, edit, delete, complete tasks
AI Chat → message sending, order, history, empty input
AI Actions → AI-triggered task creation, persistence
Memory & Context → conversation history, refresh behavior

## Bugs Found

| ID      | Title                                               | Severity | Status |
| ------- | --------------------------------------------------- | -------- | ------ |
| BUG-001 | API rate limit (429) not handled gracefully in chat | High     | Open   |

## Tools Used

| Tool                    | Purpose                            |
| ----------------------- | ---------------------------------- |
| Playwright + TypeScript | Test automation                    |
| Qase                    | Test case management and execution |
| Jira                    | Bug tracking                       |
| Browser DevTools        | Console monitoring, DOM inspection |
| Postman                 | API exploration                    |

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
└── ai-actions.spec.ts → AI task creation tests

## Notes

- AI-related tests are primarily manual due to non-deterministic AI responses
- Memory limitation (5-10 messages) is by design to manage API token consumption
- 429 rate limiting occurs when messages are sent in rapid succession
- App tested on Chrome and Firefox, desktop and mobile viewports
