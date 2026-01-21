# Test Plan: Landing Page + Trial System

## Test Environment
- **Local URL**: http://localhost:5173
- **Desktop viewport**: 1280x800
- **Mobile viewport**: 390x844 (iPhone 14 Pro)

---

## Test 1: Landing Page - Desktop View

### 1.1 Hero Section Phone Mockup
- [ ] Phone mockup is NOT blurry (GPU-accelerated transform)
- [ ] Phone displays live Menu component
- [ ] Theme switcher dots below phone work (click each, verify theme changes)
- [ ] Floating notification elements are visible and animated

### 1.2 "Todo lo que necesitas" Section
- [ ] Feature tabs are clickable
- [ ] Phone mockup shows LIVE Menu (not fake mockups)
- [ ] Theme badge shows current theme name (synced with active feature)
- [ ] Auto-cycling works (wait 4+ seconds, feature changes)

### 1.3 CTA Copy Updates
- [ ] Navbar button: "Prueba 7 Días"
- [ ] Hero CTA: "Empezar Prueba de 7 Días"
- [ ] Pricing basic plan: "Empezar 7 Días Gratis"
- [ ] Pricing pro plan: "Empezar 7 Días Gratis"
- [ ] Final CTA: "Empezar Prueba de 7 Días"
- [ ] Footer text: "7 días gratis" mentioned

---

## Test 2: Landing Page - Mobile View (390x844)

### 2.1 Mobile Sticky Phone
- [ ] Sticky phone mockup appears in bottom-right corner
- [ ] Phone displays live Menu content
- [ ] Theme dots are visible and clickable
- [ ] Does NOT overlap important content

### 2.2 General Mobile Responsiveness
- [ ] Navbar collapses appropriately
- [ ] Hero text is readable
- [ ] CTAs are full-width on mobile
- [ ] Pricing cards stack vertically
- [ ] "Todo lo que necesitas" section is usable

---

## Test 3: Trial Expired Page

### 3.1 Access /trial-expired (when logged in)
- [ ] Page renders without errors
- [ ] Shows "Tu período de prueba ha terminado"
- [ ] Displays two plan cards (Básico, Pro)
- [ ] WhatsApp contact buttons work
- [ ] Logout button in header works
- [ ] Link to view menu works

---

## Test 4: Upgrade Page

### 4.1 Access /upgrade (when logged in)
- [ ] Page renders without errors
- [ ] Shows current trial/subscription status
- [ ] Displays days remaining (if in trial)
- [ ] Two plan cards with features listed
- [ ] FAQ section is readable
- [ ] WhatsApp contact buttons work
- [ ] Back to Dashboard link works

---

## Test 5: Trial System Flow

### 5.1 Protected Route Behavior
- [ ] Dashboard accessible during active trial
- [ ] Kitchen accessible during active trial
- [ ] Admin accessible during active trial

### 5.2 Expired Trial Simulation (manual DB test)
```sql
-- To test expired trial lockout:
UPDATE public.tenants
SET trial_ends_at = NOW() - INTERVAL '1 day'
WHERE slug = 'your-test-tenant';

-- After testing, restore:
UPDATE public.tenants
SET trial_ends_at = NOW() + INTERVAL '7 days'
WHERE slug = 'your-test-tenant';
```
- [ ] After expiring trial, Dashboard redirects to /trial-expired
- [ ] /upgrade page still accessible
- [ ] Public menu (/t/slug) still works

---

## Test 6: Trial Banner Component

### 6.1 Expiring Trial Warning (≤2 days)
```sql
-- Set trial to expire in 2 days:
UPDATE public.tenants
SET trial_ends_at = NOW() + INTERVAL '2 days'
WHERE slug = 'your-test-tenant';
```
- [ ] TrialBanner appears on Dashboard (if integrated)
- [ ] Shows correct days remaining
- [ ] "Actualizar plan" link goes to /upgrade
- [ ] Dismiss button works

---

## Execution Commands

```bash
# Start dev server
cd "G:\_OneDrive\OneDrive\Desktop\Py Apps\elbraserito"
npm run dev
```

## Browser Automation Steps

1. Get tab context
2. Create new tab
3. Navigate to localhost:5173
4. Take screenshot (desktop)
5. Test theme switcher clicks
6. Scroll to "Todo lo que necesitas"
7. Take screenshot
8. Resize to mobile (390x844)
9. Take screenshot (verify sticky phone)
10. Navigate to /trial-expired
11. Take screenshot
12. Navigate to /upgrade
13. Take screenshot
14. Verify all CTAs have correct text
