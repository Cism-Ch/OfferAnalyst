# Condition-Based Waiting Utilities

Complete implementation of condition-based waiting utilities for reliable testing. From Lace test infrastructure improvements (2025-10-03). This implementation fixed 15 flaky tests by replacing arbitrary timeouts with condition-based waiting.

## Purpose

Provides utilities to wait for specific events or conditions in asynchronous systems, eliminating flaky tests caused by arbitrary timeouts.

## Background

**Before (Flaky):**
- Used arbitrary timeouts (`setTimeout(r, 300)`)
- Tests failed randomly due to timing variations
- 60% pass rate, slow execution

**After (Reliable):**
- Uses condition-based waiting
- 100% pass rate, 40% faster execution
- Fixed 15 flaky tests

## Code Implementation

```typescript
// Complete implementation of condition-based waiting utilities
// From: Lace test infrastructure improvements (2025-10-03)
// Context: Fixed 15 flaky tests by replacing arbitrary timeouts

import type { ThreadManager } from '~/threads/thread-manager';
import type { LaceEvent, LaceEventType } from '~/threads/types';

/**
 * Wait for a specific event type to appear in thread
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param eventType - Type of event to wait for
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to the first matching event
 *
 * Example:
 *   await waitForEvent(threadManager, agentThreadId, 'TOOL_RESULT');
 */
export function waitForEvent(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find((e) => e.type === eventType);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${eventType} event after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10); // Poll every 10ms for efficiency
      }
    };

    check();
  });
}

/**
 * Wait for a specific number of events of a given type
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param eventType - Type of event to wait for
 * @param count - Number of events to wait for
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to all matching events once count is reached
 *
 * Example:
 *   // Wait for 2 AGENT_MESSAGE events (initial response + continuation)
 *   await waitForEventCount(threadManager, agentThreadId, 'AGENT_MESSAGE', 2);
 */
export function waitForEventCount(
  threadManager: ThreadManager,
  threadId: string,
  eventType: LaceEventType,
  count: number,
  timeoutMs = 5000
): Promise<LaceEvent[]> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const matchingEvents = events.filter((e) => e.type === eventType);

      if (matchingEvents.length >= count) {
        resolve(matchingEvents);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(
          new Error(
            `Timeout waiting for ${count} ${eventType} events after ${timeoutMs}ms (got ${matchingEvents.length})`
          )
        );
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * Wait for an event matching a custom predicate
 * Useful when you need to check event data, not just type
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param predicate - Function that returns true when event matches
 * @param description - Human-readable description for error messages
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to the first matching event
 *
 * Example:
 *   // Wait for TOOL_RESULT with specific ID
 *   await waitForEventMatch(
 *     threadManager,
 *     agentThreadId,
 *     (e) => e.type === 'TOOL_RESULT' && e.data.id === 'call_123',
 *     'TOOL_RESULT with id=call_123'
 *   );
 */
export function waitForEventMatch(
  threadManager: ThreadManager,
  threadId: string,
  predicate: (event: LaceEvent) => boolean,
  description: string,
  timeoutMs = 5000
): Promise<LaceEvent> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find(predicate);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}
```

## Usage Examples

### Before (Flaky Implementation):
```typescript
const messagePromise = agent.sendMessage('Execute tools');
await new Promise(r => setTimeout(r, 300)); // Hope tools start in 300ms
agent.abort();
await messagePromise;
await new Promise(r => setTimeout(r, 50));  // Hope results arrive in 50ms
expect(toolResults.length).toBe(2);         // Fails randomly
```

### After (Reliable Implementation):
```typescript
const messagePromise = agent.sendMessage('Execute tools');
await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 2); // Wait for tools to start
agent.abort();
await messagePromise;
await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 2); // Wait for results
expect(toolResults.length).toBe(2); // Always succeeds
```

## Key Features

### **1. waitForEvent**
- Waits for a single event of specific type
- Returns the first matching event
- Configurable timeout (default 5 seconds)
- Efficient polling (10ms intervals)

### **2. waitForEventCount**
- Waits for multiple events of the same type
- Returns array of all matching events once count is reached
- Useful for multi-step operations

### **3. waitForEventMatch**
- Waits for events matching custom conditions
- Uses predicate function for flexible matching
- Allows checking event data, not just type
- Descriptive error messages for debugging

## Benefits

- **Reliability**: 100% test pass rate (vs 60% with timeouts)
- **Performance**: 40% faster execution
- **Maintainability**: Clear intent and error messages
- **Flexibility**: Supports various waiting scenarios
- **Debugging**: Detailed error messages with context

## Implementation Details

- **Polling Strategy**: 10ms intervals for efficiency
- **Timeout Handling**: Configurable timeouts with descriptive errors
- **Error Reporting**: Clear messages including event types and counts
- **Promise-based**: Fits naturally with async/await patterns

This approach eliminates the root cause of flaky tests by waiting for actual conditions rather than arbitrary time delays.