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
- **AI Integration**: Routes for AI chat (using OpenAI gpt-5-mini) with intent routing and BFF proxy, and speech-to-text transcription. It supports server-side thread persistence.
- **SDUI Endpoint**: Provides a proxy for Server-Driven UI screens, enabling dynamic UI updates.
- **Commerce API**: Proxies for product, cart, and checkout functionalities.

### Mobile Application (`artifacts/mobile`)

- **Conversational AI Copilot**: The central interaction model, featuring a "copilot brain" for intent matching and dynamic UI artifact rendering.
- **Context Management**: `ChatContext` for messages, threads, reactions, pinning, editing; `AuthContext` for Keycloak OIDC PKCE authentication and token refresh; `ThemeContext` for UI theming.
- **Artifact Renderer**: A highly modular system capable of rendering 49 distinct artifact types (e.g., carousels, forms, maps, payment requests, various micro-artifacts) dynamically.
- **Interactive Chat Features**: Includes message reactions, pinning, reply-to, inline editing, `@mention` system for city personas, `/slash commands`, and in-chat search.
- **Voice & Media Input**: Microphone button for speech-to-text transcription and media picker for image/video attachments.
- **Scenario Engine**: A local engine with 189 scenarios across 21 categories for intelligent responses, with a fallback to OpenAI.
- **Auth System**: Keycloak PKCE authentication with token refresh, managed by `AuthProvider` and `useAuth()` hook.
- **SDUI Renderer**: `@workspace/sdui-renderer-native` recursively renders 8 SDUI node types into React Native components.

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
- **Local Storage**: `@react-native-async-storage/async-storage` (for mobile)