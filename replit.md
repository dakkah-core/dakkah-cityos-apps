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
The project uses a pnpm monorepo with `artifacts/` for deployable applications and `lib/` for shared libraries. It employs TypeScript composite projects for efficient build and type-checking.

## Core Technologies
- **Backend**: Node.js 24, Express 5
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4) with `drizzle-zod`
- **API Codegen**: Orval, from OpenAPI specification
- **Build Tool**: esbuild for CJS bundles

## UI/UX and Design
- **Mobile App**: Expo React Native "Super App" focused on a single AI copilot screen, prioritizing conversational AI over traditional navigation.
- **Design System**: Centralized `lib/design-tokens` for consistent branding across applications (colors, spacing, typography, etc.), with React Native specific exports.
- **Theming**: Supports light/dark mode with semantic colors and `AsyncStorage` persistence.
- **Internationalization**: Full English/Arabic support with RTL detection.

## Technical Implementations & Features

### API Server (`artifacts/api-server`)
- **Gateway Architecture**: Express 5 server routing requests to 11 domain services (AI, Commerce, Payments, Identity, Logistics, Health, ERP, Content, Comms, Workflows, Storage).
- **AI Integration**: Routes for AI chat (OpenAI gpt-5-mini with intent routing), intent execution (SDUI payload generation), and speech-to-text. Supports server-side thread persistence.
- **Auth Middleware**: JWT verification (`jsonwebtoken` + `jwks-rsa`) with caching, audience validation, and role-based access control.
- **SDUI Endpoint**: Proxies Server-Driven UI screens with fallback layouts for dynamic UI updates.
- **Commerce API**: Full checkout orchestration flow.
- **Notifications API**: Push registration with category system.

### Mobile Application (`artifacts/mobile`)
- **Conversational AI Copilot**: Central interaction model with "copilot brain" for intent matching and dynamic UI artifact rendering.
- **Context Management**: `ChatContext`, `AuthContext` (Keycloak OIDC PKCE), `ThemeContext`.
- **Artifact Renderer**: Modular system rendering 49 distinct artifact types dynamically.
- **Interactive Chat Features**: Message reactions, pinning, reply-to, inline editing, `@mention` system, `/slash commands`, in-chat search.
- **Voice & Media Input**: Microphone for speech-to-text, media picker for attachments.
- **Scenario Engine**: Local engine with 189 scenarios for intelligent responses, with OpenAI fallback.
- **Auth System**: Keycloak PKCE authentication, token management with `expo-secure-store` and `AsyncStorage`.
- **Push Notifications**: Expo Notifications integration with category system.
- **SDUI Renderer**: `@workspace/sdui-renderer-native` for recursive rendering of 8 SDUI node types.

### Specialized Mobile Applications (Driver, Merchant, POS)
- **Role-Based Experiences**: Built as route groups within the main Expo mobile artifact, sharing core auth, design tokens, and packages.
- **Driver App**: Features a Driver Dashboard (status, job tracking), Delivery Flow (accept, pickup, complete), Earnings Dashboard, Vehicle Inspection checklist, SOS/Emergency function, Offline Tolerance with sync, and Position Reporting.
- **Merchant App**: Includes a MerchantRoleGate, SDUI Home with Store Dashboard, Order Management (real-time feed, status progression), Catalog Management (product CRUD), Inventory Tracking, Bookings & Tables management, Sales Analytics, and Campaigns creation.
- **POS / Counter Runtime**: Features PosRoleGate, Shift Management (open/close, cash count), Product Grid, Cart & Checkout (discounts, VAT, multiple payment methods), Receipt Generation, Barcode Scanner, Kitchen Display, Returns & Exchanges, and End-of-Day Reports. Includes offline tolerance for sales.

### API Services for Specialized Apps
- **Transport API (`/api/transport/driver/`)**: Manages driver status, job lifecycle, position tracking, earnings, vehicle inspections, SOS alerts, and offline sync.
- **Commerce Merchant API (`/api/commerce/merchant/`)**: Handles merchant profiles, orders, products, inventory, bookings, tables, sales analytics, and campaigns.
- **POS Commerce API (`/api/commerce/pos/`)**: Manages POS products, checkout processes, kitchen orders, shifts, returns, and reports.

### Consumer Web Platform & PWA (`artifacts/web-platform`)
- **AI Copilot Web Interface**: Full conversational AI copilot for web/desktop, matching the mobile app's AI-first paradigm. No traditional navigation — single chat interface for all city services.
- **PWA Support**: Service worker (`public/sw.js`) with cache-first for static assets, network-first for SDUI, offline fallback shell. PWA manifest (`public/manifest.json`) for standalone installation. Install prompt banner, update detection, offline indicator.
- **IndexedDB Offline Store**: `offline-store.ts` with stores for messages, SDUI cache, and mutation queue (background sync).
- **Chat Features**: Welcome message with suggestion chips, demo responses for weather/rides/restaurants/events, typing indicator, message timestamps, reply-to support, attachments UI.
- **Artifact Renderer**: Renders selection chips, weather cards, ride status, POI carousels, event carousels, SDUI nodes (via `@workspace/sdui-renderer-web`), and generic JSON fallback.
- **Discovery Sidebar**: 8 service categories (Transport, Healthcare, Commerce, Government, Events, Education, Smart City, Community) with expandable prompt lists and search.
- **Auth**: Keycloak PKCE via `@workspace/auth` + guest demo mode (dev/demo only). Auth callback page with state/verifier validation.
- **SEO Pages**: About, Contact, Privacy, Terms — all with back-to-copilot navigation.
- **Layout**: Responsive with threads sidebar (left, collapsible), header with Dakkah branding, and discovery sidebar (right, slide-out).
- **Port**: 5000, path `/web-platform/`. Vite proxy: `${basePath}api` → `http://localhost:8080`.
- **Router**: wouter with `BASE_URL` base path. React Query for data fetching.

### Web Dashboards & Portals (Phase 3)
- **City Dashboard (`artifacts/city-dashboard`)**: Municipal operations center for city administrators. Dark mode command center with real-time city stats (incidents, traffic, air quality, energy), service request tracking, infrastructure health monitoring, and AI copilot chat panel. Port 20359, path `/city-dashboard/`.
- **Business Dashboard (`artifacts/business-dashboard`)**: Multi-location business management portal for merchants. Clean professional theme with revenue/order tracking, inventory alerts, staff scheduling, marketing campaigns, customer insights, and AI copilot. Port 26079, path `/business-dashboard/`.
- **Smart City Portal (`artifacts/smart-city-portal`)**: Citizen-facing portal for accessing city services. Accessible civic design with service directory (property, transport, health, education, waste), city announcements, issue reporting, community events, public consultations, and AI copilot. Port 21840, path `/smart-city-portal/`.
- **Developer Portal (`artifacts/dev-portal`)**: API platform for third-party developers. Dark developer-focused theme with API catalog (Commerce, Transport, Healthcare, Governance, IoT), app registration, API usage metrics, playground, SDK downloads, webhook config, and AI copilot. Port 23288, path `/dev-portal/`.
- All dashboards are AI copilot-first (conversational panel is primary interface), use SDUI widget rendering from the API server, and include auth guards with guest/demo access.
- **Auth**: Each dashboard uses `@workspace/auth` (Keycloak PKCE with `generatePKCE`/`generateState`) for SSO login, plus guest/demo fallback for development. Role guards: city_admin (City), merchant_admin (Business), citizen (Smart City), developer (Dev Portal).
- **SDUI Fetch**: Dashboards fetch SDUI screens with `?surface=` query params: `desktop_wide` (city), `dashboard` (business), `web` (smart-city, dev-portal). Screen IDs: `city_analytics`, `merchant_overview`, `citizen_home`, `dev_home`.
- **Vite Proxy**: All 4 dashboard `vite.config.ts` files proxy `${basePath}api` to `http://localhost:8080` (API server) with path rewriting.

### Shared Libraries (`lib/`)
- **Database (`lib/db`)**: Drizzle ORM for PostgreSQL schema and connections.
- **API Specification (`lib/api-spec`)**: OpenAPI 3.1 specification and Orval configuration for client/schema generation.
- **Generated Clients/Schemas**: `lib/api-zod` (Zod schemas), `lib/api-client-react` (React Query hooks), `lib/api-client` (generic CityOS client).
- **SDUI Protocol (`lib/sdui-protocol`)**: Defines Zod schemas and TypeScript types for SDUI nodes, actions, modifiers, and capabilities.
- **SDUI Renderers**: `lib/sdui-renderer-native` and `lib/sdui-renderer-web` map SDUI nodes to platform-specific UI components.
- **Authentication (`lib/auth`)**: Keycloak PKCE SDK for `AuthProvider`, `useAuth()` hook, token management, and storage abstraction.

# External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Keycloak (OIDC PKCE)
- **CMS Backend**: Payload CMS
- **E-commerce Backend**: Medusa
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **Mobile Development**: Expo (version 54), React Native (version 0.81)
- **Push Notifications**: Expo Notifications
- **Auth Libraries**: `expo-web-browser`, `@workspace/auth`
- **Secure Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **JWT Verification**: `jsonwebtoken`, `jwks-rsa`