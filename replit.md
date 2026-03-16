# Overview

This project is a pnpm monorepo using TypeScript, designed to build a comprehensive suite of applications for a "Conversational City Experience OS." The core vision is to create a "Super App" for mobile, integrating various city services and information through an AI copilot. This platform aims to redefine urban interaction by offering a unified, AI-driven interface for citizens, businesses, and city administration, spanning mobile, web, and specialized applications like those for drivers, merchants, and kiosks. The project encompasses 18 planned application families, leveraging a robust API server with a Gateway architecture and 11 domain services. It emphasizes a component-driven approach with a focus on a "Server-Driven UI" (SDUI) protocol for dynamic content delivery and extensibility.

# User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
I prefer simple language.
I like functional programming.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

# System Architecture

## Monorepo Structure

The project is structured as a pnpm monorepo with separate `artifacts/` for deployable applications and `lib/` for shared libraries. Each package manages its own dependencies, and TypeScript composite projects are used for efficient type-checking and build processes.

## Core Technologies

- **Node.js**: Version 24
- **TypeScript**: Version 5.9
- **API Framework**: Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4) with `drizzle-zod`
- **API Codegen**: Orval, generating from an OpenAPI specification
- **Build Tool**: esbuild for CJS bundles

## UI/UX and Design

- **Mobile App (`artifacts/mobile`)**: A "Super App" built with Expo React Native, centered around a single AI copilot screen. It eschews traditional tab bars or dashboards in favor of an AI-driven conversational interface.
- **Design Tokens (`lib/design-tokens`)**: A centralized system managing 11 categories of design tokens (colors, spacing, typography, borders, breakpoints, elevation, motion, CSS shadows, layout, semantic color resolver, z-index). This ensures consistent branding and theming across all applications, with specific exports for React Native.
- **Theming**: Supports light/dark mode with `AsyncStorage` persistence, powered by semantic colors from `design-tokens`.
- **Internationalization**: Full English/Arabic support with RTL detection, covering over 60 translation keys.

## Technical Implementations & Features

### API Server (`artifacts/api-server`)

- **Gateway Architecture**: An Express 5 API server acting as a gateway, routing requests to 11 domain services (AI, Commerce, Payments, Identity, Logistics, Health, ERP, Content, Comms, Workflows, Storage).
- **AI Integration**: Routes for AI chat (`/api/ai/chat`) using OpenAI gpt-5-mini with intent routing and BFF proxy, intent execution (`/api/ai/execute`) with SDUI payload generation, and speech-to-text transcription. Supports server-side thread persistence with JWT-verified ownership.
- **Auth Middleware**: JWT verification via `jsonwebtoken` + `jwks-rsa` with JWKS caching, audience validation, and role-based access control. `requireAuth` for sensitive mutations, `optionalAuth` for public reads.
- **SDUI Endpoint**: Provides a proxy for Server-Driven UI screens with fallback layouts, enabling dynamic UI updates.
- **Commerce API**: Full checkout orchestration (validate-address → delivery-options → create-payment → checkout) with BFF proxy and fallback, auth middleware, and JWT-derived user identity.
- **Notifications API**: Push registration with category system, auth-protected mutations, role-gated send endpoint.

### Mobile Application (`artifacts/mobile`)

- **Conversational AI Copilot**: The central interaction model, featuring a "copilot brain" for intent matching and dynamic UI artifact rendering.
- **Context Management**: `ChatContext` for messages, threads, reactions, pinning, editing; `AuthContext` for Keycloak OIDC PKCE authentication and token refresh; `ThemeContext` for UI theming.
- **Artifact Renderer**: A highly modular system capable of rendering 49 distinct artifact types (e.g., carousels, forms, maps, payment requests, various micro-artifacts) dynamically.
- **Interactive Chat Features**: Includes message reactions, pinning, reply-to, inline editing, `@mention` system for city personas, `/slash commands`, and in-chat search.
- **Voice & Media Input**: Microphone button for speech-to-text transcription and media picker for image/video attachments.
- **Scenario Engine**: A local engine with 189 scenarios across 21 categories for intelligent responses, with a fallback to OpenAI.
- **Auth System**: Keycloak PKCE authentication with token refresh, managed by `AuthProvider` and `useAuth()` hook. Tokens stored in `expo-secure-store` (native) with AsyncStorage fallback (web).
- **Push Notifications**: Full category system (order, delivery, city_alert, event, chat, health, transport, general) with Expo Notifications integration and server-side auth enforcement.
- **SDUI Renderer**: `@workspace/sdui-renderer-native` recursively renders 8 SDUI node types into React Native components. `DynamicScreen` component fetches SDUI screens from `/api/sdui/:screenId`.
- **Commerce Checkout**: Full orchestration flow: address validation → delivery options → payment session → confirmation, with BFF proxy and fallback.

### Driver App (`artifacts/mobile/app/driver/`)

- **Role-Based Experience**: Built within the existing Expo mobile artifact as a route group under `/driver`, sharing auth, design tokens, and shared packages.
- **Driver Dashboard**: Status toggle (Online/Offline/Break), active job tracking, completed/pending/in-progress stats, offline queue indicator.
- **Delivery Flow**: Complete lifecycle — accept job → navigate to pickup (Google Maps deep link) → barcode scan verification → in-transit → arrive at customer → proof of delivery (recipient name) → complete with earnings.
- **Earnings Dashboard**: Daily/weekly/monthly earnings view with per-trip breakdown and daily history.
- **Vehicle Inspection**: Pre-trip 12-point checklist (tires, brakes, lights, mirrors, etc.) with pass/fail for each item, submission with result card.
- **SOS/Emergency**: Floating red SOS button with modal for emergency type selection (accident, breakdown, threat, medical, other). Long-press for instant accident report.
- **Offline Tolerance**: Actions queued in AsyncStorage when offline, synced automatically on reconnect via `/transport/driver/sync`.
- **Position Reporting**: 15-second interval position updates when driver is online.

### Transport API (`/api/transport/driver/`)

- **Status Management**: GET/POST `/transport/driver/status` — driver online/offline/break toggle.
- **Job Management**: GET `/transport/driver/jobs`, GET `/transport/driver/jobs/:jobId`, POST `.../accept`, `.../reject`, `.../pickup`, `.../arrive`, `.../complete`.
- **Position Tracking**: POST `/transport/driver/position` — lat/lng/heading/speed reporting.
- **Earnings**: GET `/transport/driver/earnings?period=today|week|month`.
- **Vehicle Inspection**: POST `/transport/driver/inspection` — submit checklist, returns pass/fail result.
- **SOS**: POST `/transport/driver/sos` — emergency alert with type and location.
- **Offline Sync**: POST `/transport/driver/sync` — batch sync queued offline actions.
- **Auth**: `requireAuth` on all mutations, `optionalAuth` on reads.

### Merchant App (`artifacts/mobile/app/merchant/`)

- **Role-Based Experience**: Built within the existing Expo mobile artifact as a route group under `/merchant`, sharing auth, design tokens, and shared packages.
- **MerchantRoleGate**: Enforces `merchant/vendor/store_manager/store_staff` roles on mobile; dev bypass via `NODE_ENV=development` or `EXPO_PUBLIC_ALLOW_DEV_MERCHANT=true`.
- **SDUI Home**: `merchant_home` screen with Store Dashboard stats (revenue, orders, rating), pending order alerts, quick action grid.
- **Order Management**: Real-time order feed with 15s polling, accept/reject with reason, status progression (pending → accepted → preparing → ready), status color badges.
- **Catalog Management**: Product CRUD with name, description, price, category, SKU, availability toggle, stock level. Category filtering, search, modal editor.
- **Inventory Tracking**: Stock levels with in_stock/low_stock/out_of_stock status, inline stock adjustment, low-stock alerts with summary bar.
- **Bookings & Tables**: Reservation list with confirm/cancel/seat/complete workflow, table management with status (available/occupied/reserved/maintenance).
- **Sales Analytics**: Revenue trend bar charts, peak hours visualization, top items ranking, customer insights (new/returning/rating), period toggles (today/week/month).
- **Campaigns**: Promotion/flash sale/loyalty campaign creation, activate/pause toggle, discount configuration (percentage/fixed).
- **Push Notifications**: Listens for `new_order`, `order_updated`, `booking_request` notification categories.

### Commerce Merchant API (`/api/commerce/merchant/`)

- **Profile**: GET/POST `/commerce/merchant/profile`, `/commerce/merchant/store-status` — merchant profile and open/closed toggle.
- **Orders**: GET `/commerce/merchant/orders`, POST `.../orders/:orderId/status` — order listing with status filter, status updates.
- **Products**: GET/POST/PUT/DELETE `/commerce/merchant/products` — full CRUD with variants.
- **Inventory**: GET `/commerce/merchant/inventory`, POST `.../inventory/:productId` — stock levels and restocking.
- **Bookings**: GET `/commerce/merchant/bookings`, POST `.../bookings/:bookingId/status` — reservation management.
- **Tables**: GET `/commerce/merchant/tables` — table status listing.
- **Analytics**: GET `/commerce/merchant/analytics?period=today|week|month` — sales data with top items, peak hours, customer insights.
- **Campaigns**: GET/POST `/commerce/merchant/campaigns`, POST `.../campaigns/:campaignId/status` — campaign CRUD and activation.
- **Auth**: `requireAuth + requireRole(merchant, vendor, store_manager, store_staff)` on all endpoints.

### Shared Libraries (`lib/`)

- **Database (`lib/db`)**: Drizzle ORM for PostgreSQL, defining schema and handling database connections.
- **API Specification (`lib/api-spec`)**: Contains the OpenAPI 3.1 specification and Orval configuration for API client and schema generation.
- **Generated Clients/Schemas**: `lib/api-zod` for Zod schemas from OpenAPI, `lib/api-client-react` for React Query hooks, and `lib/api-client` for a generic CityOS API client with auth and tenant/surface headers, including typed BFF clients.
- **SDUI Protocol (`lib/sdui-protocol`)**: Defines Zod schemas and TypeScript types for 8 SDUI node types, 8 action types, modifiers, and capabilities (OS, screen classes, input methods).
- **SDUI Renderers**: Separate renderers for native (`lib/sdui-renderer-native`) and web (`lib/sdui-renderer-web`) environments, mapping SDUI nodes to platform-specific UI components.
- **Authentication (`lib/auth`)**: A Keycloak PKCE auth SDK providing an `AuthProvider`, `useAuth()` hook, token management, and storage abstraction.

# External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Keycloak (OIDC PKCE)
- **CMS Backend**: Payload CMS (port 5000)
- **E-commerce Backend**: Medusa (port 9000)
- **AI Integration**: OpenAI (for `gpt-5-mini` and other models via Replit AI Integrations)
- **Mobile Development**: Expo (version 54) and React Native (version 0.81)
- **Push Notifications**: Expo Notifications
- **Keycloak OIDC PKCE Auth**: `expo-web-browser`, `@workspace/auth`
- **Secure Storage**: `expo-secure-store` (native token storage), `@react-native-async-storage/async-storage` (profile/settings)
- **JWT Verification**: `jsonwebtoken`, `jwks-rsa` (server-side token validation)