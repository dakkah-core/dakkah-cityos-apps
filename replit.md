# Overview

This project is a pnpm monorepo developing a "Conversational City Experience OS," envisioned as a "Super App" for mobile. Its core purpose is to integrate various city services and information through an AI copilot, offering a unified, AI-driven interface for citizens, businesses, and city administration across mobile, web, and specialized applications (e.g., drivers, merchants, kiosks). The platform will support 18 application families and leverage a robust API server with a Gateway architecture and 11 domain services. A key architectural decision is the component-driven approach with a "Server-Driven UI" (SDUI) protocol for dynamic content delivery and extensibility.

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
The project uses a pnpm monorepo with `apps/` for deployable applications, `packages/` for shared libraries, and `services/` for microservices (BFF gateway). Package scope is `@cityos/`. It employs TypeScript composite projects for efficient build and type-checking.

## Core Technologies
- **Backend**: Node.js 24, Express 5
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4) with `drizzle-zod`
- **API Codegen**: Orval, from OpenAPI specification
- **Build Tool**: esbuild for CJS bundles

## UI/UX and Design
- **Mobile App**: Expo React Native "Super App" focused on a single AI copilot screen, prioritizing conversational AI over traditional navigation.
- **Design System**: Centralized `packages/design-tokens` for consistent branding across applications (colors, spacing, typography, etc.), with React Native specific exports.
- **Theming**: Supports light/dark mode with semantic colors and `AsyncStorage` persistence.
- **Internationalization**: Full English/Arabic support with RTL detection.

## Technical Implementations & Features

### BFF Gateway (`services/bff-gateway`)
- **Gateway Architecture**: Express 5 server routing requests to 8 BFF domain services. Each domain uses proxy-then-fallback pattern: attempts real BFF service first, falls back to simulation data.
- **8 BFF Domains**: Commerce (port 4001), Transport (4002), Healthcare (4003), Governance (4004), Events/Culture (4005), Platform (4006), IoT/Telemetry (4007), Social (4008).
- **AI Integration**: Routes for AI chat (OpenAI gpt-5-mini with intent routing), intent execution (SDUI payload generation), and speech-to-text. Supports server-side thread persistence.
- **Auth Middleware**: JWT verification (`jsonwebtoken` + `jwks-rsa`) with caching, audience validation, and role-based access control.
- **SDUI Endpoint**: Proxies Server-Driven UI screens with fallback layouts for dynamic UI updates.
- **Commerce API**: Full checkout orchestration flow + merchant management + POS system.
- **Healthcare API**: Practitioners, facilities, appointments (book/cancel).
- **Governance API**: Government services catalog, public proposals (with voting), permits, citizen reports.
- **Events/Culture API**: Events listing, venues, registrations (book/cancel).
- **Platform API**: Multi-tenant config, feature flags, system status, app config.
- **IoT/Telemetry API**: Devices, sensor readings (time-series), alerts (acknowledge), dashboard summary.
- **Social API**: Feed, posts (create/like/comment), trending topics.
- **Notifications API**: Push registration with category system.

### Mobile Application (`apps/mobile`)
- **Conversational AI Copilot**: Central interaction model with "copilot brain" for intent matching and dynamic UI artifact rendering.
- **Context Management**: `ChatContext`, `AuthContext` (Keycloak OIDC PKCE), `ThemeContext`.
- **Artifact Renderer**: Modular system rendering 49 distinct artifact types dynamically.
- **Interactive Chat Features**: Message reactions, pinning, reply-to, inline editing, `@mention` system, `/slash commands`, in-chat search.
- **Voice & Media Input**: Microphone for speech-to-text, media picker for attachments.
- **Scenario Engine**: Local engine with 189 scenarios for intelligent responses, with OpenAI fallback.
- **Auth System**: Keycloak PKCE authentication, token management with `expo-secure-store` and `AsyncStorage`.
- **Push Notifications**: Expo Notifications integration with category system.
- **SDUI Renderer**: `@cityos/sdui-renderer-native` for recursive rendering of 8 SDUI node types.

### Specialized Mobile Applications (Driver, Merchant, POS)
- **Role-Based Experiences**: Built as route groups within the main Expo mobile artifact, sharing core auth, design tokens, and packages.
- **Driver App**: Features a Driver Dashboard (status, job tracking), Delivery Flow (accept, pickup, complete), Earnings Dashboard, Vehicle Inspection checklist, SOS/Emergency function, Offline Tolerance with sync, and Position Reporting.
- **Merchant App**: Includes a MerchantRoleGate, SDUI Home with Store Dashboard, Order Management (real-time feed, status progression), Catalog Management (product CRUD), Inventory Tracking, Bookings & Tables management, Sales Analytics, and Campaigns creation.
- **POS / Counter Runtime**: Features PosRoleGate, Shift Management (open/close, cash count), Product Grid, Cart & Checkout (discounts, VAT, multiple payment methods), Receipt Generation, Barcode Scanner, Kitchen Display, Returns & Exchanges, and End-of-Day Reports. Includes offline tolerance for sales.

### API Services for Specialized Apps
- **Transport API (`/api/transport/driver/`)**: Manages driver status, job lifecycle, position tracking, earnings, vehicle inspections, SOS alerts, and offline sync.
- **Commerce Merchant API (`/api/commerce/merchant/`)**: Handles merchant profiles, orders, products, inventory, bookings, tables, sales analytics, and campaigns.
- **POS Commerce API (`/api/commerce/pos/`)**: Manages POS products, checkout processes, kitchen orders, shifts, returns, and reports.

### Consumer Web Platform & PWA (`apps/web-platform`)
- **AI Copilot Web Interface**: Full conversational AI copilot for web/desktop, matching the mobile app's AI-first paradigm. No traditional navigation — single chat interface for all city services.
- **PWA Support**: Service worker (`public/sw.js`) with cache-first for static assets, network-first for SDUI, offline fallback shell. PWA manifest (`public/manifest.json`) for standalone installation. Install prompt banner, update detection, offline indicator.
- **IndexedDB Offline Store**: `offline-store.ts` with stores for messages, SDUI cache, and mutation queue (background sync).
- **Chat Features**: Welcome message with suggestion chips, demo responses for weather/rides/restaurants/events, typing indicator, message timestamps, reply-to support, attachments UI.
- **Artifact Renderer**: Renders selection chips, weather cards, ride status, POI carousels, event carousels, SDUI nodes (via `@cityos/sdui-renderer-web`), and generic JSON fallback.
- **Discovery Sidebar**: 8 service categories (Transport, Healthcare, Commerce, Government, Events, Education, Smart City, Community) with expandable prompt lists and search.
- **Auth**: Keycloak PKCE via `@cityos/auth` + guest demo mode (dev/demo only). Auth callback page with state/verifier validation.
- **SEO Pages**: About, Contact, Privacy, Terms — all with back-to-copilot navigation.
- **Search Overlay**: Cmd+K / click search bar opens a modal overlay with trending searches, recent searches (localStorage), and type-ahead suggestions. Selecting a search sends it as a chat message to the copilot.
- **Layout**: Responsive with threads sidebar (left, collapsible), header with Dakkah branding, search bar (desktop), city context (MapPin), and discovery sidebar (right, slide-out).
- **Port**: 5000, path `/web-platform/`. Vite proxy: `${basePath}api` → `http://localhost:8080`.
- **Router**: wouter with `BASE_URL` base path. React Query for data fetching.

### Ambient Surface Apps (Phase 5)
- **Kiosk Runtime** (`/web-platform/kiosk`): Full-screen public terminal mode. Dark navy theme, large touch targets (64px min), guest mode (no login). Features: building directory with 8 services, queue management with print-to-PDF ticket simulation, wayfinding map (OpenStreetMap embed), event listings, search overlay, emergency alert modal. Auto-timeout to home after 60s inactivity. High contrast for ambient lighting. SDUI from `/api/sdui/kiosk_home?surface=kiosk`.
- **TV App Simulator** (`/web-platform/tv`): Fixed 1920×1080 digital signage layout. Horizontal carousels (restaurants, events, city info, services) with auto-scroll passive mode (8s interval). D-Pad keyboard navigation (arrow keys) with visible blue focus ring. Slide indicator dots. Content cards with prominent images and badges. SDUI from `/api/sdui/tv_home?surface=tv_1080p`. Use cases: restaurant menus, hotel lobbies, public signage.
- **Car App Simulator** (`/web-platform/car`): Ultra-simplified list-based UI (max 5 items visible). Large tap targets, text truncation. Main menu → sub-views: delivery details, navigation steps, driver status, earnings dashboard, voice command simulation. Online/offline toggle. Keyboard navigation (↑↓ select, Enter confirm, Esc back). SDUI from `/api/sdui/carplay_home?surface=carplay`. Use cases: driver deliveries, navigation, status.
- All three surface apps are routes within `web-platform` (not separate artifacts due to 7-artifact limit). Each renders SDUI content adapted for its surface type via the `?surface=` query parameter.

### Web Dashboards & Portals (Phase 3)
- **City Dashboard (`apps/city-dashboard`)**: Municipal operations center for city administrators. Dark mode command center with real-time city stats. Port configured via env, path `/city-dashboard/`.
- **Business Dashboard (`apps/business-dashboard`)**: Multi-location business management portal for merchants. Port configured via env, path `/business-dashboard/`.
- **Smart City Portal (`apps/smart-city-portal`)**: Citizen-facing portal for accessing city services. Port configured via env, path `/smart-city-portal/`.
- **Developer Portal (`apps/dev-portal`)**: API platform for third-party developers. Port configured via env, path `/dev-portal/`.
- All dashboards are AI copilot-first (conversational panel is primary interface), use SDUI widget rendering from the API server, and include auth guards with guest/demo access.
- **Auth**: Each dashboard uses `@cityos/auth` (Keycloak PKCE with `generatePKCE`/`generateState`) for SSO login, plus guest/demo fallback for development.
- **SDUI Fetch**: Dashboards fetch SDUI screens with `?surface=` query params. Screen IDs: `city_analytics`, `merchant_overview`, `citizen_home`, `dev_home`.
- **Vite Proxy**: All dashboard `vite.config.ts` files proxy `${basePath}api` to `http://localhost:8080` (BFF gateway) with path rewriting.

### Shared Packages (`packages/`)
- **UI Component Library (`packages/ui`)**: `@cityos/ui` — shared shadcn/ui component library with 55 components (Button, Card, Dialog, Input, etc.), `cn()` utility, `useToast`, `useIsMobile` hooks. Used by all web apps. All Radix UI primitives and shared dependencies centralized here.
- **Database (`packages/db`)**: Drizzle ORM for PostgreSQL schema and connections.
- **API Specification (`packages/api-spec`)**: OpenAPI 3.1 specification and Orval configuration for client/schema generation.
- **Generated Clients/Schemas**: `packages/api-zod` (Zod schemas), `packages/api-client-react` (React Query hooks), `packages/api-client` (generic CityOS client).
- **SDUI Protocol (`packages/sdui-protocol`)**: Defines Zod schemas and TypeScript types for SDUI nodes, actions, modifiers, and capabilities.
- **SDUI Renderers**: `packages/sdui-renderer-native` and `packages/sdui-renderer-web` map SDUI nodes to platform-specific UI components.
- **Authentication (`packages/auth`)**: Keycloak PKCE SDK for `AuthProvider`, `useAuth()` hook, token management, and storage abstraction.
- **AI Assistant Widget (`packages/ai-assistant-widget`)**: Embeddable `<DakkahAssistant />` React component for adding an AI copilot chat to any website. Demo page at `/web-platform/widget-demo`.

# External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Keycloak (OIDC PKCE)
- **CMS Backend**: Payload CMS
- **E-commerce Backend**: Medusa
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **Mobile Development**: Expo (version 54), React Native (version 0.81)
- **Push Notifications**: Expo Notifications
- **Auth Libraries**: `expo-web-browser`, `@cityos/auth`
- **Secure Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **JWT Verification**: `jsonwebtoken`, `jwks-rsa`
