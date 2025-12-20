# Fetch Agent Modernization Ticket

## Overview
Improve the reliability, type safety, and maintainability of the fetch agent in `src/app/actions/fetch.ts`.

## Current Limitations
- Manual string manipulation for JSON parsing
- No schema validation for AI responses
- Generic mock data fallbacks
- Limited error handling and retry logic
- Basic search control

## Proposed Improvements

### 1. Parsing Reliability
- **Current**: Manual string manipulation with regex and bracket counting
- **Target**: Use `responseMimeType: "application/json"` for structured AI output
- **Fallback**: Implement robust parsing with proper error boundaries

### 2. Schema Validation
- **Current**: No validation of AI response structure
- **Target**: Integrate Zod schema validation
- **Implementation**: Create `OfferSchema` and validate responses before returning

### 3. Enhanced Prompting
- **Current**: Basic system instructions
- **Target**: Refined instructions for better search tool utilization
- **Focus**: Improve data quality extraction and formatting consistency

### 4. Error Strategy
- **Current**: Generic mock data fallbacks
- **Target**: Typed error responses with specific error codes
- **Addition**: Implement retry logic for transient failures

### 5. Search Control
- **Current**: Fixed minimum of 10 items
- **Target**: Support dynamic limits based on user needs
- **Enhancement**: Improved context handling and domain-specific search optimization

## Implementation Steps
1. Create Zod schemas for Offer validation
2. Update system instructions for better AI compliance
3. Implement structured JSON response handling
4. Add comprehensive error handling with typed responses
5. Remove mock data fallbacks in favor of proper error reporting
6. Add support for dynamic result limits
7. Implement retry logic for network/AI failures

## Success Criteria
- 95%+ success rate for JSON parsing
- Zero type safety violations
- Proper error reporting without fallbacks
- Improved data quality consistency
- Maintained external API compatibility

## Testing Strategy
- Unit tests with mocked AI responses
- Integration tests with real AI provider
- Type safety validation
- Error handling verification

## Files to Modify
- `src/app/actions/fetch.ts` (primary)
- `src/types/index.ts` (add Zod schemas)
- Potential new test files

## Risk Assessment
- **Low**: External API remains unchanged
- **Medium**: AI response format changes require testing
- **Mitigation**: Comprehensive test coverage and gradual rollout