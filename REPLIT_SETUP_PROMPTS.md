# Replit Setup Prompts for Dakkah CityOS Split Repos

---

## PROMPT 1: Mobile Expo Replit

**GitHub Repo:** `https://github.com/dakkah-core/dakkah-cityos-mobile.git`
**Branch:** `main`

> ### Project Setup — Dakkah CityOS Mobile
>
> **GitHub repo:** `https://github.com/dakkah-core/dakkah-cityos-mobile.git` (branch: `main`)
>
> This is **Dakkah CityOS Mobile** — a pnpm monorepo containing all Expo React Native mobile apps for the Dakkah CityOS universal super-app platform. The platform is accessed entirely through a conversational AI copilot — there is NO traditional UI navigation. All city services are accessed by chatting with the AI assistant.
>
> ---
>
> #### Apps in this repo (4 Expo apps):
>
> | App | Directory | Package Name | Description |
> |-----|-----------|--------------|-------------|
> | **Consumer Super App** | `apps/mobile` | `@cityos/mobile` | Main citizen-facing app — AI copilot for all city services (commerce, transport, healthcare, governance, events, IoT, social). 189 scenario engine, 49 artifact types. |
> | **Driver App** | `apps/mobile-driver` | `@cityos/mobile-driver` | Delivery driver app — job dashboard, delivery timeline with step-by-step CTAs, earnings tracker, vehicle inspection, SOS, offline tolerance. |
> | **Merchant App** | `apps/mobile-merchant` | `@cityos/mobile-merchant` | Store/merchant management — order queue, catalog management, inventory tracking, booking calendar, sales analytics dashboard. |
> | **POS App** | `apps/mobile-pos` | `@cityos/mobile-pos` | Point-of-sale terminal — shift management, product grid, cart & checkout, receipt generation, kitchen display, returns, end-of-day reports. |
>
> #### Shared packages (9 packages):
>
> | Package | Directory | Description |
> |---------|-----------|-------------|
> | `@cityos/mobile-core` | `packages/mobile-core` | Shared React Native components, contexts (Chat, Auth, Theme), AI client, i18n (EN/AR + RTL), scenario engine, artifact renderers |
> | `@cityos/design-tokens` | `packages/design-tokens` | Design system tokens — primary navy `#0a1628`, accent blue `#3182ce`, teal `#0d9488`, amber `#d97706`, rose `#e11d48` |
> | `@cityos/sdui-protocol` | `packages/sdui-protocol` | Server-Driven UI protocol — Zod schemas and TypeScript types for SDUI nodes, actions, modifiers |
> | `@cityos/sdui-renderer-native` | `packages/sdui-renderer-native` | Native SDUI renderer — maps SDUI nodes to React Native components |
> | `@cityos/auth` | `packages/auth` | Keycloak OIDC PKCE authentication — AuthProvider, useAuth() hook, token management |
> | `@cityos/api-client` | `packages/api-client` | CityOS API client for backend communication |
> | `@cityos/api-spec` | `packages/api-spec` | OpenAPI 3.1 specification for all APIs |
> | `@cityos/api-zod` | `packages/api-zod` | Generated Zod validation schemas from OpenAPI spec |
> | `@cityos/api-client-react` | `packages/api-client-react` | React Query hooks for API calls |
>
> #### Setup instructions:
>
> 1. Run `pnpm install`
> 2. Register the **Consumer app** (`apps/mobile`) as the main Expo mobile artifact
> 3. Set up the other 3 apps as separate workflows:
>    - **Driver:** `PORT=3001 pnpm --filter @cityos/mobile-driver run dev`
>    - **Merchant:** `PORT=3002 pnpm --filter @cityos/mobile-merchant run dev`
>    - **POS:** `PORT=3003 pnpm --filter @cityos/mobile-pos run dev`
>
> #### Architecture rules:
>
> - **AI copilot ONLY** — NO traditional navigation UI. Single conversational interface for everything.
> - All apps share code via `@cityos/mobile-core` (barrel export at `packages/mobile-core/src/index.ts`)
> - Role-specific contexts (DriverContext, MerchantContext, PosContext) remain local to each app
> - Internationalization: English + Arabic with RTL support via `packages/mobile-core/src/lib/i18n.ts`
> - Haptics: Use `hapticMedium()` from shared lib for feedback
> - All 4 apps support light/dark mode via ThemeContext
>
> #### CMS alignment (CRITICAL):
>
> Always check the CMS backend repo before making structural changes:
> **CMS Repo:** `https://github.com/dakkah-core/dakkah-cityos-cms.git`
>
> The CMS (Payload CMS) is the source of truth for:
> - **SDUI screens** (`SduiScreens` collection) — all dynamic UI screens are defined there
> - **Design tokens** — colors, spacing, typography must match CMS configuration
> - **Feature flags** (`FeatureFlags` collection) — controls which features are enabled per tenant
> - **Service catalog** (`ServiceCatalog` collection) — available services and their configurations
> - **Personas** (`Personas` + `PersonaAssignments`) — user roles and permissions
> - **AI prompts/responses** (`AIPrompts`, `AIResponses`) — copilot behavior configuration
> - **White-label configs** (`WhiteLabelConfigs`) — tenant-specific branding
> - **Workflow definitions** (`Workflows`, `WorkflowTriggers`) — business process automation
> - **Verticals registry** (`verticals.registry.yaml`) — defines all service verticals
> - **POI data model** (90+ POI collections) — Points of Interest structure
>
> When adding new features, artifacts, or SDUI screens, verify they align with the CMS collections and schemas. The CMS API endpoints and content types drive what the mobile apps can render.
>
> #### Future apps to add (not yet built):
>
> These apps should be created as additional Expo apps in `apps/` when needed:
> - **Field Agent App** (`apps/mobile-field-agent`) — for city inspectors, maintenance crews (matches `FieldAgentProfiles` CMS collection)
> - **Healthcare Provider App** — for clinic/hospital staff
> - **Transport Operator App** — for bus/metro operators
> - **Event Manager App** — for event organizers and venue staff

---

## PROMPT 2: Web Platform Replit

**GitHub Repo:** `https://github.com/dakkah-core/dakkah-cityos-web.git`
**Branch:** `main`

> ### Project Setup — Dakkah CityOS Web
>
> **GitHub repo:** `https://github.com/dakkah-core/dakkah-cityos-web.git` (branch: `main`)
>
> This is **Dakkah CityOS Web** — a pnpm monorepo containing all web applications, dashboards, the BFF API gateway, and shared web packages for the Dakkah CityOS universal super-app platform. The platform is accessed entirely through a conversational AI copilot — there is NO traditional UI navigation.
>
> ---
>
> #### Apps in this repo (6 web apps + 1 API service):
>
> | App | Directory | Package Name | Description |
> |-----|-----------|--------------|-------------|
> | **Web Platform / PWA** | `apps/web-platform` | `@cityos/web-platform` | Consumer-facing progressive web app — AI copilot chat, discovery sidebar, 8 service categories. Plus ambient surfaces: Kiosk mode (`/kiosk`), TV digital signage (`/tv`), Car dashboard (`/car`). Responsive for desktop, tablet, mobile. |
> | **Business Dashboard** | `apps/business-dashboard` | `@cityos/business-dashboard` | Multi-location merchant management portal — "Dakkah Business" branding, AI-powered insights, revenue analytics, inventory, staff management. |
> | **City Dashboard** | `apps/city-dashboard` | `@cityos/city-dashboard` | Municipal operations center — real-time city stats, service monitoring, infrastructure health, incident management. |
> | **Smart City Portal** | `apps/smart-city-portal` | `@cityos/smart-city-portal` | Citizen-facing web portal — access city services, submit requests, track permits, view public data. |
> | **Developer Portal** | `apps/dev-portal` | `@cityos/dev-portal` | API platform for third-party developers — documentation, API keys, sandbox environment, webhook management. |
> | **Mockup Sandbox** | `apps/mockup-sandbox` | `@cityos/mockup-sandbox` | Component preview server for rapid UI prototyping and design iteration. |
> | **BFF Gateway** | `services/bff-gateway` | `@cityos/bff-gateway` | Express 5 API gateway with 8 domain BFF services routing to CMS backend. |
>
> #### BFF Gateway domain services (8 domains):
>
> | Domain | Port | Description |
> |--------|------|-------------|
> | Commerce | 4001 | Checkout, merchant management, product catalog |
> | Transport | 4002 | Ride booking, route planning, fleet tracking |
> | Healthcare | 4003 | Appointments, health records, telemedicine |
> | Governance | 4004 | Public services, permits, reports, compliance |
> | Events/Culture | 4005 | Event listings, registrations, venue management |
> | Platform | 4006 | Multi-tenant config, feature flags, system settings |
> | IoT/Telemetry | 4007 | Device management, sensors, alerts, dashboards |
> | Social | 4008 | Community feed, posts, messaging, engagement |
>
> #### Shared packages (11 packages):
>
> | Package | Directory | Description |
> |---------|-----------|-------------|
> | `@cityos/ui` | `packages/ui` | shadcn/ui component library — 55 components, `cn()` utility, hooks |
> | `@cityos/design-tokens` | `packages/design-tokens` | Design system — primary navy `#0a1628`, accent blue `#3182ce`, teal `#0d9488`, amber `#d97706`, rose `#e11d48` |
> | `@cityos/sdui-protocol` | `packages/sdui-protocol` | Server-Driven UI protocol types and Zod schemas |
> | `@cityos/sdui-renderer-web` | `packages/sdui-renderer-web` | Web SDUI renderer — maps SDUI nodes to React DOM components |
> | `@cityos/auth` | `packages/auth` | Keycloak OIDC PKCE authentication — AuthProvider, useAuth(), createDashboardAuth() |
> | `@cityos/api-client` | `packages/api-client` | CityOS API client |
> | `@cityos/api-spec` | `packages/api-spec` | OpenAPI 3.1 specification |
> | `@cityos/api-zod` | `packages/api-zod` | Generated Zod schemas |
> | `@cityos/api-client-react` | `packages/api-client-react` | React Query hooks |
> | `@cityos/db` | `packages/db` | PostgreSQL database with Drizzle ORM |
> | `@cityos/ai-assistant-widget` | `packages/ai-assistant-widget` | Embeddable `<DakkahAssistant />` React component for adding AI copilot to any website |
>
> #### Setup instructions:
>
> 1. Run `pnpm install`
> 2. Register **Web Platform** (`apps/web-platform`) as the main web artifact at `/` (or `/web-platform/`)
> 3. Register **Business Dashboard** (`apps/business-dashboard`) as a web artifact at `/business-dashboard/`
> 4. Set up the **BFF Gateway** as an API service: `pnpm --filter @cityos/bff-gateway run dev` (port 8080)
> 5. Set up remaining dashboards as additional web workflows:
>    - **City Dashboard:** `PORT=5001 BASE_PATH=/city-dashboard/ pnpm --filter @cityos/city-dashboard run dev`
>    - **Smart City Portal:** `PORT=5002 BASE_PATH=/smart-city-portal/ pnpm --filter @cityos/smart-city-portal run dev`
>    - **Developer Portal:** `PORT=5003 BASE_PATH=/dev-portal/ pnpm --filter @cityos/dev-portal run dev`
>
> #### Architecture rules:
>
> - **AI copilot ONLY** — NO traditional navigation UI. All dashboards use a conversational AI interface.
> - All dashboards use `createDashboardAuth()` from `@cityos/auth` for authentication with guest/demo access
> - SDUI fetching uses `useSduiScreen()` from `@cityos/sdui-renderer-web`
> - Web Platform includes a PWA service worker (cache-first for static, network-first for SDUI, offline fallback)
> - Web Platform has IndexedDB offline store for messages, SDUI cache, and mutation queue
> - All web apps support light/dark mode
> - Responsive design: desktop, tablet, mobile breakpoints
>
> #### CMS alignment (CRITICAL):
>
> Always check the CMS backend repo before making structural changes:
> **CMS Repo:** `https://github.com/dakkah-core/dakkah-cityos-cms.git`
>
> The CMS (Payload CMS) is the source of truth for:
> - **SDUI screens** (`SduiScreens` collection) — all dynamic UI screens rendered by web apps
> - **Design tokens** — colors, spacing, typography must match CMS configuration
> - **Feature flags** (`FeatureFlags` collection) — controls enabled features per tenant
> - **Service catalog** (`ServiceCatalog` collection) — available services and configurations
> - **Page templates** (`Pages`, `PageLayoutTemplates`, `Templates`) — CMS-driven page structures
> - **Block manifests** (`BlockManifests`) — SDUI block definitions and schemas
> - **POI data model** (90+ POI collections) — Points of Interest for maps, directories, search
> - **AI prompts/responses** (`AIPrompts`, `AIResponses`) — copilot behavior per surface
> - **White-label configs** (`WhiteLabelConfigs`) — tenant-specific branding and theming
> - **Routing rules** (`RoutingRules`) — API routing and BFF proxy configuration
> - **Workflow definitions** (`Workflows`, `WorkflowTriggers`, `WorkflowEvents`) — business processes
> - **Verticals registry** (`verticals.registry.yaml`) — defines all 18 service verticals
> - **Tenant router** (`services/tenant-router`) — multi-tenant routing logic
> - **Experience composer** (`services/experience-composer`) — dynamic SDUI composition
> - **Capability negotiator** (`services/capability-negotiator`) — surface-aware capability detection
>
> The BFF Gateway (`services/bff-gateway`) proxies requests to the CMS backend. When adding new API routes, SDUI screens, or service domains, verify they exist in the CMS collections and align with the CMS schema. The `api-spec` package OpenAPI definition should match the CMS endpoints.
>
> #### Future apps/portals to add (not yet built as standalone apps):
>
> These portals should be created as additional web apps in `apps/` when needed:
> - **Healthcare Portal** (`apps/healthcare-portal`) — patient portal for appointments, records, telemedicine
> - **Education Portal** (`apps/education-portal`) — learning platform, school management
> - **Transport Hub** (`apps/transport-hub`) — public transport dashboard, route planning, fleet management
> - **IoT Dashboard** (`apps/iot-dashboard`) — sensor monitoring, device management, alert center
> - **Social Platform** (`apps/social-platform`) — community engagement, neighborhood forums
> - **Governance Portal** (`apps/governance-portal`) — citizen services, permits, public consultations
> - **Events & Culture Hub** (`apps/events-hub`) — event management, cultural listings, venue booking

---

## Reference: All 3 GitHub Repos

| Repo | URL | Purpose |
|------|-----|---------|
| **CMS Backend** | `https://github.com/dakkah-core/dakkah-cityos-cms.git` | Payload CMS — source of truth for all data models, SDUI screens, collections, workflows |
| **Mobile Apps** | `https://github.com/dakkah-core/dakkah-cityos-mobile.git` | Expo React Native — Consumer, Driver, Merchant, POS apps |
| **Web Apps** | `https://github.com/dakkah-core/dakkah-cityos-web.git` | Web platform, dashboards, BFF gateway, shared web packages |
| **Original Monorepo** | `https://github.com/dakkah-core/dakkah-cityos-apps.git` | Original combined repo (archived — now split into mobile + web) |

