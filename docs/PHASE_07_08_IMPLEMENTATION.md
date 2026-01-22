# Phase 7 & 8 Implementation Guide

This document provides a comprehensive guide to the Phase 7 (UI/UX Polish & Theming) and Phase 8 (Security & Compliance) implementations.

---

## Phase 7: UI/UX Polish & Theming

### Overview

Phase 7 focuses on delivering a premium user experience with sophisticated theming, smooth animations, and accessibility compliance.

### 7.1 Complete Theme System

**Location**: `src/app/globals.css`, `src/components/theme-selector.tsx`

#### Available Themes

1. **Light** - Clean and minimal (default)
2. **Dark** - Easy on the eyes
3. **Gold Luxury** - Premium and elegant
4. **Ocean Blue** - Calm and focused
5. **Forest Green** - Natural and eco-friendly
6. **Neon Dark** - Vibrant and modern
7. **Silver** - Sophisticated and sleek
8. **System** - Follow system preference

#### Usage

```tsx
import { PremiumThemeSelector } from '@/components/theme-selector';

// In your component
<PremiumThemeSelector />
```

Themes are persisted to localStorage and applied via `next-themes`.

### 7.2 Micro-interactions & Animations

**Location**: `src/lib/motion.ts`, `src/components/ui/premium-*.tsx`

#### Framer Motion Presets

- **Transitions**: smooth, bounce, spring, snap, luxury
- **Page Variants**: fade, slide, zoom
- **Card Variants**: fade in, hover lift, tap scale
- **Button Variants**: scale on hover, glow effect
- **List Variants**: stagger children animation
- **Modal Variants**: scale and fade

#### Premium Button Component

```tsx
import { PremiumButton } from '@/components/ui/premium-button';

<PremiumButton
  premiumVariant="gold"
  glow
  animation="glow"
>
  Click Me
</PremiumButton>
```

**Props**:
- `premiumVariant`: 'gold' | 'ocean' | 'forest' | 'neon' | 'silver'
- `glow`: boolean - Enable glow effect
- `animation`: 'scale' | 'glow' | 'lift' | 'none'

#### Premium Card Component

```tsx
import { PremiumCard, GradientCard } from '@/components/ui/premium-card';

<PremiumCard hoverLift glass animation="fade">
  Your content
</PremiumCard>

<GradientCard gradient="ocean" animated>
  Gradient background card
</GradientCard>
```

**Props**:
- `hoverLift`: boolean - Enable hover lift animation
- `glass`: boolean - Glass morphism effect
- `animation`: 'fade' | 'lift' | 'none'
- `gradient`: 'gold' | 'ocean' | 'forest' | 'neon' | 'silver' | 'luxury'
- `animated`: boolean - Animated gradient background

### 7.3 Loading States

**Location**: `src/components/ui/skeleton-premium.tsx`

#### Skeleton Components

```tsx
import { 
  Skeleton,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonList,
  SkeletonText,
  SkeletonAvatar,
  SkeletonDashboard
} from '@/components/ui/skeleton-premium';

// Basic skeleton
<Skeleton width={200} height={20} rounded="md" gradient />

// Pre-built skeletons
<SkeletonCard />
<SkeletonList count={5} variant="card" />
<SkeletonDashboard />
```

### 7.4 Toast Notifications

**Location**: `src/components/ui/toast.tsx`

#### Setup

```tsx
import { ToastProvider } from '@/components/ui/toast';

// Wrap your app
<ToastProvider>
  {children}
</ToastProvider>
```

#### Usage

```tsx
import { useToast } from '@/components/ui/toast';

function MyComponent() {
  const { toast, success, error, info, warning } = useToast();

  const handleClick = () => {
    success('Success!', 'Operation completed successfully');
    error('Error!', 'Something went wrong');
    info('Info', 'Here is some information');
    warning('Warning', 'Please be careful');
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

### 7.5 Accessibility Features

**Location**: `src/lib/accessibility.ts`

#### WCAG 2.1 AA Compliance

```tsx
import {
  meetsContrastRequirement,
  getContrastRatio,
  createKeyboardHandler,
  getAccessibleButtonProps,
  getAccessibleFieldProps,
  SkipToMainContent,
  announceToScreenReader,
  prefersReducedMotion,
  trapFocus,
} from '@/lib/accessibility';

// Check color contrast
if (meetsContrastRequirement('#000000', '#FFFFFF')) {
  console.log('Colors meet WCAG AA standard');
}

// Keyboard navigation
<div
  onClick={handleClick}
  onKeyDown={createKeyboardHandler(handleClick)}
  tabIndex={0}
  role="button"
>
  Clickable element
</div>

// Skip to main content
<SkipToMainContent />

// Screen reader announcement
announceToScreenReader('Data loaded successfully', 'polite');

// Accessible form fields
const fieldProps = getAccessibleFieldProps({
  id: 'email',
  label: 'Email Address',
  description: 'Enter your email',
  error: 'Invalid email',
  required: true,
});

<label {...fieldProps.label}>Email</label>
<input {...fieldProps.field} type="email" />
{fieldProps.error && <span {...fieldProps.error}>Error message</span>}
```

#### Accessibility Utilities

- **Contrast checking**: Ensure text is readable
- **Keyboard handlers**: Support Enter and Space keys
- **ARIA attributes**: Proper labels and descriptions
- **Focus management**: Trap focus in modals
- **Screen reader support**: Announce dynamic content
- **Reduced motion**: Respect user preferences

---

## Phase 8: Security & Compliance

### Overview

Phase 8 implements comprehensive security measures and compliance with GDPR, CCPA, and other regulations.

### 8.1 Rate Limiting

**Location**: `src/lib/rate-limiter.ts`

#### Configuration

```typescript
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limiter';

// In API route
export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const result = rateLimit(identifier, rateLimitConfigs.api);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: createRateLimitHeaders(result)
      }
    );
  }

  // Your logic here
}
```

#### Rate Limit Tiers

- **Free**: 100 requests/hour
- **BYOK**: 500 requests/hour
- **Admin**: 1000 requests/hour
- **Auth**: 10 requests/15 minutes
- **API**: 300 requests/hour

### 8.2 Security Headers

**Location**: `src/lib/security-headers.ts`, `next.config.ts`

#### Configured Headers

- **Content-Security-Policy**: Prevents XSS attacks
- **Strict-Transport-Security**: Forces HTTPS
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Legacy XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Disables unnecessary features

Security headers are automatically applied to all routes via `next.config.ts`.

#### Custom Headers in API Routes

```typescript
import { getSecurityHeaders, getCORSHeaders } from '@/lib/security-headers';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  return NextResponse.json(data, {
    headers: {
      ...getSecurityHeaders(),
      ...getCORSHeaders(origin, {
        origins: ['https://example.com'],
        credentials: true,
      }),
    },
  });
}
```

### 8.3 API Key Management

**Location**: `src/lib/api-key-manager.ts`

#### Generate and Hash API Keys

```typescript
import {
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey,
  maskAPIKey,
  isValidAPIKeyFormat,
} from '@/lib/api-key-manager';

// Generate new API key
const apiKey = generateAPIKey(); // oak_xxxxx...

// Hash for storage
const hashedKey = await hashAPIKey(apiKey);

// Verify key
const isValid = await verifyAPIKey(providedKey, hashedKey);

// Display masked key
const masked = maskAPIKey(apiKey); // oak_****xxxx

// Validate format
if (isValidAPIKeyFormat(apiKey)) {
  // Valid format
}
```

#### API Key Permissions

```typescript
type APIKeyPermission = 'read' | 'write' | 'admin';

const metadata = createAPIKeyMetadata(
  'key-id',
  'My API Key',
  hashedKey,
  ['read', 'write'],
  expiresAt
);

if (hasPermission(metadata, 'read')) {
  // Allow read access
}
```

### 8.4 Audit Logging

**Location**: `src/lib/audit-logger.ts`

#### Log Security Events

```typescript
import {
  logAuthSuccess,
  logAuthFailure,
  logAPIKeyUsage,
  logRateLimitExceeded,
  logDataAccess,
  logAdminAction,
  AuditEventType,
} from '@/lib/audit-logger';

// Authentication
logAuthSuccess(userId, email, ipAddress, userAgent);
logAuthFailure(email, ipAddress, userAgent, 'Invalid password');

// API key usage
logAPIKeyUsage(userId, apiKeyId, '/api/analyze', true);

// Rate limiting
logRateLimitExceeded(ipAddress, '/api/fetch');

// Data access
logDataAccess(
  AuditEventType.DATA_READ,
  userId,
  'offers',
  offerId,
  true
);

// Admin actions
logAdminAction(
  AuditEventType.ADMIN_USER_SUSPEND,
  adminId,
  targetUserId,
  'User suspended for ToS violation'
);
```

Logs are stored locally using Pino and can be reviewed by administrators.

### 8.5 Cookie Consent

**Location**: `src/components/CookieConsent.tsx`

#### Setup

```tsx
import { CookieConsent, useCookieConsent } from '@/components/CookieConsent';

// Add to layout
<CookieConsent />

// Check consent in components
function AnalyticsComponent() {
  const { canUseAnalytics, hasConsented } = useCookieConsent();

  if (!canUseAnalytics) {
    return null;
  }

  // Load analytics script
}
```

#### Cookie Categories

- **Necessary**: Always enabled (authentication, security)
- **Functional**: Remember preferences and settings
- **Analytics**: Usage tracking and improvements
- **Marketing**: Advertising and personalization

### 8.6 Compliance Documents

**Location**: `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_SERVICE.md`

#### Privacy Policy

Covers:
- Data collection and usage
- Third-party services (OpenRouter, OAuth providers)
- GDPR and CCPA compliance
- User rights (access, deletion, export)
- Security measures
- Contact information

#### Terms of Service

Covers:
- Service description and tiers
- Acceptable use policy
- BYOK responsibilities
- Intellectual property
- Liability limitations
- Dispute resolution

### 8.7 Example API Route

**Location**: `src/app/api/example/route.ts`

Complete example showing:
- Rate limiting
- Security headers
- Audit logging
- Error handling
- CORS support

```bash
# Test the example API
curl http://localhost:3000/api/example

# Check rate limit headers
curl -I http://localhost:3000/api/example
```

---

## Testing & Validation

### Build and Test

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Lint code
pnpm lint
```

### Security Testing

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Accessibility Testing

- Use browser DevTools Lighthouse audit
- Test keyboard navigation (Tab, Enter, Space, Escape)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify WCAG 2.1 AA contrast ratios
- Check ARIA attributes

### Manual Testing Checklist

- [ ] All themes display correctly
- [ ] Animations are smooth and performant
- [ ] Loading skeletons appear during data fetching
- [ ] Toast notifications show and dismiss properly
- [ ] Rate limiting blocks excessive requests
- [ ] Security headers are present in responses
- [ ] Cookie consent banner appears on first visit
- [ ] API key hashing works correctly
- [ ] Audit logs are recorded
- [ ] Keyboard navigation works throughout the app
- [ ] Screen readers can navigate the app

---

## Deployment Notes

### Environment Variables

No new environment variables required for Phase 7 & 8 features. All security and UI features work out of the box.

### Production Considerations

1. **Rate Limiting**: Uses in-memory store by default. For production with multiple servers, consider Redis.
2. **Audit Logs**: Stored locally with Pino. Configure log rotation for production.
3. **Security Headers**: Automatically applied via `next.config.ts`.
4. **Cookie Consent**: Update links to your actual privacy policy and terms pages.
5. **API Keys**: Ensure bcrypt salt rounds (12) is appropriate for your security needs.

### Performance

- Framer Motion animations are optimized for 60fps
- Skeleton loaders reduce perceived loading time
- Rate limiting prevents server overload
- Security headers add minimal overhead

---

## Migration Guide

If upgrading from a previous version:

1. **Install no new dependencies** - All required packages already installed
2. **Import new utilities** - Update imports to use new security and UI utilities
3. **Add ToastProvider** - Wrap your app in `<ToastProvider>` if using toasts
4. **Add CookieConsent** - Add `<CookieConsent />` to your layout
5. **Update API routes** - Add rate limiting and security headers to existing routes
6. **Test thoroughly** - Ensure existing functionality still works

---

## Support & Resources

- **Documentation**: This file and inline code comments
- **Examples**: See `src/app/api/example/route.ts`
- **Security Issues**: Report to security@offeranalyst.com
- **Questions**: Open an issue on GitHub

---

**Phase 7 & 8 completed** ✅

All features implemented and ready for production use.
