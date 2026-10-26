# Phase 05: Consumption Policy & BYOK Implementation

## Overview

OfferAnalyst follows a **Free Forever** model with optional BYOK (Bring Your Own Key) support. This document outlines the consumption policies, rate limits, and provider quotas.

## Monetization Model

### Free Forever Tier

**What's Included:**
- ✅ SaaS gratuit, aucune facturation (Free SaaS, no billing)
- ✅ Access to AI models with free tier limitations
- ✅ Integrated API keys for community use
- ✅ 1 workspace per user
- ✅ Up to 3 BYOK API keys stored server-side (encrypted)
- ✅ Community support

**Limitations:**
- Subject to provider free-tier quotas
- Shared rate limits across all free-tier users
- Limited to free AI models (Gemini 2.5 Flash, DeepSeek R1 Free, etc.)

### BYOK (Bring Your Own Key) Mode

**What's Included:**
- ✅ Unlimited usage (within your provider's limits)
- ✅ Access to premium AI models (GPT-4, Claude Sonnet, etc.)
- ✅ No product-imposed rate limits
- ✅ Priority support
- ✅ Full analytics and tracking

**How It Works:**
1. Add your API keys in `/dashboard/api-keys`
2. Keys are encrypted with bcrypt before storage
3. System automatically switches to BYOK mode
4. You pay your AI provider directly

## Consumption Policies

### Rate Limiting

#### Free Tier Rate Limits

**Global Limits (Shared):**
- **Fetch Operations**: 100 requests/day
- **Analysis Operations**: 50 requests/day
- **Organization Operations**: 50 requests/day
- **Total API Calls**: 200 requests/day per user

**Per-Model Limits:**
- Gemini 2.5 Flash: 60 RPM (requests per minute)
- DeepSeek R1 Free: 30 RPM
- Default models: 15 RPM

#### BYOK Rate Limits

**Product Limits (Removed):**
- ✅ No fetch operation limits
- ✅ No analysis operation limits
- ✅ No organization operation limits

**Provider Limits (Enforced):**
- Limited only by your AI provider's quotas
- Rate limits depend on your plan with the provider
- System respects provider rate limit headers

### Quota Tracking

**Free Tier Tracking:**
- Daily quota reset at 00:00 UTC
- Usage tracked in `Credit` model
- Hard limit enforcement with clear error messages
- Quota reset notifications

**BYOK Tracking:**
- Usage tracked for analytics only
- No enforcement of limits
- Provider errors passed through to user
- Detailed usage statistics in dashboard

## Provider Quota Management

### Supported Providers

**Free Tier Models:**
1. **Google Gemini**
   - Model: Gemini 2.5 Flash
   - Quota: 60 RPM, 1500 RPD (requests per day)
   - Best for: Fast analysis, multilingual support

2. **DeepSeek**
   - Model: DeepSeek R1 Free
   - Quota: 30 RPM, 500 RPD
   - Best for: Reasoning tasks, complex analysis

3. **OpenRouter (Free Models)**
   - Various free models available
   - Quota: Varies by model
   - Best for: Testing, experimentation

**BYOK Provider Models:**
1. **OpenAI (OpenRouter)**
   - GPT-4o Mini: Fast, efficient
   - GPT-4o: Advanced reasoning
   - Your quota applies

2. **Anthropic (OpenRouter)**
   - Claude Sonnet: Superior analysis
   - Claude Haiku: Fast responses
   - Your quota applies

3. **Mistral (OpenRouter)**
   - Mistral Large: Multilingual excellence
   - Mistral Medium: Balanced performance
   - Your quota applies

### Quota Enforcement

**Free Tier Enforcement:**
```typescript
// Example middleware check
if (!userHasByok && dailyQuotaExceeded) {
  return {
    success: false,
    error: 'Daily quota exceeded. Upgrade to BYOK for unlimited usage.',
    quotaReset: '00:00 UTC'
  };
}
```

**BYOK Mode:**
```typescript
// Pass through to provider
try {
  const result = await callProviderAPI(userApiKey);
  return result;
} catch (error) {
  // Return provider error to user
  return {
    success: false,
    error: error.message,
    providerError: true
  };
}
```

## Implementation Status

### ✅ Completed Features

1. **API Key Management** (`/dashboard/api-keys`)
   - Encrypted storage with bcrypt
   - Usage tracking per key
   - Add/delete operations
   - Key preview (masked display)

2. **Support Page** (`/dashboard/support`)
   - Voluntary donation CTA
   - Model recommendations by tier
   - FAQ for BYOK setup
   - Clear pricing communication

3. **Analytics Dashboard** (`/dashboard/analytics`)
   - Usage tracking by model
   - Search history
   - Credit consumption (ready for quota tracking)

### 🚧 To Be Implemented

1. **Rate Limiting Middleware**
   - [ ] Middleware to check daily quotas
   - [ ] Redis/memory cache for rate limit counters
   - [ ] Graceful error responses when quota exceeded
   - [ ] Quota reset notifications

2. **Provider Quota Tracking**
   - [ ] Track API usage by provider
   - [ ] Monitor rate limit headers
   - [ ] Alert users approaching limits
   - [ ] Dashboard display of remaining quota

3. **Consumption Policy UI**
   - [ ] Display current quota usage
   - [ ] Show time until quota reset
   - [ ] Link to BYOK upgrade flow
   - [ ] Provider status indicators

## Migration Path

### From Free to BYOK

**User Journey:**
1. User hits daily quota limit
2. System shows friendly message with upgrade path
3. User navigates to `/dashboard/api-keys`
4. Adds their API key from provider
5. System detects BYOK mode, removes limits
6. User continues with unlimited usage

**No Payment Required:**
- No subscription fees
- No credit card required
- User pays provider directly
- Completely optional

## Security Considerations

### API Key Security

- **Encryption**: All API keys encrypted with bcrypt
- **Never Logged**: Keys never appear in logs
- **Server-Side Only**: Keys never sent to client
- **User Ownership**: Keys tied to user account
- **Deletion**: Complete removal on user request

### Rate Limit Bypass Prevention

- **User ID Verification**: All requests tied to authenticated user
- **Token Validation**: JWT tokens validated on each request
- **Quota Checks**: Server-side validation (cannot be bypassed)
- **Audit Logging**: All quota checks logged for review

## Support & Documentation

### User Resources

- **Setup Guide**: `/dashboard/support` - Complete BYOK setup
- **FAQ**: Common questions about quotas and BYOK
- **Status Page**: Provider status and uptime
- **Email Support**: help@offeranalyst.com (planned)

### Developer Resources

- **API Documentation**: Complete API reference (planned)
- **Rate Limit Headers**: X-RateLimit-* headers in responses
- **Error Codes**: Standardized error responses
- **Webhook Events**: Quota alerts (planned)

## Voluntary Support

### Donation Model

**Philosophy:**
- ✅ Platform is 100% free forever
- ✅ No features locked behind paywall
- ✅ Donations are completely optional
- ✅ Helps maintain infrastructure

**How to Support:**
- "Buy me a coffee" button on `/dashboard/support`
- One-time donations welcome
- No subscription pressure
- 100% voluntary

## Future Enhancements

### Phase 5.1 (Optional)
- [ ] Team quotas (shared across workspace)
- [ ] Usage analytics export
- [ ] Custom rate limits per user
- [ ] Webhook notifications for quota events

### Phase 5.2 (Optional)
- [ ] Provider failover (switch if one fails)
- [ ] Smart routing (cheapest/fastest provider)
- [ ] Bulk pricing for enterprises
- [ ] Custom SLA agreements

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Phase 05 Implementation
