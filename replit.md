# Overview

This project is a pnpm monorepo developing a "Conversational City Experience OS," envisioned as a "Super App" for mobile. Its core purpose is to integrate various city services and information through an AI copilot, offering a unified, AI-driven interface for citizens, businesses, and city administration across mobile, web, and specialized applications. The platform will support 18 application families and leverage a robust API server with a Gateway architecture and 11 domain services. A key architectural decision is the component-driven approach with a "Server-Driven UI" (SDUI) protocol for dynamic content delivery and extensibility.

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
The project uses a pnpm monorepo with `apps/` for deployable applications, `packages/` for shared libraries, and `services/` for microservices (BFF gateway). It employs TypeScript composite projects.

## Core Technologies
- **Backend**: Node.js 24, Express 5
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4)
- **API Codegen**: Orval, from OpenAPI specification
- **Build Tool**: esbuild

## UI/UX and Design
- **Mobile App**: Expo React Native "Super App" focused on a single AI copilot screen, prioritizing conversational AI.
- **Design System**: Centralized `packages/design-tokens` for consistent branding (colors, spacing, typography) across all applications, with React Native and CSS custom properties exports.
- **Theming**: Supports light/dark mode with semantic colors.
- **Internationalization**: Full English/Arabic support with RTL detection.

## Technical Implementations & Features

### BFF Gateway (`services/bff-gateway`)
- **Gateway Architecture**: Express 5 server routing requests to 8 BFF domain services using a proxy-then-fallback pattern (real service or simulation data).
- **AI Integration**: Routes for AI chat (OpenAI gpt-5-mini with intent routing), intent execution (SDUI payload generation), and speech-to-text. Supports server-side thread persistence.
- **Auth Middleware**: JWT verification with caching, audience validation, and role-based access control.
- **SDUI Endpoint**: Proxies Server-Driven UI screens with fallback layouts.
- **Key APIs**: Commerce (checkout, merchant management), Healthcare (appointments), Governance (public services, reports), Events/Culture (listings, registrations), Platform (multi-tenant config, feature flags), IoT/Telemetry (devices, sensors, alerts), Social (feed, posts), Notifications (push registration).

### Mobile Application (`apps/mobile`)
- **Conversational AI Copilot**: Central interaction model with "copilot brain" for intent matching and dynamic UI artifact rendering.
- **Shared Core**: All cross-app components, contexts, libs, and artifact renderers are imported from `@cityos/mobile-core`.
- **Context Management**: `ChatContext`, `AuthContext` (Keycloak OIDC PKCE), `ThemeContext`. Role-specific contexts (`DriverContext`, `MerchantContext`, `PosContext`) remain local.
- **Artifact Renderer**: Modular system rendering 49 distinct artifact types dynamically.
- **Interactive Chat Features**: Message reactions, pinning, reply-to, inline editing, `@mention` system, `/slash commands`, in-chat search.
- **Voice & Media Input**: Microphone for speech-to-text, media picker.
- **Scenario Engine**: Local engine with 189 scenarios for intelligent responses, with OpenAI fallback.
- **Auth System**: Keycloak PKCE authentication, token management.
- **Push Notifications**: Expo Notifications integration.
- **SDUI Renderer**: `@cityos/sdui-renderer-native` for recursive rendering of 8 SDUI node types.

### Specialized Mobile Applications
- **Driver App (`apps/mobile-driver`)**: Standalone Expo app with features for driver dashboard, delivery flow, earnings, vehicle inspection, SOS, and offline tolerance.
- **Merchant App (`apps/mobile-merchant`)**: Standalone Expo app with features for store dashboard, order management, catalog, inventory, bookings, and sales analytics.
- **POS App (`apps/mobile-pos`)**: Standalone Expo app with features for shift management, product grid, cart & checkout, receipt generation, kitchen display, returns, and end-of-day reports.
- All three apps import shared UI/contexts/libs from `@cityos/mobile-core`.

### Consumer Web Platform & PWA (`apps/web-platform`)
- **AI Copilot Web Interface**: Full conversational AI copilot for web/desktop, mirroring the mobile app's AI-first paradigm. Single chat interface for all city services.
- **PWA Support**: Service worker with cache-first for static assets, network-first for SDUI, offline fallback, and installable manifest.
- **IndexedDB Offline Store**: Stores messages, SDUI cache, and mutation queue.
- **Chat Features**: Welcome messages, suggestion chips, demo responses, typing indicator, message timestamps, reply-to, attachments.
- **Artifact Renderer**: Renders selection chips, weather cards, ride status, POI carousels, event carousels, SDUI nodes (via `@cityos/sdui-renderer-web`), and generic JSON fallback.
- **Discovery Sidebar**: 8 service categories with expandable prompt lists and search.
- **Auth**: Keycloak PKCE via `@cityos/auth` + guest demo mode.
- **SEO Pages**: About, Contact, Privacy, Terms.
- **Search Overlay**: Modal overlay with trending searches, recent searches, and type-ahead suggestions.
- **Layout**: Responsive with threads sidebar, header, search bar, city context, and discovery sidebar.

### Ambient Surface Apps
- **Kiosk Runtime** (`/web-platform/kiosk`): Full-screen public terminal mode with large touch targets, building directory, queue management, wayfinding, event listings, and emergency alerts.
- **TV App Simulator** (`/web-platform/tv`): Fixed 1920x1080 digital signage layout with auto-scrolling horizontal carousels and D-Pad navigation.
- **Car App Simulator** (`/web-platform/car`): Ultra-simplified list-based UI with large tap targets for delivery details, navigation, and driver status.
- All ambient surface apps are routes within `web-platform` and render SDUI content adapted for their surface type.

### Web Dashboards & Portals
- **Business Dashboard (`apps/business-dashboard`)**: Multi-location business management portal for merchants.
- **City Dashboard (`apps/city-dashboard`)**: Municipal operations center with real-time city stats.
- **Smart City Portal (`apps/smart-city-portal`)**: Citizen-facing portal for accessing city services.
- **Developer Portal (`apps/dev-portal`)**: API platform for third-party developers.
- All dashboards are AI copilot-first, use SDUI widget rendering, and include auth guards with guest/demo access. Auth uses `createDashboardAuth()` from `@cityos/auth`. SDUI fetching uses `useSduiScreen()` from `@cityos/sdui-renderer-web`.

### Shared Packages (`packages/`)
- **Mobile Core (`packages/mobile-core`)**: Shared React Native package containing cross-app mobile components, core contexts, shared libraries (AI client, gateway, i18n, etc.), constants, types, and scenario data.
- **UI Component Library (`packages/ui`)**: Shared shadcn/ui component library with 55 components, `cn()` utility, and hooks.
- **Database (`packages/db`)**: Drizzle ORM for PostgreSQL schema and connections.
- **API Specification (`packages/api-spec`)**: OpenAPI 3.1 specification and Orval configuration.
- **Generated Clients/Schemas**: `packages/api-zod` (Zod schemas), `packages/api-client-react` (React Query hooks), `packages/api-client` (generic CityOS client).
- **SDUI Protocol (`packages/sdui-protocol`)**: Defines Zod schemas and TypeScript types for SDUI nodes, actions, modifiers, and capabilities.
- **SDUI Renderers**: `packages/sdui-renderer-native` and `packages/sdui-renderer-web` map SDUI nodes to platform-specific UI components.
- **Authentication (`packages/auth`)**: Keycloak PKCE SDK for `AuthProvider`, `useAuth()` hook, token management, and `createDashboardAuth()` factory.
- **AI Assistant Widget (`packages/ai-assistant-widget`)**: Embeddable `<DakkahAssistant />` React component for adding an AI copilot chat to any website.

# External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Keycloak (OIDC PKCE)
- **CMS Backend**: Payload CMS
- **E-commerce Backend**: Medusa
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **Mobile Development**: Expo, React Native
- **Push Notifications**: Expo Notifications
- **Auth Libraries**: `expo-web-browser`, `@cityos/auth`
- **Secure Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **JWT Verification**: `jsonwebtoken`, `jwks-rsa`