# Dakkah CityOS — Detailed Implementation Plan

## Apps to Build: 14 (Skipping Storefront, FleetOps, Storybook, Watch, Payload Admin, Medusa Backend)

**Already built in CMS (SKIP):**
- Storefront (1,169 files — fully built with TanStack Router)
- FleetOps Dashboard (141 files — substantial fleet management)
- Storybook (20 files — component docs)
- Watch App (native Swift/Kotlin only — can't run in Replit)
- Payload CMS Admin (part of CMS infrastructure)
- Medusa Backend (3,087 files — commerce engine)

**To build in Replit: 14 apps**
- 1 already in development (Super App)
- 4 new Expo mobile artifacts (Driver, Merchant, POS, Car simulator)
- 9 new React Vite web artifacts (Consumer Web, PWA, AI Assistant, City Dashboard, Business Dashboard, Smart City Portal, Dev Portal, Kiosk, TV simulator)

---

## PHASE 0: SHARED FOUNDATION (Required Before Any New App)

All 18 apps in the CMS consume the same shared packages. Before building individual apps, we need a shared foundation in our Replit workspace.

### T0.1: Port Design Tokens Package
**Create**: `packages/design-tokens/`
**Source**: `@cityos/design-tokens` from CMS
**Deliverables**:
- `tokens/colors.ts` — Full CMS palette: primary (navy #0a1628), accent (blue #3182ce), extended (purple #7c3aed, teal #0d9488, amber #d97706, rose #e11d48), semantic (success/warning/error/info), neutral (gray50-900), surface light/dark, text light/dark, border light/dark
- `tokens/spacing.ts` — xs:4px through 3xl:64px, container widths, section padding, grid gaps
- `tokens/typography.ts` — Inter font family, sizes xs-5xl, weights 400-800, line heights
- `tokens/borders.ts` — Border radii and styles
- `tokens/breakpoints.ts` — Responsive breakpoints (xs:320 through 2xl:1536)
- `tokens/elevation.ts` — Shadow elevation levels
- `tokens/motion.ts` — Animation durations, easing curves
- `tokens/shadows.ts` — Box shadow definitions
- `tokens/layout.ts` — Container widths, content widths
- `tokens/semantic.ts` — Contextual color mappings
- `tokens/z-index.ts` — Stacking order
- `native/index.ts` — React Native-specific exports (numeric values instead of CSS strings)
- Update Super App `ThemeContext.tsx` to consume these tokens instead of custom `constants/colors.ts`
**Effort**: Small
**Dependencies**: None

### T0.2: Port SDUI Protocol Package
**Create**: `packages/sdui-protocol/`
**Source**: `@dakkah/sdui-protocol` from CMS
**Deliverables**:
- `schemas.ts` — Zod schemas for all SDUI types:
  - Primitives: `SdColorSchema`, `SdSizeSchema`, `SdAlignmentSchema`, `SdModifiersSchema`
  - Actions: `SdActionSchema` (navigate, api_mutation, open_url, copy_text, share, trigger_workflow, deep_link, request_hardware_access)
  - Nodes: `SdTextNodeSchema` (h1-h4/body/caption/label), `SdButtonNodeSchema` (solid/outline/ghost/link), `SdImageNodeSchema`, `SdCarouselNodeSchema`, `SdGridNodeSchema`, `SdMapNodeSchema`, `SdStackNodeSchema`, `SdCardNodeSchema`
  - Payload: `SdPayloadSchema` (version, screenId, title, root node)
  - Capabilities: `SdCapabilitiesSchema` (os, osVersion, screenClass, inputMethods)
- `index.ts` — All TypeScript type exports
- Add `zod` dependency
**Effort**: Small
**Dependencies**: None

### T0.3: Build SduiRenderer for React Native (Mobile)
**Create**: `packages/sdui-renderer-native/`
**Source**: Adapted from CMS `apps/superapp/src/components/SduiRenderer.tsx`
**Deliverables**:
- `SduiRenderer.tsx` — Recursive renderer mapping SDUI nodes to React Native primitives:
  - `text` → `<Text>` with variant styling (h1=28px bold, body=16px, caption=12px, etc.)
  - `button` → `<TouchableOpacity>` with solid/outline/ghost/link variants using design tokens
  - `image` → `<Image>` with aspect ratio + content mode
  - `stack` → `<View>` with flexDirection horizontal/vertical, alignment, spacing, wrap
  - `card` → `<TouchableOpacity>` with shadow, border radius, onPress action
  - `carousel` → `<FlatList horizontal>` with snap-to-item, autoPlay timer
  - `grid` → `<View flexWrap>` with column calculation
  - `map` → `<MapView>` (react-native-maps) with markers and onPress
- `ActionHandler.ts` — Central dispatcher for `SdAction` types:
  - `navigate` → React Navigation or Expo Router
  - `api_mutation` → POST to BFF with payload
  - `open_url` → `Linking.openURL()`
  - `copy_text` → `Clipboard.setStringAsync()`
  - `share` → `Share.share()`
  - `deep_link` → `Linking.openURL()`
  - `request_hardware_access` → Permission request flow
- `ModifierStyles.ts` — Maps `SdModifiers` to React Native `StyleSheet` values
**Effort**: Medium
**Dependencies**: T0.1, T0.2

### T0.4: Build SduiRenderer for React DOM (Web)
**Create**: `packages/sdui-renderer-web/`
**Source**: Adapted from CMS `apps/web-platform/src/components/SduiRenderer.tsx`
**Deliverables**:
- `SduiRenderer.tsx` — Recursive renderer mapping SDUI nodes to HTML/React:
  - `text` → `<h1>`-`<h4>`, `<p>`, `<span>` with Tailwind classes
  - `button` → `<button>` with variant classes
  - `image` → `<img>` with aspect ratio + object-fit
  - `stack` → `<div className="flex">` with direction, gap, alignment
  - `card` → `<div>` with shadow, rounded, click handler
  - `carousel` → Horizontal scroll container with snap
  - `grid` → `<div className="grid grid-cols-{n}">` with gap
  - `map` → Leaflet or Mapbox embed
- `ActionHandler.ts` — Web-specific action dispatcher:
  - `navigate` → React Router navigation
  - `api_mutation` → fetch POST
  - `open_url` → `window.open()`
  - `copy_text` → `navigator.clipboard.writeText()`
  - `share` → Web Share API
- `ModifierStyles.ts` — Maps `SdModifiers` to Tailwind utility classes
**Effort**: Medium
**Dependencies**: T0.1, T0.2

### T0.5: Build Auth SDK (Keycloak PKCE)
**Create**: `packages/auth/`
**Source**: `@cityos/auth` from CMS
**Deliverables**:
- `pkce.ts` — PKCE code verifier/challenge generation
- `context.tsx` — `AuthProvider` + `useAuth()` hook:
  - `login()` — Redirect to Keycloak authorization endpoint
  - `logout()` — Revoke tokens + redirect
  - `getToken()` — Return current JWT (auto-refresh if expired)
  - `user` — Decoded JWT claims (id, email, name, roles, tenant_id)
  - `isAuthenticated` / `isLoading` states
- `types.ts` — `User`, `AuthState`, `KeycloakConfig` interfaces
- Configure for Keycloak at port 8080 with realm `cityos`
- SecureStore (Expo) for token persistence on mobile
- localStorage for web apps
**Effort**: Medium
**Dependencies**: None

### T0.6: Build API Client Package
**Create**: `packages/api-client/`
**Deliverables**:
- `client.ts` — Configured fetch wrapper with:
  - Base URL resolution (CMS host + BFF ports)
  - Authorization header injection (Keycloak JWT)
  - `x-tenant-id` header injection
  - `x-cityos-surface` header injection (mobile/tablet/desktop/kiosk/tv/carplay)
  - `x-correlation-id` header (UUID per request)
  - Error handling + retry logic
- `sdui.ts` — SDUI-specific client:
  - `fetchScreen(screenId, surface, tenantId)` → `SdPayload`
  - `dispatchAction(action: SdAction)` → response
- `bff.ts` — BFF service clients:
  - `bffCommerce(port 4001)` — products, cart, checkout, orders
  - `bffGovernance(port 4002)` — permits, proposals, citizen services
  - `bffHealthcare(port 4003)` — appointments, records
  - `bffTransport(port 4004)` — fleet tracking, delivery
  - `bffEvents(port 4005)` — events, sports, tourism
  - `bffPlatform(port 4006)` — auth, tenancy, notifications
  - `bffIot(port 4007)` — IoT sensors, agriculture
  - `bffSocial(port 4008)` — social media, engagement
**Effort**: Medium
**Dependencies**: T0.5

---

## PHASE 1: SUPER APP COMPLETION

The Super App (`artifacts/mobile`) is already in development with 48 artifacts, 21 scenarios, full chat, dark mode, i18n. Now connect it to the real CMS backend.

### T1.1: Integrate Keycloak Auth
**Modify**: `artifacts/mobile/context/AuthContext.tsx`
**Deliverables**:
- Replace AsyncStorage profile with Keycloak OIDC PKCE flow
- Use `expo-auth-session` for OAuth redirect
- Store tokens in `expo-secure-store`
- Decode JWT for user profile (id, email, name, roles, tenant_id)
- Auto-refresh tokens before expiry
- Update LoginScreen UI with Keycloak redirect button
**Effort**: Medium
**Dependencies**: T0.5

### T1.2: Integrate SDUI Rendering
**Modify**: `artifacts/mobile/components/artifacts/ArtifactRenderer.tsx`
**Deliverables**:
- Add `SduiRenderer` from `packages/sdui-renderer-native` as a new artifact type
- When AI response includes SDUI payload, render it inline in chat
- Add `DynamicScreen` component that fetches SDUI from Experience Composer
- Wire `SdAction` dispatch to API client
- Add surface capability headers: `x-cityos-surface: mobile`, `x-cityos-os: ios/android`
**Effort**: Medium
**Dependencies**: T0.3, T0.6

### T1.3: Connect to Copilot Gateway
**Modify**: `artifacts/mobile/context/ChatContext.tsx`, `artifacts/api-server/`
**Deliverables**:
- Route AI chat through CMS `/api/ai/chat` endpoint
- Support Generative SDUI: AI responses can include SDUI blocks rendered inline
- Intent detection: user messages analyzed by CMS AI for routing to correct BFF
- Connect to `/api/ai/execute` for action execution
- Fallback to local scenarios when CMS is unreachable
**Effort**: Medium
**Dependencies**: T0.6, T1.2

### T1.4: Server-Side Thread Persistence
**Modify**: `artifacts/mobile/context/ChatContext.tsx`, `artifacts/api-server/`
**Deliverables**:
- Store threads and messages in CMS PostgreSQL via BFF Platform
- Sync local AsyncStorage cache with server
- Conflict resolution: server wins, local used for offline
- Thread metadata: created_at, updated_at, participant_ids, tenant_id
**Effort**: Medium
**Dependencies**: T0.6, T1.1

### T1.5: BFF Commerce Integration
**Modify**: `artifacts/api-server/`, add new scenarios
**Deliverables**:
- Connect to bff-commerce (port 4001)
- Product browsing: search, categories, filters → rendered as SDUI product cards
- Cart management: add/remove/update → SDUI cart view
- Checkout flow: address → delivery → payment → confirmation
- Order tracking: real-time status updates
- Add commerce-related artifacts: product-detail, cart-summary, checkout-flow, order-status
**Effort**: Large
**Dependencies**: T1.2, T1.3

### T1.6: Push Notifications + Copilot Settings
**Modify**: `artifacts/mobile/`
**Deliverables**:
- Expo push notification registration
- Notification categories: orders, delivery, city alerts, events, chat
- Copilot Settings dialog: AI temperature, model selection, privacy mode, language
- Toast notification system for in-app feedback
**Effort**: Small
**Dependencies**: T1.1

---

## PHASE 2: MOBILE APPS (Driver, Merchant, POS)

### T2.1: Driver App
**Create**: New Expo mobile artifact `artifacts/driver-app`
**Target Users**: Delivery drivers, fleet drivers, field service agents
**CMS Scaffold Reference**: `apps/driver-app` (9 files: LoginScreen, DynamicScreen, SduiRenderer, AuthContext)
**Deliverables**:
- **Auth**: Keycloak login with `driver` / `courier` role
- **Home Screen**: SDUI-driven from `/api/sdui/driver_home?surface=mobile`
  - Working state: `SdList` of active waypoints, delivery queue, navigation
  - Off-duty state: "Go Online" `SdButton` + earnings summary
- **Delivery Flow**: Accept job → navigate → pickup → proof-of-delivery → complete
- **Map Integration**: Live map with route, next stop, ETA
- **Status Updates**: Online/Offline toggle, break mode
- **Proof of Delivery**: Camera capture, signature pad, barcode scan
- **Offline Tolerance**: Queue status updates when offline, sync on reconnect
- **Notifications**: New job alerts, dispatch changes, route updates
- **Earnings Dashboard**: Daily/weekly earnings, trip history
- **Vehicle Checklist**: Pre-trip inspection form
- **Emergency**: SOS button, incident reporting
- **BFF Connection**: bff-transport (port 4004) for fleet/delivery data
- **Fleetbase Integration**: Real-time position tracking, job assignment
**Effort**: Large
**Dependencies**: Phase 0, T1.1

### T2.2: Merchant App
**Create**: New Expo mobile artifact `artifacts/merchant-app`
**Target Users**: Shop owners, restaurant staff, vendors (tablets)
**CMS Scaffold Reference**: `apps/merchant-app` (10 files: LoginScreen, RegisterScreen, DynamicScreen, SduiRenderer, AuthContext)
**Deliverables**:
- **Auth**: Keycloak login with `merchant` / `vendor` role + registration flow
- **Home Screen**: SDUI-driven from `/api/sdui/merchant_home?surface=tablet`
- **Order Management**: Incoming orders, accept/reject, preparation status, ready for pickup
- **Menu/Catalog Management**: Add/edit products, prices, availability, images
- **Inventory Tracking**: Stock levels, low-stock alerts, reorder triggers
- **Booking Management**: Incoming reservations, calendar view, table management
- **Campaign Participation**: Promotions, flash sales, loyalty program configuration
- **Analytics Dashboard**: Sales summary, popular items, peak hours, customer insights
- **Staff Management**: Employee accounts, shift scheduling, role assignment
- **Customer Communication**: Order chat, automated messages, review responses
- **Notifications**: New orders, low stock, booking requests, campaign deadlines
- **BFF Connection**: bff-commerce (port 4001) for catalog/orders
- **Medusa Integration**: Product CRUD, order lifecycle, inventory management
**Effort**: Large
**Dependencies**: Phase 0, T1.1, T1.5

### T2.3: POS / Counter Runtime
**Create**: New Expo mobile artifact `artifacts/pos-app`
**Target Users**: Cashiers, counter staff (Android POS terminals, self-order kiosks, iPads)
**CMS Architecture Reference**: `docs/architecture/design_merchant_app.md`
**Deliverables**:
- **Auth**: Keycloak login with `cashier` / `pos_operator` role, PIN-based fast login
- **Home Screen**: SDUI-driven from `/api/sdui/tablet_pos?surface=tablet`
- **Point of Sale Flow**:
  - Product grid with categories, search, barcode scan
  - Cart with quantity adjustment, discounts, tax calculation
  - Payment processing: cash, card (Stripe terminal), NFC tap
  - Split payment support
  - Receipt generation (on-screen + thermal printer command)
  - Cash drawer open command
- **Hardware Bridge** (simulated in Replit, real on device):
  - `SdScannerInput` → Camera-based barcode/QR scanning via `expo-camera`
  - `SdPeripheral` → Bluetooth thermal printer commands (ESC/POS protocol simulation)
  - NFC reader for contactless payments
- **Order Queue**: Kitchen display view, preparation status, ready notifications
- **Offline Tolerance**:
  - Action queueing via AsyncStorage/SQLite when network drops
  - Background sync on reconnect — flush queue sequentially
  - Local product catalog cache for offline sales
- **Optimistic UI**: Server returns patched SDUI sub-tree reflecting state changes instantly
- **End-of-Day**: Cash reconciliation, sales summary, shift report
- **Returns & Exchanges**: Process returns, issue store credits, exchange items
- **Customer Lookup**: Search by phone/email/loyalty card, view purchase history
- **BFF Connection**: bff-commerce (port 4001) for commerce operations
- **Medusa Integration**: Order capture, payment processing, inventory decrement
**Effort**: Extra Large
**Dependencies**: Phase 0, T1.1, T1.5

---

## PHASE 3: GOVERNMENT & ANALYTICS DASHBOARDS

### T3.1: City Dashboard
**Create**: New React Vite web artifact `artifacts/city-dashboard`
**Target Users**: City operations managers, control room operators, district admins
**CMS Scaffold Reference**: `apps/city-dashboard` (12 files: AuthGuard, SduiRenderer, Keycloak auth)
**Deliverables**:
- **Auth**: Keycloak with `city_admin` / `district_ops` role
- **Theme**: Dark slate-900 background (CMS design)
- **Title**: "CityOS Macro Analytics — Real-Time SDUI Stream"
- **Home Screen**: SDUI from `/api/sdui/city_analytics?surface=desktop_wide`
- **Dashboard Widgets** (all SDUI-driven):
  - City-wide KPI cards: active deliveries, transit ridership, event attendance, air quality
  - Real-time map: fleet positions, transit routes, incident locations, IoT sensor heatmap
  - Line charts: hourly trends for key metrics
  - Pie charts: service category breakdowns
  - Data grids: top incidents, pending permits, active events
  - Alert feed: critical city notifications
- **IoT Integration**: Live sensor data via bff-iot (port 4007) / Kuzzle WebSocket
- **Governance Panel**: Pending permits, active proposals, citizen feedback queue
- **Event Monitor**: Active events, crowd density, venue capacity
- **Fleet Overview**: Delivery fleet status, public transit compliance
- **BFF Connections**: bff-platform (4006), bff-iot (4007), bff-governance (4002), bff-transport (4004)
**Effort**: Large
**Dependencies**: Phase 0

### T3.2: Business Dashboard
**Create**: New React Vite web artifact `artifacts/business-dashboard`
**Target Users**: Business owners, retail managers, analytics teams
**CMS Scaffold Reference**: `apps/business-dashboard` (12 files: AuthGuard, SduiRenderer, Keycloak auth)
**Deliverables**:
- **Auth**: Keycloak with `merchant_admin` / `business_owner` role
- **Title**: "CityOS Merchant Console — Fully Server-Driven"
- **Home Screen**: SDUI from `/api/sdui/merchant_overview?surface=dashboard`
- **Dashboard Widgets** (all SDUI-driven):
  - Revenue cards: daily/weekly/monthly sales, order count, average order value
  - Product performance: bestsellers, slow movers, inventory alerts
  - Customer analytics: new vs returning, lifetime value, acquisition channels
  - Campaign tracker: active promotions, coupon redemptions, ROI
  - Order pipeline: pending → processing → shipped → delivered funnel
  - Review sentiment: star ratings, keyword cloud, response rate
- **Catalog Management**: Product CRUD forms (SDUI forms), bulk import/export
- **Financial Reports**: Revenue, expenses, profit margins, tax summary
- **BFF Connection**: bff-commerce (port 4001)
**Effort**: Medium
**Dependencies**: Phase 0

### T3.3: Smart City Portal
**Create**: New React Vite web artifact `artifacts/smart-city-portal`
**Target Users**: Citizens accessing government services via web
**CMS Scaffold Reference**: `apps/smart-city-portal` (2 files — minimal scaffold)
**Deliverables**:
- **Auth**: Keycloak with `citizen` role (optional — some services are public)
- **Home Screen**: SDUI from `/api/sdui/citizen_home?surface=web`
- **Citizen Services** (all SDUI-driven):
  - Permit applications: building, business, event permits
  - Public consultations: active proposals, voting, feedback forms
  - Service requests: pothole reports, streetlight issues, noise complaints
  - Document portal: birth certificates, marriage records, property deeds
  - Fee payments: utility bills, parking fines, permit fees
  - Appointment booking: government office visits
- **Transparency Dashboard**: Budget allocation, project progress, spending reports
- **Community Board**: Local announcements, neighborhood events, volunteer opportunities
- **Directory**: Government offices, hours, contact info, map locations
- **BFF Connection**: bff-governance (port 4002), bff-platform (port 4006)
**Effort**: Medium
**Dependencies**: Phase 0

### T3.4: Dev Portal
**Create**: New React Vite web artifact `artifacts/dev-portal`
**Target Users**: Third-party developers, integration partners
**CMS Scaffold Reference**: `apps/dev-portal` (8 files: Auth, AuthCallback, main page)
**Deliverables**:
- **Auth**: Keycloak with `developer` role
- **Home Screen**: SDUI from `/api/sdui/dev_home?surface=web`
- **API Documentation**: Interactive API explorer for all 392 CMS endpoints
- **API Key Management**:
  - Generate tenant-scoped API keys via SDUI `SdForm` → `SdAction: generate_api_token`
  - Key listing, rotation, revocation
  - Usage quotas and rate limit display
- **SDK Downloads**: Links to JavaScript, Python, Swift, Kotlin SDKs
- **Webhook Configuration**: Register webhook URLs, select events, view delivery logs
- **Sandbox Environment**: Test API calls against staging data
- **Integration Guides**: Step-by-step for commerce, payments, fleet, IoT
- **Changelog**: API version history, breaking changes, migration guides
- **BFF Connection**: bff-platform (port 4006)
**Effort**: Medium
**Dependencies**: Phase 0

---

## PHASE 4: CONSUMER WEB, PWA & AI ASSISTANT

### T4.1: Consumer Web Platform
**Create**: New React Vite web artifact `artifacts/web-platform`
**Target Users**: Desktop/mobile browser users (counterpart to Super App)
**CMS Scaffold Reference**: `apps/web-platform` (10 files: SduiRenderer, auth, kiosk page)
**Deliverables**:
- **Auth**: Keycloak (optional for public content)
- **Home Screen**: SDUI from `/api/sdui/home?surface=web`
- **Feature Parity with Super App** (web-adapted):
  - AI Copilot chat interface (web version)
  - Discovery sheet as sidebar or search overlay
  - City context panel
  - All 48+ artifact types rendered via web SduiRenderer
- **SEO Optimization**:
  - Semantic HTML: `<article>`, `<header>`, `<main>`, `<nav>`
  - Meta tags, Open Graph, structured data
  - Server-side rendering where possible (React Vite SSR or pre-rendering)
- **Responsive Design**: Mobile-first with tablet and desktop breakpoints
- **Content Pages**: About, contact, privacy policy, terms of service
- **BFF Connection**: All BFF services as needed
**Effort**: Large
**Dependencies**: Phase 0, T0.4

### T4.2: PWA Desktop App
**Create**: New React Vite web artifact `artifacts/pwa-app`
**Target Users**: Desktop users who install the app for offline access
**CMS Architecture Reference**: `docs/architecture/design_web_platform.md` — PWA section
**Deliverables**:
- **Base**: Fork of Consumer Web Platform with PWA enhancements
- **PWA Manifest**: `manifest.json` with app name, icons, theme colors, display: standalone
- **Service Worker**:
  - Aggressive caching of SDUI structural frames (navigation shell)
  - Cache-first strategy for static assets
  - Network-first for dynamic SDUI payloads with stale-while-revalidate fallback
  - Background sync for queued mutations
- **Offline Mode**:
  - Structural navigation retained offline
  - Dynamic content shows cached version with "offline" indicator
  - Mutative actions (orders, bookings) queued for sync
  - IndexedDB for offline data storage
- **Install Prompt**: Custom install banner for supported browsers
- **Push Notifications**: Web Push API for desktop alerts
- **Graceful Degradation**: Features requiring native APIs (AR, Bluetooth) hidden automatically
- **Auto-Update**: Service worker update detection with user prompt
**Effort**: Medium
**Dependencies**: T4.1

### T4.3: AI Assistant Widget
**Create**: New React Vite web artifact `artifacts/ai-assistant`
**Target Users**: Embedded in any website/app as floating chat button
**CMS Scaffold Reference**: `apps/ai-assistant` (2 files)
**CMS Architecture Reference**: `docs/architecture/design_ai_assistant.md`
**Deliverables**:
- **Widget Shell**: Floating action button (bottom-right) that expands to chat panel
- **Conversational Interface**:
  - Text input + voice input
  - Rich message rendering with inline SDUI blocks
  - Typing indicator, message history
- **Generative SDUI**:
  - User states intent → AI orchestrator executes parallel BFF queries
  - AI constructs valid SDUI AST blocks dynamically
  - Renders rich widgets inline: `SdMap` with pins, `SdGrid` of options, `SdForm` for input
- **Sandboxed Actions**: `SdButton` in AI responses triggers `SdAction` → validated by backend
- **Context Awareness**: Knows which screen/page the user launched from
- **Embeddable Package**: Exportable as `<DakkahAssistant />` React component
- **Theming**: Inherits host app's theme or uses CityOS default
- **BFF Connection**: All BFF services via ai-orchestrator
**Effort**: Large
**Dependencies**: Phase 0, T0.4

---

## PHASE 5: AMBIENT & SPECIALTY SURFACES

### T5.1: Kiosk Runtime
**Create**: New React Vite web artifact `artifacts/kiosk-app`
**Target Users**: Airport terminals, museum screens, mall directories, government offices
**CMS Architecture Reference**: `docs/architecture/design_ambient_surfaces.md` — Kiosk section
**Deliverables**:
- **Full-screen Mode**: No browser chrome, no URL bar, locked navigation
- **Auth**: Guest mode (no login required) + optional Keycloak for staff
- **Home Screen**: SDUI from `/api/sdui/kiosk_home?surface=kiosk`
- **Touch-Optimized UI**:
  - Large touch targets (minimum 64px)
  - No hover states (touch-only)
  - High contrast for ambient lighting
  - Auto-timeout: return to home after inactivity
- **Wayfinding**: Interactive building/venue maps
- **Directory Search**: Search businesses, offices, services
- **Queue Management**: Take a number, estimated wait time
- **Information Display**: Events, announcements, emergency alerts
- **Hardware Bridge Simulation** (simulated in web):
  - `SdPrintNode` → "Print" button that generates PDF receipt
  - NFC scan → manual ID entry fallback
- **Accessibility**: Large text, high contrast, screen reader compatible
- **Capability Header**: `x-cityos-surface: kiosk`
**Effort**: Medium
**Dependencies**: Phase 0, T0.4

### T5.2: TV App (Web Simulator)
**Create**: New React Vite web artifact `artifacts/tv-app`
**Target Users**: Digital signage, smart TV users, public displays
**CMS Architecture Reference**: `docs/architecture/design_ambient_surfaces.md` — TV section
**Deliverables**:
- **Display Mode**: 1920x1080 fixed layout, 10-foot viewing distance optimized
- **Home Screen**: SDUI from `/api/sdui/tv_home?surface=tv_1080p`
- **Spatial Navigation Simulator**:
  - Keyboard arrow keys simulate D-Pad (Up/Down/Left/Right/Enter)
  - Visible focus ring on currently selected element
  - No mouse interaction — D-Pad only
- **Content Layout**:
  - Horizontal carousels (not grids) for browsing
  - Large card tiles with prominent images
  - Minimal text, maximum visual impact
  - Auto-scrolling content for passive viewing mode
- **Use Cases**:
  - Restaurant menu boards: rotating menu with prices
  - Hotel lobby: events, weather, local attractions
  - Public signage: city announcements, transit schedules
  - Retail: product showcase, promotions
- **Capability Negotiation**: Grid/table nodes auto-converted to horizontal carousel
- **Capability Header**: `x-cityos-surface: tv_1080p`
**Effort**: Medium
**Dependencies**: Phase 0, T0.4

### T5.3: Car App (Web Simulator)
**Create**: New Expo mobile artifact `artifacts/car-app` (or React Vite)
**Target Users**: Fleet drivers using CarPlay/Android Auto
**CMS Architecture Reference**: `docs/architecture/design_ambient_surfaces.md` — Car section
**Deliverables**:
- **Display Mode**: Simplified list-based UI simulating CarPlay/Android Auto constraints
- **Home Screen**: SDUI from `/api/sdui/carplay_home?surface=carplay`
- **Ultra-Strict Templates** (simulating OS constraints):
  - List templates only — no grids, no cards, no complex layouts
  - Maximum 5 list items visible at once
  - Large tap targets for driving safety
  - Text truncation: max 2 lines per item
  - No images larger than icons
- **Use Cases**:
  - Driver next delivery/pickup
  - Navigation to waypoint
  - Order status updates (audio announcements)
  - "Go Online/Offline" toggle
- **Voice Integration**: All actions accessible via voice command simulation
- **Capability Negotiation**: All `grid`/`card`/`carousel` flattened to `SdList`
- **Capability Header**: `x-cityos-surface: carplay`
**Effort**: Small-Medium
**Dependencies**: Phase 0

---

## DEPENDENCY GRAPH

```
Phase 0 (Foundation)
├── T0.1 Design Tokens ──────────────────────┐
├── T0.2 SDUI Protocol ──────────────────────┤
├── T0.3 SduiRenderer Native (needs T0.1,T0.2)├── Phase 1 (Super App)
├── T0.4 SduiRenderer Web (needs T0.1,T0.2) ─┤   ├── T1.1 Keycloak Auth
├── T0.5 Auth SDK ───────────────────────────┤   ├── T1.2 SDUI Integration
└── T0.6 API Client (needs T0.5) ────────────┘   ├── T1.3 Copilot Gateway
                                                   ├── T1.4 Thread Persistence
                                                   ├── T1.5 BFF Commerce
                                                   └── T1.6 Push Notifications

Phase 1 (Super App) ──┬── Phase 2 (Mobile Apps)
                       │    ├── T2.1 Driver App
                       │    ├── T2.2 Merchant App
                       │    └── T2.3 POS App
                       │
                       ├── Phase 3 (Dashboards)
                       │    ├── T3.1 City Dashboard
                       │    ├── T3.2 Business Dashboard
                       │    ├── T3.3 Smart City Portal
                       │    └── T3.4 Dev Portal
                       │
                       ├── Phase 4 (Web & AI)
                       │    ├── T4.1 Consumer Web
                       │    ├── T4.2 PWA Desktop (needs T4.1)
                       │    └── T4.3 AI Assistant Widget
                       │
                       └── Phase 5 (Ambient)
                            ├── T5.1 Kiosk Runtime
                            ├── T5.2 TV App Simulator
                            └── T5.3 Car App Simulator
```

**Parallelization**: Phases 2, 3, 4, and 5 can run in parallel once Phase 1 is complete. Within each phase, individual apps are independent and can be built concurrently.

---

## EFFORT SUMMARY

| Phase | Tasks | Total Effort | Estimated Complexity |
|---|---|---|---|
| **Phase 0** | 6 shared packages | Medium | Foundation — must be solid |
| **Phase 1** | 6 Super App enhancements | Large | Critical path |
| **Phase 2** | 3 mobile apps | Extra Large | Driver, Merchant, POS |
| **Phase 3** | 4 web dashboards | Large | City, Business, Smart City, Dev |
| **Phase 4** | 3 web apps | Large | Consumer Web, PWA, AI Assistant |
| **Phase 5** | 3 specialty apps | Medium | Kiosk, TV sim, Car sim |
| **TOTAL** | **25 tasks** | **14 apps + 6 packages** | — |

---

## BUILD ORDER RECOMMENDATION

**Step 1** (Foundation): T0.1 + T0.2 + T0.5 in parallel → then T0.3 + T0.4 + T0.6 in parallel
**Step 2** (Super App): T1.1 → T1.2 → T1.3 → T1.4 → T1.5 → T1.6
**Step 3** (Highest value apps first):
  - T2.3 POS App (commerce-critical)
  - T3.1 City Dashboard (government showcase)
  - T2.1 Driver App (logistics-critical)
**Step 4** (Fill out families):
  - T2.2 Merchant App
  - T3.2 Business Dashboard
  - T4.1 Consumer Web Platform
**Step 5** (Extended ecosystem):
  - T3.3 Smart City Portal
  - T3.4 Dev Portal
  - T4.3 AI Assistant Widget
**Step 6** (PWA + Ambient):
  - T4.2 PWA Desktop
  - T5.1 Kiosk Runtime
  - T5.2 TV App Simulator
  - T5.3 Car App Simulator
