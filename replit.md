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
├── artifacts/              # Deployable applications (18 app families planned)
│   ├── api-server/         # Express API server with Gateway & 11 domain services
│   ├── mobile/             # Super App - Expo React Native (IN DEVELOPMENT)
│   ├── driver-app/         # Driver App - Expo React Native (PLANNED)
│   ├── merchant-app/       # Merchant App - Expo React Native (PLANNED)
│   ├── pos-app/            # POS/Counter - Expo React Native (PLANNED)
│   ├── car-app/            # Car App simulator - Expo/Vite (PLANNED)
│   ├── web-platform/       # Consumer Web - React Vite (PLANNED)
│   ├── pwa-app/            # PWA Desktop - React Vite + SW (PLANNED)
│   ├── ai-assistant/       # AI Assistant Widget - React Vite (PLANNED)
│   ├── city-dashboard/     # City Dashboard - React Vite (PLANNED)
│   ├── business-dashboard/ # Business Dashboard - React Vite (PLANNED)
│   ├── smart-city-portal/  # Smart City Portal - React Vite (PLANNED)
│   ├── dev-portal/         # Dev Portal - React Vite (PLANNED)
│   ├── kiosk-app/          # Kiosk Runtime - React Vite (PLANNED)
│   └── tv-app/             # TV App simulator - React Vite (PLANNED)
├── lib/                    # Shared libraries
│   ├── design-tokens/      # CMS design token bridge (11 token categories + native exports) ✅
│   ├── sdui-protocol/      # SDUI Zod schemas + types (8 nodes, 8 actions, capabilities) ✅
│   ├── sdui-renderer-native/ # React Native SDUI renderer (recursive, 8 node types) ✅
│   ├── sdui-renderer-web/  # React DOM SDUI renderer (Tailwind CSS, 8 node types) ✅
│   ├── auth/               # Keycloak PKCE auth SDK (AuthProvider, token refresh) ✅
│   ├── api-client/         # BFF API client (8 ports, tenant/surface headers) ✅
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── FEATURE_MATRIX.md       # Complete capability inventory (18 apps, 392 APIs, 920+ blocks)
├── IMPLEMENTATION_PLAN.md  # Detailed build plan (25 tasks across 6 phases)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## CMS Backend Target
- **Repo**: `https://github.com/dakkah-core/dakkah-cityos-cms.git`
- **GitHub**: `dakkah-core/dakkah-cityos-apps` (this project)
- **Migration**: All apps will eventually move to `apps/` in CMS monorepo
- **Key Systems**: Payload CMS (5000), Medusa (9000), Keycloak (8080), 8 BFF services (4001-4008)
- **SDUI Endpoint**: `GET /api/sdui/{screenId}?surface={target}&tenant={tenantId}`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` during typecheck; JS bundling by esbuild/tsx/vite
- **Project references** — A depends on B → A's tsconfig must list B in references

## Root Scripts

- `pnpm run build` — typecheck + recursive build
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with Gateway architecture.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App: `src/app.ts` — mounts CORS, JSON parsing (10mb limit), routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/gateway.ts` — `POST /api/gateway` + `GET /api/health/dashboard`
  - `src/routes/ai.ts` — `POST /api/ai/chat` (OpenAI gpt-5-mini) + `POST /api/ai/transcribe` (speech-to-text)
- Services: `src/services/gateway.ts` — 11 domain services:
  - AI, Commerce, Payments, Identity, Logistics, Health, ERP, Content, Comms, Workflows, Storage
  - Each returns typed mock data; structured for real API integration later
  - System Health Dashboard aggregates all service statuses
- AI: Uses Replit AI Integrations for OpenAI (env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)

### `artifacts/mobile` (`@workspace/mobile`) — Dakkah CityOS

**Conversational City Experience OS** — Expo React Native mobile app where all capabilities are accessed through an AI copilot.

#### Architecture
- **Single copilot screen** (`app/index.tsx`) — no tab bars, no dashboards, no forms
- **Copilot brain** (`lib/copilot-brain.ts`) — pattern-matches user intents, returns responses with dynamic UI artifacts
- **Copilot context** (`context/ChatContext.tsx`) — manages messages, threads, reactions, pinning, editing, mute state; supports AI fallback mode
- **Auth context** (`context/AuthContext.tsx`) — user profile management with AsyncStorage persistence (sign in/out, profile updates)
- **Theme context** (`context/ThemeContext.tsx`) — light/dark mode with AsyncStorage persistence
- **Artifact renderer** (`components/artifacts/ArtifactRenderer.tsx`) — maps 47 artifact types to React Native components
- **Gateway client** (`lib/gateway.ts`) — typed client for api-server gateway
- **AI client** (`lib/ai-client.ts`) — OpenAI chat + audio transcription via api-server
- **i18n** (`lib/i18n.ts`) — English/Arabic translations (60+ keys), RTL detection

#### Chat Interaction Features
- **Message reactions** — long-press context menu with 6 emoji presets, toggleable reaction badges
- **Message pinning** — pin/unpin messages with visual indicator
- **Reply-to-message** — quoted preview above input, reply strip on message
- **Message editing** — edit own messages inline with save/cancel, "(edited)" label
- **@mention system** — type "@" to trigger contact popover with 6 city personas
- **/slash commands** — type "/" for command palette (10 commands: /explore, /book, /report, etc.)
- **In-chat search** — search bar with match count, up/down navigation, message highlighting
- **Message context menu** — long-press action sheet with React, Reply, Pin, Edit

#### Artifact Types (47 implemented)
**Original 14:** poi-carousel, event-carousel, ambassador-carousel, itinerary-timeline, confirmation-card, comparison-table, progress-card, zone-heatmap, selection-chips, ticket-pass, order-tracker, analytics-snapshot, product-carousel, service-menu

**7 New Core:** agent-sync-card, calendar-selector, form-group, map-view, media-player, payment-request, ride-status

**14 CityOS Micro-Artifacts:** weather-card, poll-card, alert-card, document-card, receipt-card, health-snapshot, smart-home-control, parking-meter, parcel-locker, reservation-card, crypto-wallet, task-checklist, voice-note, profile-card

**12 Domain Verticals:** flash-sale-countdown, product-card, vendor-trust-profile, invoice-preview, credit-limit-gauge, escrow-status, symptom-triage, lesson-tracker, permit-application, issue-reporter, flight-boarding-pass, currency-converter

#### Dialogs & Overlays
- **GroupInfoDialog** — shows chat participants with roles (admin/member), group description
- **AddMemberDialog** — searchable contact picker with checkboxes
- **SharedMediaDialog** — tabbed view (Images/Documents/Links) for shared content
- **SupportDialog** — help form with category, subject, description
- **FullSettingsDialog** — tabbed settings (General: dark mode, notifications, sounds, haptics, language; Privacy: analytics, data sharing; About: version, build info)
- **ContactProfileModal** — contact details with role, department, status, action buttons
- **ComingSoonModal** — placeholder for unbuilt features (voice/video call)

#### Voice & Media Input
- **Voice input** (`components/VoiceInputButton.tsx`) — microphone button with pulse animation recording modal, waveform visualization; connects to `/api/ai/transcribe` for speech-to-text
- **Media picker** (`components/MediaPickerButton.tsx`) — paperclip button opens photo library/camera picker via expo-image-picker; attachments shown as preview chips before sending
- **Offline indicator** (`components/OfflineIndicator.tsx`) — auto-detecting connectivity status banner

#### AI Integration
- **Dual mode**: local scenario matching (189 scenarios) + real OpenAI fallback (gpt-5-mini)
- **Toggle via Settings**: AI Copilot switch in FullSettingsDialog enables/disables real AI
- **Conversation context**: sends last 6 messages to AI for contextual responses
- **Graceful fallback**: if AI fails, falls back to local copilot-brain response

#### Header Actions
- **Search** (🔍) — opens in-chat message search
- **Phone call** (📞) — Coming Soon placeholder
- **Notification mute** (🔔/🔇) — toggleable with AsyncStorage persistence
- **Context** (☷) — opens RightDrawer
- **Discovery** (◉) — opens DiscoverySheet

#### Enhanced App Menu (ThreadsDrawer)
- **User Profile** — avatar, name, Gold Tier, XP progress, stats, wallet
- **Active Quests** — collapsible quest cards with progress bars
- **Conversations** — searchable thread list with long-press to delete
- **Menu Items** — Group Info, Shared Media, Settings
- **Support** — Help & Support dialog, Send Feedback mailto
- **Copilot Settings** — behavior, capabilities, privacy tabs

#### Scenario Engine
- **189 scenarios** across **21 categories** in `data/scenarios/` JSON files
- CopilotBrain uses longest-keyword-match scoring with hardcoded priority fallback

#### Contacts System
- **6 city personas** in `lib/contacts.ts`: Sarah Al-Rashid (City Planner), Omar Khalid (Transport), Fatima Noor (Sustainability), Ahmed Mansour (Infrastructure), Lina Al-Sayed (Data Science), Yusuf Ibrahim (Security)
- **10 slash commands** in `lib/contacts.ts`
- **6 reaction emojis**: 👍 ❤️ 😊 🎉 🤔 👏

#### Auth System
- **AuthProvider** in `context/AuthContext.tsx` wrapping app in `_layout.tsx`
- Default profile with Gold tier, XP tracking, wallet balance
- Sign in/out with AsyncStorage persistence
- Profile updates (name, email, language, tier progression)

#### Theme System
- Now powered by `@workspace/design-tokens` shared package via `getSemanticColors(mode)`
- CMS palette: primary blue `#3182ce`, navy `#0a1628`, teal `#0d9488`, amber `#d97706`, rose `#e11d48`
- ThemeProvider in `context/ThemeContext.tsx`, AsyncStorage persisted
- Toggle via FullSettingsDialog (wired through `useTheme()` hook)

#### i18n System
- **60+ translation keys** in `lib/i18n.ts` covering all UI strings
- **Arabic (AR) + English (EN)** with full RTL detection
- Language toggle in Settings dialog
- `t(locale, key)` function + `isRTL(locale)` helper

#### Key Dependencies
- Expo 54, React Native 0.81
- expo-router (file-based routing)
- react-native-keyboard-controller
- react-native-safe-area-context
- @react-native-async-storage/async-storage
- Inter font family

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/index.ts` — Pool + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`)

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval config. Codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.

### `lib/design-tokens` (`@workspace/design-tokens`)

CMS design token bridge — 11 token categories: colors (primary navy/blue, extended teal/purple/amber/rose, semantic, neutral, surface, text, border), spacing (xs-4xl), typography (Inter, xs-5xl, weights 400-800), borders, breakpoints (xs-2xl), elevation (RN shadows), motion (durations, easings), CSS shadows, layout (content/sidebar/header), semantic color resolver, z-index. React Native-specific exports at `@workspace/design-tokens/native`.

### `lib/sdui-protocol` (`@workspace/sdui-protocol`)

SDUI protocol schemas — Zod schemas + TypeScript types for: 8 node types (text, button, image, stack, card, carousel, grid, map), 8 action types (navigate, api_mutation, open_url, copy_text, share, trigger_workflow, deep_link, request_hardware_access), modifiers, capabilities (9 OS, 6 screen classes, 6 input methods), payloads.

### `lib/sdui-renderer-native` (`@workspace/sdui-renderer-native`)

React Native SDUI renderer — recursive renderer mapping 8 SDUI node types to RN primitives (Text, TouchableOpacity, Image, View, FlatList). Includes ActionHandler for dispatching SdActions and ModifierStyles mapper. Map node renders placeholder (real MapView integration in app layer).

### `lib/sdui-renderer-web` (`@workspace/sdui-renderer-web`)

React DOM SDUI renderer — recursive renderer mapping 8 SDUI node types to HTML with Tailwind CSS classes. Includes web ActionHandler (window.open, clipboard, Web Share API) and Tailwind modifier mapper.

### `lib/auth` (`@workspace/auth`)

Keycloak PKCE auth SDK — AuthProvider + useAuth() hook, PKCE code verifier/challenge generation, JWT decode for user extraction, token auto-refresh scheduling, storage abstraction (webStorage for localStorage, createNativeStorage for expo-secure-store). Supports login/logout flows, token exchange, and refresh.

### `lib/api-client` (`@workspace/api-client`)

CityOS API client — CityOSClient with auth header injection (Keycloak JWT), x-tenant-id, x-cityos-surface, x-correlation-id headers. SduiClient for fetching SDUI screens and dispatching actions. BffClient + createBffClients() for typed access to all 8 BFF ports (commerce:4001, governance:4002, healthcare:4003, transport:4004, events:4005, platform:4006, iot:4007, social:4008).

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
