# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Dakkah CityOS - Expo React Native mobile app (with enhanced App Menu, Copilot Settings)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `artifacts/mobile` (`@workspace/mobile`) — Dakkah CityOS

**Conversational City Experience OS** — Expo React Native mobile app where all capabilities are accessed through an AI copilot. No traditional navigation; everything is driven by natural language.

#### Architecture
- **Single copilot screen** (`app/index.tsx`) — no tab bars, no dashboards, no forms
- **Copilot brain** (`lib/copilot-brain.ts`) — pattern-matches user intents and returns responses with dynamic UI artifacts
- **Copilot context** (`context/ChatContext.tsx`) — manages messages, threads, processing state with request lifecycle protection
- **Artifact renderer** (`components/artifacts/ArtifactRenderer.tsx`) — maps artifact types to React Native components

#### Artifact Types (47 implemented)
**Original 14:**
- `poi-carousel` — scrollable place cards with images, ratings, vibes
- `event-carousel` — event cards with dates, locations, attendees
- `ambassador-carousel` — trust layer profiles with fit scores
- `itinerary-timeline` — multi-day trip plans with day tabs
- `confirmation-card` — booking/approval flows (Propose mode)
- `comparison-table` — side-by-side evaluations
- `progress-card` — gamification: XP, levels, badges, missions
- `zone-heatmap` — Zone Experience Scores with factor breakdowns
- `selection-chips` — quick action buttons inline in messages
- `ticket-pass` — digital event tickets with QR placeholder
- `order-tracker` — delivery status stepper
- `analytics-snapshot` — metric cards with trends
- `product-carousel` — product cards with prices and tags
- `service-menu` — bookable service listings

**7 New Core Artifacts:**
- `agent-sync-card` — animated multi-step agent card with themed icons, user avatars, step-through animation
- `calendar-selector` — horizontal date strip + bookable time slot grid
- `form-group` — radio/checkbox option selector with prices, confirm button
- `map-view` — static map with pin, navigation button, location footer
- `media-player` — album art, play/pause/skip controls, progress bar
- `payment-request` — payment card with amount, method, pay button
- `ride-status` — Uber-style ride card with driver info, route, ETA

**14 CityOS Micro-Artifacts:**
- `weather-card` — temperature, condition, humidity, wind
- `poll-card` — interactive poll with vote percentages
- `alert-card` — severity-colored alerts (info/warning/critical)
- `document-card` — document preview with status badge
- `receipt-card` — itemized receipt with totals
- `health-snapshot` — health metrics grid with status indicators
- `smart-home-control` — toggleable device grid
- `parking-meter` — parking zone status with extend button
- `parcel-locker` — package tracking with locker code
- `reservation-card` — reservation details with modify/cancel
- `crypto-wallet` — token balances with send/receive/swap
- `task-checklist` — interactive task list with progress bar
- `voice-note` — audio waveform with transcript toggle
- `profile-card` — user profile with stats, tags, follow/message

**12 Domain Vertical Artifacts:**
- `flash-sale-countdown` — countdown timer with product and deal price
- `product-card` — detailed product with add-to-cart button
- `vendor-trust-profile` — seller card with trust score, reviews, badges
- `invoice-preview` — invoice with line items and pay button
- `credit-limit-gauge` — circular progress showing credit usage
- `escrow-status` — escrow milestone tracker
- `symptom-triage` — symptom checker with severity and recommendations
- `lesson-tracker` — course progress with module list
- `permit-application` — permit card with status and documents checklist
- `issue-reporter` — civic issue card with category and location
- `flight-boarding-pass` — airline-style boarding pass with gate and seat
- `currency-converter` — currency conversion with rates

#### Enhanced App Menu
- **User Profile** (`components/UserProfile.tsx`) — avatar, display name, Gold Tier XP progress (4,500/5,000), stats grid (places visited, favorites), wallet balance (SAR)
- **Active Quests** (`components/ActiveQuests.tsx`) — collapsible quest cards with progress bars and XP rewards
- **Copilot Settings** (`components/CopilotSettings.tsx`) — 3-tab settings modal: Behavior (temperature, proactive toggle), Capabilities (web search, context memory), Privacy (privacy mode, model selector). All persisted to AsyncStorage.
- **Support Section** — Help & FAQ link, feedback mailto

#### Scenario Engine
- **189 scenarios** across **21 categories** in `data/scenarios/` JSON files
- Categories: places, services, commerce, transit, social, health, work, outdoor, family, pets, culture, utility, intel, events, planning, misc, home, education, beauty, wellness, my_activity
- Each scenario has: id, keywords array, response text, artifact config, follow-up chips
- **CopilotBrain** in `lib/copilot-brain.ts` uses longest-keyword-match scoring to find best scenario
- Hardcoded patterns run as priority fallback before scenario matching

#### Interaction Modes
- **Suggest** — recommendations, insights (purple badge)
- **Propose** — structured actions requiring confirmation (amber badge)
- **Execute** — instant results (green badge)

#### Discovery & Drawers
- **Action Discovery Sheet** (`components/DiscoverySheet.tsx`) — 20 categories (Food & Drink, Nightlife, Culture, Wellness, Shopping, Services, Transit, Family, Work, Education, Home, Social, Intel, Planning, Outdoor, Beauty, Health, My Activity, Utility) with 80+ quick-action prompts
- **Right Drawer** (`components/RightDrawer.tsx`) — city context panel with quick actions (Ride, Book, Events, Map, Contact, Share, SOS), live activity card, weather summary, today's agenda, community feed
- **Details Drawer** (`components/DetailsDrawer.tsx`) — bottom sheet for entity detail views: POI (hero image, rating, vibe tags, action buttons), ticket (dark pass card with QR), event detail, friend/ambassador profile, order tracking, product detail
- **Thread Management** (`components/ThreadsDrawer.tsx`) — conversation history with AsyncStorage persistence

#### Detail View Flow
- Tapping artifact cards (POI, event, ambassador, ticket, order, product) opens DetailsDrawer with type-specific views
- `onShowDetails` callback wired: `index.tsx` → `CopilotMessage` → `ArtifactRenderer` → individual artifact components
- All detail view actions feed back into the copilot conversation

#### Theme
- Primary: teal `#0A9396`
- Dark navy: `#0D1B2A` (user bubbles, headers)
- Stone/neutral palette for surfaces

#### Key Dependencies
- Expo 54, React Native 0.81
- expo-router (file-based routing)
- react-native-keyboard-controller
- react-native-safe-area-context
- @react-native-async-storage/async-storage
- Inter font family

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
