# optimaDELIVERY - Comprehensive Test Plan

**Last Updated**: 2026-01-21
**Test Method**: Claude in Chrome browser automation with screenshot verification

---

## Test Execution Status

| Phase | Status | Date | Tester |
|-------|--------|------|--------|
| 1. Landing Page | [ ] Pending | | |
| 2. Authentication | [ ] Pending | | |
| 3. Registration | [ ] Pending | | |
| 4. Dashboard | [ ] Pending | | |
| 5. Menu Management | [ ] Pending | | |
| 6. Customer Menu | [ ] Pending | | |
| 7. Order Flow | [ ] Pending | | |
| 8. Kitchen Display | [ ] Pending | | |
| 9. Super Admin | [ ] Pending | | |
| 10. MercadoPago | [ ] Pending | | |

---

## Phase 1: Landing Page

### 1.1 Visual Elements
- [ ] Logo displays correctly in header
- [ ] Navigation menu visible (Ingresar, Registrarse)
- [ ] Hero section with CTA buttons
- [ ] Features section displays 3-4 features
- [ ] Pricing section visible
- [ ] Footer with links
- [ ] Mobile responsive (check at 375px width)

### 1.2 Functionality
- [ ] "Ingresar" link navigates to /login
- [ ] "Registrarse" link navigates to /register
- [ ] "Empezar Gratis" CTA works
- [ ] Phone mockup shows live menu preview
- [ ] Theme switcher on mockup works (cycle through 5 themes)

### 1.3 Console Check
- [ ] No JavaScript errors on page load
- [ ] No 404 errors for assets
- [ ] No CORS errors

---

## Phase 2: Authentication

### 2.1 Login Page (/login)
- [ ] Email input field visible
- [ ] Password input field visible
- [ ] "Iniciar Sesión" button visible
- [ ] "Continuar con Google" button visible
- [ ] "Registrarse" link visible
- [ ] Form validation shows errors for empty fields
- [ ] Invalid credentials show error message

### 2.2 Google OAuth
- [ ] Google button opens OAuth popup/redirect
- [ ] Successful login redirects to dashboard
- [ ] OAuth errors handled gracefully

### 2.3 Console Check
- [ ] No errors on login page load
- [ ] No errors on form submission
- [ ] Auth state changes logged correctly

---

## Phase 3: Registration

### 3.1 Register Page (/register)
- [ ] Email input visible
- [ ] Password input visible
- [ ] Confirm password input visible
- [ ] "Registrarse" button visible
- [ ] Google OAuth button visible
- [ ] Form validation works

### 3.2 Setup Wizard (/register/setup)
- [ ] Business name input
- [ ] Slug input with availability check
- [ ] Slug shows green check when available
- [ ] Slug shows red X when taken
- [ ] Logo upload functionality
- [ ] Phone/email/address inputs
- [ ] Template selection (5 templates)
- [ ] Primary color picker
- [ ] "Crear mi Menú" button

### 3.3 Console Check
- [ ] No errors during registration flow
- [ ] Slug validation API calls succeed

---

## Phase 4: Dashboard (/dashboard)

### 4.1 Overview Tab
- [ ] Stats cards display (Ventas Hoy, Semana, Mes, Pedidos Activos)
- [ ] Stats show real data from orders
- [ ] "Tu menú está online" banner visible
- [ ] Menu URL displayed correctly
- [ ] "Ver mi Menú" button opens menu

### 4.2 Menu Tab
- [ ] Products list visible
- [ ] Categories tab visible
- [ ] "Nuevo Producto" button opens dialog
- [ ] "Nueva Categoría" button opens dialog
- [ ] Product cards show images
- [ ] Toggle availability works
- [ ] Delete product works

### 4.3 Settings Tab - General
- [ ] Business name displayed
- [ ] "Editar Información" button visible
- [ ] Click edit shows input fields for phone/email/address
- [ ] Save changes works
- [ ] Cancel button works

### 4.4 Settings Tab - Pagos (Owner only)
- [ ] MercadoPago connection status visible
- [ ] "Conectar Cuenta" button if not connected
- [ ] "Conectado" badge if connected

### 4.5 Settings Tab - Cocina
- [ ] Kitchen PIN settings visible
- [ ] Generate PIN button works
- [ ] Share buttons (WhatsApp, Email, Copy) work

### 4.6 Settings Tab - Equipo
- [ ] Team members list visible
- [ ] Invite member functionality
- [ ] Role assignment works

### 4.7 Design Tab
- [ ] Template selection visible (5 templates)
- [ ] Primary color picker visible
- [ ] Preview updates when changing options
- [ ] Save changes works

### 4.8 Sidebar Navigation
- [ ] All tabs accessible (Resumen, Menu, Cocina, Pedidos, Diseño, Config)
- [ ] Role-based visibility works
- [ ] Active tab highlighted with primary color
- [ ] Logout button works

### 4.9 Console Check
- [ ] No errors on dashboard load
- [ ] No errors when switching tabs
- [ ] No errors on form submissions

---

## Phase 5: Menu Management

### 5.1 Create Category
- [ ] Dialog opens when clicking "Nueva Categoría"
- [ ] Name field with max length indicator (50 chars)
- [ ] Emoji picker/input
- [ ] Save creates category
- [ ] New category appears in list

### 5.2 Edit Category
- [ ] Edit button opens dialog with data
- [ ] Changes save correctly
- [ ] Category updates in list

### 5.3 Delete Category
- [ ] Delete button shows confirmation
- [ ] Warning if category has products
- [ ] Delete removes category

### 5.4 Create Product
- [ ] Dialog opens when clicking "Nuevo Producto"
- [ ] Image upload to Supabase works
- [ ] Upload shows loading spinner
- [ ] Name field with max length (100 chars)
- [ ] Description field with max length (500 chars)
- [ ] Price field with min=0 validation
- [ ] Category dropdown populated
- [ ] Save creates product

### 5.5 Edit Product
- [ ] Edit button opens dialog with data
- [ ] Image can be changed
- [ ] Changes save correctly

### 5.6 Delete Product
- [ ] Delete button shows confirmation
- [ ] Product removed from list

### 5.7 Toggle Availability
- [ ] Toggle button visible
- [ ] Click toggles "Agotado" state
- [ ] Visual feedback (grayed out)

### 5.8 Empty States
- [ ] No categories shows guidance to create first
- [ ] No products shows guidance (different if no categories)

### 5.9 Console Check
- [ ] No errors on CRUD operations
- [ ] Image upload errors handled

---

## Phase 6: Customer Menu (/t/{slug})

### 6.1 Template Rendering
- [ ] All 5 templates render correctly:
  - [ ] Classic
  - [ ] Minimal
  - [ ] Visual
  - [ ] Sidebar
  - [ ] Grid

### 6.2 Menu Display
- [ ] Logo displays (or fallback icon if no logo)
- [ ] Business name visible
- [ ] Categories visible
- [ ] Menu items visible with prices
- [ ] Images load with lazy loading
- [ ] Unavailable items show "Agotado"

### 6.3 Cart Functionality
- [ ] Add item to cart works
- [ ] Toast notification appears
- [ ] Cart drawer opens
- [ ] Quantity +/- works
- [ ] Remove item works
- [ ] Cart total updates
- [ ] Cart persists on page refresh (F5)

### 6.4 Search (TemplateSidebar)
- [ ] Search input visible
- [ ] Typing filters menu items
- [ ] Search results show count
- [ ] Clear search button works
- [ ] No results shows empty state

### 6.5 Checkout
- [ ] "Hacer Pedido" button opens checkout
- [ ] Customer name input
- [ ] Phone input
- [ ] Delivery/Pickup toggle
- [ ] Address input (if delivery)
- [ ] Cash/MercadoPago payment selection
- [ ] Order submission works

### 6.6 Report Link
- [ ] "Reportar esta página" link visible in footer
- [ ] Opens email client with pre-filled report

### 6.7 Console Check
- [ ] No errors on menu load
- [ ] No errors adding to cart
- [ ] No errors on checkout

---

## Phase 7: Order Flow

### 7.1 Order Creation
- [ ] Order appears in dashboard Pedidos tab
- [ ] Order number assigned
- [ ] Customer info visible
- [ ] Items listed correctly
- [ ] Total correct

### 7.2 Order Status Updates
- [ ] Status dropdown works
- [ ] Pending → Preparing transition
- [ ] Preparing → Ready transition
- [ ] Ready → Dispatched transition
- [ ] Cancel order works

### 7.3 Real-time Updates
- [ ] Orders appear without refresh
- [ ] Status changes reflect immediately

### 7.4 Console Check
- [ ] No errors on order operations
- [ ] WebSocket/Realtime working

---

## Phase 8: Kitchen Display (/kitchen/{pin})

### 8.1 PIN Access
- [ ] PIN entry page visible
- [ ] Invalid PIN shows error
- [ ] Valid PIN grants access

### 8.2 Kitchen View
- [ ] Orders displayed as cards
- [ ] New orders appear in real-time
- [ ] Status can be changed
- [ ] Audio notification on new orders (if enabled)
- [ ] Payment status visible for MP orders

### 8.3 Console Check
- [ ] No errors on kitchen load
- [ ] Realtime subscription working

---

## Phase 9: Super Admin (/super-admin)

### 9.1 Access Control
- [ ] Non-admin users see access denied
- [ ] Super admin email can access

### 9.2 Dashboard Metrics
- [ ] Platform revenue cards visible
- [ ] Time period selector works (Today/Week/Month/All)
- [ ] Metrics update when period changes

### 9.3 Negocios Tab
- [ ] Tenant list visible
- [ ] Search filter works
- [ ] Tenant details dialog opens
- [ ] Activate/Deactivate toggle works
- [ ] Extend trial buttons work (+7 days, +30 days)
- [ ] CSV export works

### 9.4 Analytics Tab
- [ ] Per-tenant breakdown table visible
- [ ] Sort by columns works (name, orders, revenue, date)
- [ ] Revenue and order counts correct
- [ ] Summary footer shows totals

### 9.5 Usuarios Tab
- [ ] User list visible
- [ ] Shows role and tenant

### 9.6 Diseños Tab
- [ ] Design requests list visible
- [ ] Status can be updated

### 9.7 Console Check
- [ ] No errors on super admin load
- [ ] No errors on tab switches
- [ ] No errors on actions

---

## Phase 10: MercadoPago Integration

### 10.1 Connection
- [ ] "Conectar Cuenta" button visible
- [ ] OAuth flow opens MercadoPago
- [ ] Callback returns to dashboard
- [ ] "Conectado" badge shows after success

### 10.2 Payment Flow
- [ ] MercadoPago option visible at checkout
- [ ] Selecting MP creates payment preference
- [ ] Redirect to MP checkout works
- [ ] Webhook updates order status

### 10.3 Console Check
- [ ] No OAuth errors
- [ ] Payment creation logged

---

## Mobile Responsiveness Checklist

### Screen Sizes to Test
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Pages to Check
- [ ] Landing page
- [ ] Login/Register
- [ ] Dashboard
- [ ] Menu page (all templates)
- [ ] Checkout
- [ ] Kitchen display

---

## Console Error Log

Record any console errors found during testing:

| Page | Error Message | Severity | Fixed |
|------|--------------|----------|-------|
| | | | |

---

## Test Results Summary

**Total Tests**: 150+
**Passed**: _____
**Failed**: _____
**Blocked**: _____

**Overall Status**: [ ] PASS / [ ] FAIL

**Notes**:
_____

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | Claude in Chrome | | |
| Developer | | | |
| Product Owner | | | |
