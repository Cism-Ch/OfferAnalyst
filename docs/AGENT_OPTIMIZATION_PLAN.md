# Agent Optimization Plan

## Objective
Resolve `AgentError: No response text` and improve performance/latency of the agent workflow.

## Problem Analysis
1. **Model Capacity**: The current model (`deepseek-r1`) fails to return responses when the input context (list of offers) is too large.
2. **Latency**: Processing large JSON payloads is slow.
3. **Efficiency**: Sending full raw data (including long descriptions) to the analysis agent is unnecessary for the ranking task and consumes token limits.

## Proposed Changes

### 1. Model Upgrade
Switch all agents (`fetch`, `analyze`, `organize`) to `google/gemini-2.0-flash-exp:free`.
- **Benefits**: 
    - 1M token context window (solves capacity issues).
    - Faster inference speed (solves latency).
    - Better stability on free tier.

### 2. Payload Optimization
Implement a data minimization strategy before sending data to the LLM in `analyze.ts` and `organize.ts`.

**Strategy**:
- Map `Offer` objects to a `SimplifiedOffer` structure.
- **Keep**: `id`, `title`, `price`, `location`, `category`.
- **Truncate**: `description` to max 500 characters.
- **Remove**: Any extra metadata not needed for reasoning.

### 3. Implementation Steps
1.  **Update `fetch.ts`**: Change model constant.
2.  **Update `analyze.ts`**: 
    - Change model constant.
    - Implement `simplifyOffer` helper.
    - Use simplified offers in the prompt.
3.  **Update `organize.ts`**:
    - Change model constant.
    - Implement `simplifyOffer` helper.
    - Use simplified offers in the prompt.

## Verification
- Ensure `fetch` still returns valid JSON.
- Ensure `analyze` receives the simplified data and returns the full `ScoredOffer` (we need to merge the scores back to the original offers or ensure the ID matching works). 
    - *Correction*: The `analyze` agent returns `topOffers` which are `ScoredOffer` objects. If we send simplified offers, the agent will return simplified offers with scores. We might lose the full description if we just return what the agent gives us.
    - **Refined Strategy for Analyze**: 
        - Send simplified offers.
        - Receive scored simplified offers.
        - **Merge** the scores/justification back into the *original* full offer objects using the `id`.
        - This ensures the UI still displays full details while the Agent processes optimized data.

## Risk Mitigation
- **ID Mismatch**: Ensure the Agent preserves the `id` exactly. The prompt already requests this.
- **Data Loss**: The merge strategy prevents data loss.
