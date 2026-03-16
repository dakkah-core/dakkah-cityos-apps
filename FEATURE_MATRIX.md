# Dakkah CityOS — Universal Super App Feature Matrix

## Three-Way Comparison: Current Mobile App vs Reference Chat App vs CMS Backend

> **Vision**: Dakkah CityOS is a Universal Super App — a Conversational City Experience OS where
> ALL capabilities are accessed through an AI copilot. The mobile app (this project) will eventually
> move to `apps/superapp` inside the CMS monorepo after all implementations are complete.
>
> **Backend**: `https://github.com/dakkah-core/dakkah-cityos-cms.git`
>
> **Reference Chat**: `https://github.com/dakkah-core/dakkah-cityos-chat-app.git`

---

## TABLE OF CONTENTS

1. [Architecture & Platform](#1-architecture--platform)
2. [Backend Systems (CMS Monorepo)](#2-backend-systems-cms-monorepo)
3. [BFF Layer (Backend-for-Frontend)](#3-bff-layer)
4. [API Routes (392 endpoints in CMS)](#4-api-routes)
5. [Core Copilot Interface](#5-core-copilot-interface)
6. [Chat Features](#6-chat-features)
7. [UI Panels & Navigation](#7-ui-panels--navigation)
8. [Right Drawer — City Context](#8-right-drawer--city-context)
9. [Discovery Sheet](#9-discovery-sheet)
10. [Scenario Data Files](#10-scenario-data-files)
11. [Artifact Types — City OS Core (48)](#11-artifact-types--city-os-core)
12. [Artifact Types — Domain Verticals (157+)](#12-artifact-types--domain-verticals)
13. [CMS Collections (180+)](#13-cms-collections)
14. [CMS Domain Packages (65+)](#14-cms-domain-packages)
15. [Medusa Commerce Modules (129)](#15-medusa-commerce-modules)
16. [CMS Block Types (920+)](#16-cms-block-types)
17. [Multi-Surface Apps (18 App Families)](#17-multi-surface-apps)
18. [SDUI Protocol & Capability Negotiation](#18-sdui-protocol)
19. [Design System & Tokens](#19-design-system--tokens)
20. [Shared Packages](#20-shared-packages)
21. [Microservices & Infrastructure](#21-microservices--infrastructure)
22. [Current App Exclusive Features](#22-current-app-exclusive-features)
23. [Additional Recommended Capabilities](#23-additional-recommended-capabilities)
24. [Summary Scorecard](#24-summary-scorecard)
25. [Prioritized Roadmap](#25-prioritized-roadmap)

---

## 1. ARCHITECTURE & PLATFORM

| Feature | Current App | Reference Chat App | CMS Backend | Status |
|---|---|---|---|---|
| **Platform** | Expo React Native (iOS/Android/Web) | React + Vite (Web SPA) | Next.js 16 + Payload CMS 3 | Current app is mobile-first — strongest |
| **Backend API** | Express.js (11 routes) | Payload CMS Gateway | Payload CMS + 392 API routes | GAP — need to connect to CMS |
| **Auth** | AsyncStorage local profile | Supabase Auth | Keycloak IAM (OIDC, MFA, RBAC) | GAP — need Keycloak integration |
| **Database** | AsyncStorage (client-only) | Supabase PostgreSQL | Neon PostgreSQL + PostGIS + pgvector | GAP — need server persistence |
| **AI Model** | OpenAI gpt-5-mini (Replit AI) | OpenAI gpt-4o | OpenAI + embeddings + AI compose | PARTIAL |
| **Search** | Local keyword matching | Local scenarios | Meilisearch (universal cross-domain) | GAP |
| **Storage** | None | MinIO | Replit Object Storage + MinIO fallback | GAP |
| **Monorepo** | pnpm workspace (3 artifacts) | Standalone Vite app | pnpm + Turborepo (30+ apps, 65+ packages) | GAP |
| **Multi-tenancy** | None | None | Hierarchical 5-tier (Master→City) | GAP |
| **Localization** | en + ar (60+ keys, RTL) | en only | en + fr + ar (full RTL, logical CSS) | PARTIAL MATCH |
| **Design System** | constants/colors.ts | Tailwind + shadcn/ui | @cityos/design-system + @cityos/design-tokens + @cityos/universal-ui | GAP |

---

## 2. BACKEND SYSTEMS (CMS Monorepo)

The CMS repo contains a full-stack multi-system platform. These are the backend systems our Super App needs to connect to:

| System | Port | Technology | Purpose | Current App Status |
|---|---|---|---|---|
| **Payload CMS** | 5000 | Next.js + Payload 3 | Master CMS, API Gateway, Admin Panel | NOT CONNECTED |
| **Medusa Commerce** | 9000 | Medusa v2 (129 modules) | Commerce engine (products, orders, carts) | NOT CONNECTED |
| **Fleetbase** | — | Laravel + Octane | Logistics execution, dispatch, fleet tracking | NOT CONNECTED |
| **FleetOps** | — | Next.js + Drizzle | Fleet operations dashboard | NOT CONNECTED |
| **ERPNext** | — | Python/Frappe (35 doctypes) | Enterprise backbone (invoices, inventory, HR) | NOT CONNECTED |
| **Tryton ERP** | — | Python | SME backbone with cityos_sync | NOT CONNECTED |
| **Keycloak** | 8080 | Java | IAM — SSO, OIDC, MFA, RBAC | NOT CONNECTED |
| **Walt.id** | 7000/7001 | Kotlin | Digital identity — DID, verifiable credentials | NOT CONNECTED |
| **Kuzzle IoT** | 7512 | Node.js | IoT data platform, real-time WebSocket, MQTT | NOT CONNECTED |
| **Meilisearch** | — | Rust | Universal cross-domain search | NOT CONNECTED |
| **MinIO** | 9002 | Go | S3-compatible object storage | NOT CONNECTED |
| **Temporal Cloud** | — | Cloud | Workflow orchestration engine | NOT CONNECTED |
| **Stripe** | — | API | Payment processing | NOT CONNECTED |
| **Ably** | — | API | Real-time WebSocket (live auctions) | NOT CONNECTED |
| **SendGrid** | — | API | Transactional email | NOT CONNECTED |
| **Plausible** | — | Self-hosted | Privacy-first analytics | NOT CONNECTED |
| **Sentry** | — | Cloud | Error tracking and monitoring | NOT CONNECTED |
| **Prometheus** | — | Self-hosted | Metrics and monitoring | NOT CONNECTED |

---

## 3. BFF LAYER (Backend-for-Frontend)

The CMS has **8 BFF microservices** that sit between frontend apps and the backend systems:

| BFF Service | Port | Domains Covered | Current App Status |
|---|---|---|---|
| **bff-commerce** | 4001 | Commerce, Facilities, Community | NOT CONNECTED |
| **bff-governance** | 4002 | Governance, Finance, Citizen Services | NOT CONNECTED |
| **bff-healthcare** | 4003 | Healthcare | NOT CONNECTED |
| **bff-transport** | 4004 | Transportation, Fleet & Logistics | NOT CONNECTED |
| **bff-events** | 4005 | Events, Sports, Culture & Tourism | NOT CONNECTED |
| **bff-platform** | 4006 | Auth, Tenancy, Notifications | NOT CONNECTED |
| **bff-iot** | 4007 | IoT, Agriculture, Environment | NOT CONNECTED |
| **bff-social** | 4008 | Social Media, Engagement, Media Assets | NOT CONNECTED |

Each BFF includes:
- Correlation ID middleware
- Keycloak auth middleware
- Multi-tenant resolution
- Prometheus metrics
- Kuzzle WebSocket proxy (real-time IoT)
- Health checks
- Payload CMS REST API proxy

---

## 4. API ROUTES (392 Endpoints in CMS)

| Route Group | Endpoint Count | Description | Current App Status |
|---|---|---|---|
| **AI** | 10 | chat, compose, execute, embeddings, search, playground, backfill, prompts seed, manifests seed, page-builder compose | NOT CONNECTED |
| **Auth** | 7 | login, register, logout, me, api-keys, keycloak-callback, social-callback | NOT CONNECTED |
| **BFF Auth** | 5 | login, logout, register, reset-password, session | NOT CONNECTED |
| **BFF Commerce** | 40+ | products, cart, checkout, orders, categories, inventory, loyalty, gift-cards, wallet, returns, store-credits, trade-in, digital-downloads, installments, b2b-approvals, refunds, warranties, store-pickup, payment-sessions, auctions, bookings, delivery, marketplace, commissions, vendors, reviews, subscriptions, quotes, company | NOT CONNECTED |
| **BFF AI** | 3 | context, moderation, recommendations | NOT CONNECTED |
| **BFF Analytics** | 1 | dashboard | NOT CONNECTED |
| **BFF Catalog** | 1 | unified catalog | NOT CONNECTED |
| **Analytics** | 2 | events, realtime | NOT CONNECTED |
| **Workflow** | 80+ | triggers, schedules, temporal, diagnostics, sync, governance, personas, nodes, cross-system dispatch, SSE streams, event-router, handlers, import/export, versioning | NOT CONNECTED |
| **Content** | 5+ | pages, POIs, media, templates, search | NOT CONNECTED |
| **Commerce Direct** | 15+ | products, checkout, orders, payments, subscriptions | NOT CONNECTED |
| **Governance** | 5+ | authorities, policies, resolve | NOT CONNECTED |
| **Domain-specific** | 50+ | agriculture/forecast, ads/impression, availability/hotel, b2b/quote, social, fleet, healthcare, etc. | NOT CONNECTED |
| **Admin** | 5+ | collections, integration-log, tree-view, keycloak MFA enforcement | NOT CONNECTED |
| **Health** | 3 | system health, integration health, workflow health | NOT CONNECTED |
| **Webhooks** | 5+ | CMS webhooks, system webhooks, webhook signatures | NOT CONNECTED |
| **SDUI** | 2 | `/api/sdui/[screenId]` (layout fetch), `/api/sdui/action` (action dispatch) | NOT CONNECTED |

---

## 5. CORE COPILOT INTERFACE

| Feature | Current App | Reference App | CMS Backend | Status |
|---|---|---|---|---|
| Conversational AI copilot (single screen) | ✅ | ✅ | AI routes ready | MATCH |
| No traditional UI (no tabs/dashboards) | ✅ | ✅ | — | MATCH |
| Three modes (Suggest/Propose/Execute) | ✅ | ✅ | — | MATCH |
| Scenario Brain (keyword → artifact) | ✅ | ✅ | AI compose endpoint | MATCH |
| Real AI integration (OpenAI) | ✅ | ✅ | OpenAI + embeddings | MATCH |
| AI fallback to local scenarios | ✅ | ✅ | — | MATCH |
| Message sending with attachments | ✅ | ✅ | Storage ready | MATCH |
| Selection chips (quick-reply buttons) | ✅ | ✅ | — | MATCH |
| Typing indicator | ✅ | ✅ | — | MATCH |
| Intent detection → backend routing | ❌ | ✅ (CopilotGateway) | AI execute endpoint | GAP |
| AI context enrichment | ❌ | ❌ | BFF AI context endpoint | GAP |
| AI content moderation | ❌ | ❌ | BFF AI moderation endpoint | GAP |
| AI recommendations | ❌ | ❌ | BFF AI recommendations endpoint | GAP |
| Generative SDUI (AI builds UI blocks live) | ❌ | ❌ | ai-orchestrator service | GAP |
| Multimodal block streaming | ❌ | ❌ | Vercel AI SDK streaming | GAP |
| Sandboxed agent execution (safe mutations) | ❌ | ❌ | SdAction validation layer | GAP |

---

## 6. CHAT FEATURES

| Feature | Current App | Reference App | Status |
|---|---|---|---|
| Multi-thread conversations | ✅ (local) | ✅ (Supabase) | PARTIAL — ours is local-only |
| Thread list (left drawer) | ✅ | ✅ | MATCH |
| New thread creation | ✅ | ✅ | MATCH |
| Thread deletion | ✅ | ✅ | MATCH |
| Message reactions (emoji) | ✅ | ✅ | MATCH |
| Message pinning | ✅ | ✅ | MATCH |
| Message editing | ✅ | ✅ | MATCH |
| Message reply/threading | ✅ | ✅ | MATCH |
| Message context menu (long-press) | ✅ | ✅ | MATCH |
| Message search | ✅ | ✅ | MATCH |
| Mute notifications | ✅ | ✅ | MATCH |
| Slash commands (/) | ✅ | ✅ | MATCH |
| @Mentions | ✅ | ✅ | MATCH |
| Voice input (transcription) | ✅ | ✅ | MATCH |
| Media/image attachments | ✅ | ✅ | MATCH |
| Server-side thread persistence | ❌ | ✅ | GAP |

---

## 7. UI PANELS & NAVIGATION

| Feature | Current App | Reference App | CMS Backend | Status |
|---|---|---|---|---|
| Threads Drawer (left) | ✅ | ✅ | — | MATCH |
| Right Drawer (City Context) | ✅ | ✅ | — | MATCH |
| Discovery Sheet (bottom) | ✅ | ✅ | — | MATCH |
| Details Drawer (item viewer) | ✅ | ✅ | — | MATCH |
| Chat Header | ✅ | ✅ | — | MATCH |
| Full Settings Dialog | ✅ | ✅ | — | MATCH |
| Group Info Dialog | ✅ | ✅ | — | MATCH |
| Shared Media Dialog | ✅ | ✅ | — | MATCH |
| Support Dialog | ✅ | ✅ | — | MATCH |
| Coming Soon Modal | ✅ | ✅ | — | MATCH |
| Add Member Dialog | ✅ | ✅ | — | MATCH |
| Contact Profile Modal | ✅ | ❌ | — | OUR APP ONLY |
| Active Quests Widget | ✅ | ❌ | — | OUR APP ONLY |
| User Profile Screen | ✅ | ✅ | — | MATCH |
| Auth Dialog (Sign In/Up) | ❌ | ✅ (Supabase) | Keycloak IAM | GAP |
| Copilot Settings (AI tuning) | ❌ | ✅ (temp, model, privacy) | — | GAP |
| System Health Dashboard | ❌ | ✅ | Health API endpoints | GAP |

---

## 8. RIGHT DRAWER — CITY CONTEXT

| Feature | Current App | Reference App | Status |
|---|---|---|---|
| Weather card | ✅ | ✅ | MATCH |
| Daily agenda | ✅ | ✅ | MATCH |
| Live Activity tracking | ✅ | ✅ | MATCH |
| Community feed | ✅ | ✅ | MATCH |
| Quick actions (Ride, Book, Events, Map) | ✅ | ✅ | MATCH |
| SOS / Emergency button | ✅ | ✅ | MATCH |
| Location sharing | ✅ | ✅ | MATCH |
| Zone Experience Score | ✅ | ✅ | MATCH |

---

## 9. DISCOVERY SHEET (20 Categories)

| Category | Current App | Reference App | Status |
|---|---|---|---|
| Food & Drink | ✅ | ✅ | MATCH |
| Nightlife | ✅ | ✅ | MATCH |
| Culture | ✅ | ✅ | MATCH |
| Wellness | ✅ | ✅ | MATCH |
| Shopping | ✅ | ✅ | MATCH |
| Services | ✅ | ✅ | MATCH |
| Transit | ✅ | ✅ | MATCH |
| Family | ✅ | ✅ | MATCH |
| Work | ✅ | ✅ | MATCH |
| Education | ✅ | ✅ | MATCH |
| Home | ✅ | ✅ | MATCH |
| Social | ✅ | ✅ | MATCH |
| Intel | ✅ | ✅ | MATCH |
| Planning | ✅ | ✅ | MATCH |
| Outdoor | ✅ | ✅ | MATCH |
| Beauty | ✅ | ✅ | MATCH |
| Health | ✅ | ✅ | MATCH |
| My Activity | ✅ | ✅ | MATCH |
| Utility | ✅ | ✅ | MATCH |
| Pets | ✅ | ✅ | MATCH |

---

## 10. SCENARIO DATA FILES (21 files — FULL MATCH)

All 21 scenario JSON files are present in both apps:
beauty, commerce, culture, education, events, family, health, home, intel, misc, my_activity, outdoor, pets, places, planning, services, social, transit, utility, wellness, work.

---

## 11. ARTIFACT TYPES — CITY OS CORE (48 types — FULL MATCH)

All 48 core artifact types match between our app and the reference app:

| Category | Artifacts |
|---|---|
| **Discovery** | poi-carousel, event-carousel, ambassador-carousel, zone-heatmap |
| **Planning** | itinerary-timeline, calendar-selector |
| **Commerce** | product-carousel, product-card, flash-sale, vendor-trust, invoice-preview |
| **Navigation** | selection-chips, map-view |
| **Booking** | confirmation-card, reservation-card, ticket-pass |
| **Tracking** | order-tracker, ride-status, parking-meter, parcel-locker |
| **Finance** | payment-request, credit-gauge, escrow-status, receipt-card, crypto-wallet |
| **Health** | health-snapshot, symptom-triage |
| **Home** | smart-home-control |
| **Education** | lesson-tracker |
| **Civic** | permit-app, issue-reporter |
| **Travel** | boarding-pass, currency-converter |
| **Media** | media-player, voice-note |
| **Social** | poll-card, profile-card, progress-card |
| **Info** | weather-card, alert-card, document-card |
| **Analytics** | analytics-snapshot, comparison-table |
| **Agent** | agent-sync-card |
| **Forms** | form-group |
| **Services** | service-menu |
| **Tasks** | task-checklist |

---

## 12. ARTIFACT TYPES — DOMAIN VERTICALS (157 additional in Reference App)

### 12A. LOGISTICS (50+ artifacts)
Fleet tracking, proof-of-delivery, IoT dashboards, warehouse ops, customs clearance, driver management, route optimization, cold chain monitoring, yard management, reverse logistics, EV charging, compliance logging, fuel analytics, carbon tracking, etc.

### 12B. COMMERCE DEEP OPS (6)
comparison-grid, smart-filters, vendor-performance-scorecard, omni-channel-inventory, customer-lifetime-value-crm

### 12C. FINTECH DEEP OPS (3)
kyc-verification-portal, loan-underwriting-desk, fraud-detection-console

### 12D. HEALTH DEEP OPS (3)
emr-patient-record, insurance-claims-processor, telehealth-doctor-console

### 12E. GOVTECH DEEP OPS (4)
civil-registry-record, judicial-case-manager, urban-planning-grid, tax-summary

### 12F. EDUCATION DEEP OPS (3)
student-info-system, curriculum-builder, campus-safety-monitor

### 12G. REAL ESTATE DEEP OPS (5)
property-listing, maintenance-req, lease-admin-ledger, facility-energy-manager, construction-project-tracker

### 12H. INSURANCE (3)
policy-admin-system, claims-adjuster-workbench, actuarial-risk-heatmap

### 12I. MANUFACTURING (3)
production-schedule-gantt, oee-dashboard, quality-control-station

### 12J. AUTOMOTIVE (3)
ev-status, vehicle-remote, toll-pass

### 12K. PROFESSIONAL SERVICES (3)
freelancer-card, consultation-timer, doc-scanner

### 12L. UTILITIES (3)
energy-graph, bill-pay, outage-map

### 12M. TRAVEL (1 additional)
hotel-concierge

### 12N. AGTECH (3)
livestock-tracker, crop-map, carbon-credit

### 12O. ENTERPRISE (3)
hr-onboarding, digital-signage, asset-tracker

### 12P. SPECTRUM — Non-Profit (7)
donor-profile, campaign-dashboard, volunteer-roster, impact-report, aid-distribution-map, donation-card, outcome-tracker

### 12Q. SPECTRUM — Science (5)
experiment-designer, lab-data-feed, sample-inventory, biohazard-monitor, research-paper-draft

### 12R. SPECTRUM — Security (4)
threat-radar, contract-lifecycle, compliance-checklist, incident-war-room

### 12S. SOCIAL MEDIA (2)
mini-video, game-scoreboard

### 12T. DEEP OPS Cross-Domain (15+)
community-moderation-queue, lab-sample-manager, donor-impact-crm, fleet-telematics-hub, smart-grid-load-balancer, gds-booking-terminal, recruitment-pipeline, soc-incident-response, precision-ag-dashboard, and more.

---

## 13. CMS COLLECTIONS (180+ Registered Verticals)

The CMS `verticals.registry.yaml` defines **180+ collections** organized by domain:

| Domain | Collections | Examples |
|---|---|---|
| **Commerce** | 12+ | products, service-plans, categories, price-lists, promotions, orders, memberships, loyalty-accounts, vendors, digital-products |
| **Healthcare** | 12+ | appointments, medical-records, prescriptions, lab-results, facilities, services, practitioners, health-alerts, community-programs |
| **Transportation** | 12+ | fleet-vehicles, fleet-drivers, fleet-shipments, fleet-trips, transit-routes, transit-passes, traffic-incidents, fleet-maintenance, fleet-inspections, fleet-iot-devices |
| **Governance** | 10+ | governance-authorities, proposals, votes, permits, public-consultations, tenders, grants, fines |
| **Finance** | 8+ | invoices, wallets, ledger-transactions, tax-records |
| **Events & Culture** | 10+ | events, event-categories, event-registrations, venues, venue-bookings, exhibitions, cultural-sites, heritage-sites, artists, tourism-packages |
| **Sports** | 4+ | sports-events, sports-venues |
| **Real Estate** | 6+ | properties, property-agents, rentals, rental-items |
| **Insurance** | 2+ | insurance-products |
| **Education** | 4+ | courses, course-enrollments |
| **Agriculture** | 4+ | crops, farming-activities, agriculture-sensor-readings |
| **IoT** | 4+ | iot-devices, iot-sensor-readings |
| **Jobs** | 3+ | job-listings, job-applications |
| **Social** | 3+ | social-posts |
| **Restaurants** | 2+ | restaurants, grocery-listings |
| **Pet Services** | 2+ | pet-services |
| **Parking** | 2+ | parking-zones, parking-facilities |
| **Legal** | 2+ | legal-services |
| **Community** | 3+ | charity-campaigns, crowdfunding-projects |
| **Identity** | 4+ | credentials, sso-providers, identity-api-keys |
| **Platform** | 20+ | nodes, tenants, personas, workflows, feature-flags, audit-logs, notifications, system-health, etc. |
| **POI (Points of Interest)** | 35+ | pois + 30+ satellite tables (hours, capabilities, media, accessibility, security, commerce-summary, etc.) |

---

## 14. CMS DOMAIN PACKAGES (65+ Packages)

The `packages/domains/` directory contains 65+ domain packages, each providing collection schemas, block definitions, and business logic:

| Category | Domain Packages |
|---|---|
| **Core** | core-cms, registry, multi-tenancy, identity-auth, personas, notifications, workflow |
| **Commerce** | commerce, auctions, classifieds, digital-products, print-on-demand, trade-in, restaurants, grocery |
| **Finance** | finance, insurance |
| **Fulfillment** | fleet-logistics, parking-zones, transportation |
| **Services** | beauty-grooming, pet-services, fitness |
| **Government** | governance, citizen-services, legal, public-safety |
| **Health** | healthcare, health-human-services |
| **Education** | education |
| **Property** | real-estate, construction, facilities |
| **Events** | events-culture, sports-recreation, culture-tourism, hospitality |
| **Tech** | iot-telemetry, ai-ml, data-visualization, gis-maps |
| **Environment** | agriculture, environment |
| **Industry** | industrial, franchise-management |
| **Media** | media-assets, social-media, social-engagement, creator-economy, advertising |
| **Jobs** | jobs-economy |
| **Platform** | saas-platform, white-label, analytics, system-observability, search |
| **Community** | community |
| **i18n** | i18n |
| **Shared** | shared, _shared, domain-shared |

---

## 15. MEDUSA COMMERCE MODULES (129 Modules)

The CMS contains a **Medusa v2 commerce backend** with 129 custom modules:

| Category | Modules |
|---|---|
| **Core Commerce** | cart-extension, cart-rules, channel, commission, company, commerce-contract, dispute, entitlements, fulfillment-legs, inventory, inventory-extension, invoice, loyalty, membership, order-orchestration, payout, quote, review, subscription, vendor, volume-pricing, wallet, warranty, wishlist |
| **Marketplace** | affiliate, auction, classified, crowdfunding, freelance, marketplace-pulse, social-commerce |
| **Payments** | Stripe integration, installments, store-credits, trade-in |
| **Verticals** | automotive, beauty-grooming, booking, campus-service, childcare, construction, coworking, creator-economy, education, eldercare, event-ticketing, fitness, government, grocery, healthcare, home-services, hospitality, industrial-mro, insurance, laundry, legal, manufacturing, parking, pet-service, pharmacy, real-estate, rental, restaurants, sports, travel, utilities |
| **Platform** | analytics, advertising, attribution, audit, charity, chargeback, cms-content, data-api, digital-product, economic-health, employment-hr, event-outbox, file-replit, file-vercel-blob, financial-product, fraud, governance, i18n, identity-gate, kernel, ledger, ledger-snapshot, logistics, metering, node, notification-preferences, persona, policy-engine, print-on-demand, tax-config, tenant, white-label |

---

## 16. CMS BLOCK TYPES (920+ Planned)

The CMS content system uses "blocks" (SDUI-compatible components) stored in a centralized JSONB table:

| Phase | Block Count | Description |
|---|---|---|
| Foundation (Phase 0) | 135 migrated | Existing blocks migrated to new system |
| Core Commerce (Phase 1) | ~180 new | Product cards, checkout flows, cart, orders |
| Finance & Marketplace (Phase 2) | ~80 new | Invoices, wallets, auctions, B2B |
| Service Verticals (Phase 3) | ~200 new | Healthcare, education, fitness, beauty |
| City Platform (Phase 4) | ~240 new | Governance, IoT, agriculture, environment |
| AI & Platform (Phase 5) | ~220 new | AI tools, analytics, platform admin |
| **TOTAL** | **~920 + 135** | Full block library |

Block rendering pipeline: `BlockRenderer → DomainAwareBlockRenderer` (with domain gating + role-based visibility)

---

## 17. MULTI-SURFACE APPS (18 App Families — 80+ Surfaces)

The CMS architecture defines **18 deployable app families** across 80+ unique surfaces. All consume the same SDUI protocol from the Experience Composer. The resolution formula is:

```
Final_UI_AST = f( Screen_ID + Hardware_Surface + Tenant_ID + User_Role + Live_Backend_State )
```

### 17A. CONSUMER EXPERIENCE FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 1 | **Super App** | Expo React Native | Citizens, Consumers (iOS/Android/Tablet) | 9 files scaffold (`apps/superapp`) | `artifacts/mobile` (Mobile) | IN DEVELOPMENT |
| 2 | **Consumer Web Platform** | Next.js → React Vite | Desktop/Mobile browser users | 10 files scaffold (`apps/web-platform`) | Web artifact | NOT STARTED |
| 3 | **PWA Desktop App** | React Vite + Service Worker | Installable desktop, offline-first | Not yet built in CMS | Web artifact | NOT STARTED |
| 4 | **AI Assistant Widget** | React embeddable widget | Any website/app (floating chat) | 2 files scaffold (`apps/ai-assistant`) | Web artifact | NOT STARTED |

**Consumer Web Platform details** (from CMS architecture doc):
- Browser counterpart to the Super App with full feature parity
- SSR/Edge rendering for SEO via Next.js Server Components
- SDUI blocks rendered server-side → pre-compiled semantic HTML
- Perfect Lighthouse SEO scores
- Tailwind CSS mapping: `SdNode` modifiers → utility classes

**PWA Desktop App details** (from CMS architecture doc):
- Installable desktop application via PWA manifest
- Service Workers for aggressive caching of SDUI structural frames
- Offline navigation with queued synchronization
- Graceful degradation: native-only features (AR, Bluetooth) negotiated away by capability-negotiator

**AI Assistant details** (from CMS architecture doc):
- Multimodal block streaming — AI constructs SDUI AST blocks dynamically
- Generative SDUI: user speaks intent → LLM orchestrates parallel queries → returns rich `SdMap` + `SdGrid` widgets inline in conversation
- Sandboxed agent execution: AI generates intent, deterministic backend enforces transaction
- Embeddable as `@dakkah/assistant-widget` React context provider — floating action button in Super App, Kiosk, Merchant POS

### 17B. COMMERCE FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 5 | **Storefront** | TanStack Router (React) | Online shoppers | 1,169 files built (`apps/storefront`) | Web artifact | NOT STARTED |
| 6 | **POS / Counter Runtime** | Expo RN or Electron | Android POS, Self-Order Terminals, Cash Registers | Not yet built in CMS | Mobile/Web artifact | NOT STARTED |

**Storefront details** (from CMS codebase):
- Fully built: 1,169 TSX files
- 6 pages: home, store, product, cart, checkout, order-confirmation
- 26+ component directories: account, admin, ai, auctions, auth, b2b, blocks, blog, bookings, business, campaigns, cart, checkout, cityos, cms, commerce, compare, consent, consignment, content, etc.
- Account dashboard: subscriptions, downloads, installments, loyalty, wallet, store-credits, verification, consents
- Admin panel: analytics, bulk actions, advanced filters, audit log, channel mapping, tenant settings, user management
- Uses TanStack Router + Medusa JS SDK

**POS / Counter Runtime details** (from CMS architecture doc):
- Designed for tablets at physical storefronts, restaurants, fulfillment centers
- Hardware bridge: NFC scanning, thermal receipt printing via Bluetooth, barcode scanning via `expo-camera`
- SDUI node types: `SdScannerInput` (mounts camera for barcode), `SdPeripheral` (printer/NFC commands)
- Medusa commerce execution: capture payments, process orders via `SdAction` mutations
- Optimistic UI: server returns patched SDUI sub-tree reflecting new state instantly
- Offline tolerance: action queueing via AsyncStorage/SQLite, background sync on reconnect
- Telemetry: `x-cityos-surface: tablet`, `x-cityos-os: ios`

### 17C. BUSINESS & MERCHANT FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 7 | **Merchant App** | Expo React Native | Shop owners, Restaurant staff, Vendors | 10 files scaffold (`apps/merchant-app`) | Mobile artifact | NOT STARTED |
| 8 | **Business Dashboard** | Next.js → React Vite | Retail offices, Analytics teams | 12 files scaffold (`apps/business-dashboard`) | Web artifact | NOT STARTED |

**Merchant App details** (from CMS codebase):
- Scaffold: LoginScreen, RegisterScreen, DynamicScreen, SduiRenderer, AuthContext
- Auth connects to Payload CMS `/api/users/login`
- SDUI fetches from `/api/sdui/tablet_pos`
- Listing ops, booking notifications, campaign participation

**Business Dashboard details** (from CMS codebase):
- Scaffold: AuthGuard + SduiRenderer + Keycloak auth callback
- Fetches SDUI from `/api/sdui/merchant_overview?surface=dashboard`
- Title: "CityOS Merchant Console — Fully Server-Driven"
- Catalog management, reporting, campaigns

### 17D. GOVERNMENT / PLATFORM FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 9 | **City Dashboard** | Next.js → React Vite | City operations managers, Control rooms | 12 files scaffold (`apps/city-dashboard`) | Web artifact | NOT STARTED |
| 10 | **Smart City Portal** | Next.js → React Vite | Citizens accessing government services | 2 files scaffold (`apps/smart-city-portal`) | Web artifact | NOT STARTED |
| 11 | **Dev Portal** | Next.js → React Vite | Third-party developers, Partners | 8 files scaffold (`apps/dev-portal`) | Web artifact | NOT STARTED |

**City Dashboard details** (from CMS codebase):
- Scaffold: AuthGuard + SduiRenderer + dark theme (slate-900)
- Fetches SDUI from `/api/sdui/city_analytics?surface=desktop_wide`
- Title: "CityOS Macro Analytics — Real-Time SDUI Stream"
- Queries Elasticsearch/TimescaleDB for live city analytics
- Generates `SdDataGrid`, `SdLineChart`, `SdPieChart` blocks in real-time

**Dev Portal details** (from CMS architecture doc):
- Developer-centric: API key generation, SDK integration tracking
- `SdForm` for token generation → `SdAction: generate_api_token` → `SdCopyText` code block
- Docs, API keys, schemas, integrations sandbox

### 17E. LOGISTICS / FIELD FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 12 | **Driver App** | Expo React Native | Delivery drivers, Fleet drivers, Field agents | 9 files scaffold (`apps/driver-app`) | Mobile artifact | NOT STARTED |
| 13 | **FleetOps Dashboard** | Next.js → React Vite | Fleet managers, Dispatch operators | 141 files built (`apps/fleetops`) | Web artifact | NOT STARTED |

**Driver App details** (from CMS codebase):
- Scaffold: LoginScreen, DynamicScreen, SduiRenderer, AuthContext
- Auth connects to Payload CMS `/api/users/login`
- Title: "Driver Portal"
- Role-based SDUI: courier role → `SdList` of waypoints when working, "Go Online" `SdButton` when off-duty
- Rugged Android/vehicle mount optimized

**FleetOps Dashboard details** (from CMS codebase):
- 141 files — substantial operational fleet management dashboard
- Connected to Fleetbase backend for real-time fleet tracking
- Driver dispatch, route optimization, fleet analytics

### 17F. PUBLIC / AMBIENT FAMILY

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 14 | **Kiosk Runtime** | Electron → React Vite | Airport terminals, Museums, Mall directories | Empty scaffold (`apps/kiosk-runtime`) | Web artifact | NOT STARTED |
| 15 | **TV App** | React Native TV → Web sim | Digital signage, Smart TVs, Menu boards | 2 files scaffold (`apps/tv-app`) | Web artifact (simulator) | NOT STARTED |
| 16 | **Car App** | CarPlay/Android Auto → Web sim | Fleet vehicle dashboards, Navigation | 2 files scaffold (`apps/car-app`) | Web artifact (simulator) | NOT STARTED |
| 17 | **Watch App** | Native Swift/Kotlin | Apple Watch, Wear OS — glanceable alerts | Empty scaffold (`apps/watch-app`) | Cannot build (native only) | NOT POSSIBLE IN REPLIT |

**Kiosk Runtime details** (from CMS architecture doc):
- Electron or React Native Windows/macOS packaged app
- `x-cityos-surface: kiosk` capability header
- Hardware bridge: serial ports for receipt printing (`SdPrintNode`), NFC scanners
- OS-level app-pinning (MDM lockout), no URL navigation — only SDUI actions
- Guest mode, safe browsing, wayfinding
- Web Platform already has `/kiosk` page for testing

**TV App details** (from CMS architecture doc):
- `x-cityos-surface: tv_1080p` capability header
- Spatial navigation: D-Pad input (Up/Down/Left/Right/Select) — no touch
- Composer restructures arrays: 100-item web grid → horizontal `SdCarousel` for 10-foot viewing
- React Native TV / Tizen / WebOS targets

**Car App details** (from CMS architecture doc):
- Apple CarPlay `CPListTemplate` + Android Auto `ItemList` mapping
- `SdList` → native car OS templates; `grid`/`card` layouts flattened or ignored
- Hyper-strict safety templates mandated by driving laws
- No custom UI rendering allowed by Apple/Google — must use OS templates

**Watch App details** (from CMS architecture doc):
- NOT React Native — pure SwiftUI (iOS) + Jetpack Compose (Android)
- JS engines battery-prohibitive on watches
- Capability-negotiator strips: complex hierarchies, images >100kb, wide tables
- Flattens to text `SdStack` nodes only
- Use cases: driver "Next Stop" glance, merchant "New Order" buzz

### 17G. DEV TOOLS

| # | App | Technology | Target Users | CMS Code | Replit Artifact | Build Status |
|---|---|---|---|---|---|---|
| 18 | **Storybook** | Vite + Storybook 10 | Developers, Designers | 20 files (`apps/storybook`) | Web artifact | NOT STARTED |

**Storybook details** (from CMS codebase):
- Design system documentation with Chromatic visual testing
- Uses `@cityos/design-tokens` for theming
- Domain story generation scripts
- Fixture validation
- Accessibility addon (`@storybook/addon-a11y`)

### 17H. BACKEND / ADMIN (Not buildable as Replit artifacts — part of CMS infrastructure)

| App | Technology | Purpose | Notes |
|---|---|---|---|
| **Payload CMS Admin** | Next.js + Payload 3 | Backend admin panel, collection management | Runs as part of CMS |
| **Medusa Backend** | Medusa v2 | Commerce engine (3,087 files) | Runs as separate service |
| **Keycloak Admin** | Java | Identity & access management | External service |
| **Kuzzle Admin Console** | Node.js | IoT platform administration | External service |
| **Node-RED** | Node.js | Visual IoT flow programming | External service |

### 17I. COMPLETE APP INVENTORY SUMMARY

| Category | Apps | Buildable in Replit | Technology |
|---|---|---|---|
| **Consumer** | Super App, Consumer Web, PWA Desktop, AI Assistant | 4/4 | 1 Expo + 3 React Vite |
| **Commerce** | Storefront, POS/Counter | 2/2 | 1 React Vite + 1 Expo |
| **Business** | Merchant App, Business Dashboard | 2/2 | 1 Expo + 1 React Vite |
| **Government** | City Dashboard, Smart City Portal, Dev Portal | 3/3 | 3 React Vite |
| **Logistics** | Driver App, FleetOps Dashboard | 2/2 | 1 Expo + 1 React Vite |
| **Ambient** | Kiosk, TV (sim), Car (sim), Watch | 3/4 | 3 React Vite (watch = native only) |
| **Dev Tools** | Storybook | 1/1 | React Vite |
| **TOTAL** | **18 app families** | **17/18 buildable** | **4 Expo + 13 React Vite** |

---

## 18. SDUI PROTOCOL & CAPABILITY NEGOTIATION

The CMS includes a **Server-Driven UI** protocol (`@dakkah/sdui-protocol`) — the backbone of the entire multi-surface architecture:

### 18A. SDUI Node Types

| Node Type | Schema | Description |
|---|---|---|
| `text` | `SdTextNodeSchema` | Typography: h1-h4, body, caption, label; color + alignment |
| `button` | `SdButtonNodeSchema` | Interactive: solid/outline/ghost/link variants; icon, loading, disabled |
| `image` | `SdImageNodeSchema` | Media: URL, aspect ratio, cover/contain/stretch |
| `stack` | recursive | Layout container: horizontal/vertical, alignment, spacing, wrap |
| `card` | recursive | Touchable container with children + onPress action |
| `carousel` | `SdCarouselNodeSchema` | Scrollable item list with autoPlay + loop |
| `grid` | `SdGridNodeSchema` | Column-based layout with gap control |
| `map` | `SdMapNodeSchema` | Geographic: lat/lng, zoom, markers with onPress |

### 18B. SDUI Actions

| Action Type | Description |
|---|---|
| `navigate` | In-app screen navigation |
| `api_mutation` | Backend state change (orders, payments, bookings) |
| `open_url` | External URL launch |
| `copy_text` | Clipboard copy |
| `share` | Native share sheet |
| `trigger_workflow` | Temporal workflow execution |
| `deep_link` | Cross-app deep link |
| `copy_clipboard` | Clipboard copy (alternate) |
| `request_hardware_access` | Camera, NFC, Bluetooth, printer |

### 18C. SDUI Modifiers

All visual nodes support universal modifiers:
- `padding` / `margin` (xs/sm/md/lg/xl/full)
- `backgroundColor` (primary/secondary/success/danger/warning/info/surface/transparent)
- `cornerRadius` (xs/sm/md/lg/xl/full)
- `hidden` (boolean)

### 18D. Capability Negotiation

| Capability | Options |
|---|---|
| **OS** | ios, android, web, watchos, wearos, tvos, carplay, android_auto, kiosk |
| **Screen Class** | mobile, tablet, desktop, watch, tv, ambient |
| **Input Methods** | touch, mouse, keyboard, voice, dpad, remote |

### 18E. SDUI Resolution Pipeline

```
Client Request → Experience Composer → Capability Negotiator → Payload CMS DB → Live Hydration Hooks → JSON AST Response

Headers: x-cityos-surface, x-cityos-os, x-tenant-id, Authorization (Keycloak JWT)
Endpoint: GET /api/sdui/{screenId}?surface={target}&tenant={tenantId}&user={userId}
```

**Live Hydration**: Template strings like `{{ fleetbase.active_trips.count }}` in SDUI JSON are replaced server-side with live backend data before shipping to client.

| Feature | Description | Current App Status |
|---|---|---|
| **SDUI Protocol** (`@dakkah/sdui-protocol`) | Typed JSON protocol for server-driven layouts | NOT IMPLEMENTED |
| **Capability Negotiator** | Downgrades complex layouts for constrained devices | NOT IMPLEMENTED |
| **Experience Composer** | Composes SDUI payloads from block data + live hydration | NOT IMPLEMENTED |
| **Tenant Router** | Routes SDUI requests per tenant configuration | NOT IMPLEMENTED |
| **SduiRenderer** (Mobile) | React Native renderer for SDUI nodes | NOT IMPLEMENTED |
| **SduiRenderer** (Web) | React DOM renderer with Tailwind mapping | NOT IMPLEMENTED |
| **Live Hydration Hooks** | Template injection from Fleetbase/Medusa/ERPNext | NOT IMPLEMENTED |
| **Generative SDUI** | AI-composed SDUI blocks via LLM tool-calling | NOT IMPLEMENTED |

---

## 19. DESIGN SYSTEM & TOKENS

The CMS has a comprehensive design system consisting of 3 shared packages:

### 19A. `@cityos/design-tokens`

| Token Category | File | Values |
|---|---|---|
| **Colors** | `tokens/colors.ts` | primary (navy #0a1628), accent (blue #3182ce), extended (purple, teal, amber, rose), semantic (success/warning/error/info), neutral (gray50-900), surface (light/dark), text (light/dark), border (light/dark) |
| **Spacing** | `tokens/spacing.ts` | xs:4px, sm:8px, md:16px, lg:24px, xl:32px, 2xl:48px, 3xl:64px |
| **Typography** | `tokens/typography.ts` | Inter font family, sizes xs-5xl, weights 400-800, line-heights 1-2 |
| **Borders** | `tokens/borders.ts` | Border radii and styles |
| **Breakpoints** | `tokens/breakpoints.ts` | Responsive breakpoints |
| **Elevation** | `tokens/elevation.ts` | Shadow levels |
| **Motion** | `tokens/motion.ts` | Animation timing |
| **Shadows** | `tokens/shadows.ts` | Box shadow tokens |
| **Layout** | `tokens/layout.ts` | Container widths, grid gaps |
| **Semantic** | `tokens/semantic.ts` | Contextual color mappings |
| **Z-Index** | `tokens/z-index.ts` | Stacking order |
| **Native** | `native/index.ts` | React Native-specific token exports |

### 19B. `@cityos/design-system`

| Component | File | Description |
|---|---|---|
| **Alert** | `ui/alert.tsx` | Status alerts with variants |
| **Avatar** | (stories only) | User avatars |
| **Badge** | `ui/badge.tsx` | Status badges |
| **Button** | `ui/button.tsx` | Action buttons with CVA variants |
| **Card** | `ui/card.tsx` | Content cards |
| **Checkbox** | `ui/checkbox.tsx` | Boolean inputs |
| **Dialog** | `ui/dialog.tsx` | Modal dialogs |
| **Feedback** | `ui/feedback.tsx` | User feedback components |
| **Input** | `ui/input.tsx` | Text inputs |
| **Label** | `ui/label.tsx` | Form labels |
| **Progress** | (stories only) | Progress indicators |
| **Select** | `ui/select.tsx` | Dropdown selects |
| **Skeleton** | (stories only) | Loading skeletons |
| **Switch** | `ui/switch.tsx` | Toggle switches |
| **Table** | `ui/table.tsx` | Data tables |
| **Tabs** | `ui/tabs.tsx` | Tab navigation |
| **Textarea** | `ui/textarea.tsx` | Multi-line text inputs |
| **Tooltip** | `ui/tooltip.tsx` | Hover tooltips |

Built with: `class-variance-authority` + `clsx` + `tailwind-merge`

### 19C. `@cityos/universal-ui`

Cross-platform UI components that work on both web and React Native. Uses same token system as design-system.

### 19D. CityOS Blocks (Storybook)

The Storybook app includes `CityOSBlocks.tsx` — a visual catalog of all domain-specific SDUI block types with stories for testing.

| Current App Status | Gap |
|---|---|
| Uses custom `constants/colors.ts` with teal `#0A9396` + navy `#0D1B2A` | Need to adopt `@cityos/design-tokens` color palette |
| No shared component library | Need to implement `@cityos/universal-ui` for React Native |
| No Storybook | Need component documentation |

---

## 20. SHARED PACKAGES

The CMS monorepo contains shared packages that all apps consume:

| Package | Purpose | Current App Status |
|---|---|---|
| `@cityos/design-tokens` | Colors, spacing, typography, motion, elevation | NOT USING |
| `@cityos/design-system` | 18 web UI components (button, card, input, etc.) | NOT USING |
| `@cityos/design-runtime` | Runtime token resolution | NOT USING |
| `@cityos/universal-ui` | Cross-platform (web + RN) components | NOT USING |
| `@cityos/auth` | Keycloak PKCE auth context + types | NOT USING |
| `@dakkah/sdui-protocol` | SDUI Zod schemas, node types, action types, capabilities | NOT USING |
| `@dakkah/assistant-widget` | Embeddable AI assistant React context provider | NOT USING |
| `@cityos/api-client` | Shared API fetchers for BFF/CMS | NOT USING |
| `@cityos/context-sdk` | NodeContext validation | NOT USING |
| `@cityos/analytics-sdk` | Event tracking | NOT USING |
| `@cityos/feature-flags` | Feature flag evaluation | NOT USING |
| `@cityos/offline-sync` | Offline action queueing + sync | NOT USING |
| `@cityos/localization` | i18n with en/fr/ar | NOT USING |
| `@cityos/observability` | Logging, tracing, metrics | NOT USING |
| `@cityos/surface-capabilities` | Device capability schema definitions | NOT USING |
| `@cityos/block-registry` | Shared SDUI block definitions | NOT USING |
| `packages/bff-core` | Express.js BFF framework (auth, tenant, correlation middleware) | NOT USING |

---

## 21. MICROSERVICES & INFRASTRUCTURE

| Service | Description | Current App Status |
|---|---|---|
| **Experience Composer** (`services/experience-composer`) | Translates requests into SDUI block payloads | NOT CONNECTED |
| **AI Orchestrator** (`services/ai-orchestrator`) | Conversational block manipulation via LLM | NOT CONNECTED |
| **Capability Negotiator** (`services/capability-negotiator`) | Validates device OS/app limitations against schema | NOT CONNECTED |
| **Tenant Router** (`services/tenant-router`) | Routes requests per tenant configuration | NOT CONNECTED |
| **Node Router** (`services/node-router`) | Hierarchical node-based routing | NOT CONNECTED |
| **Policy Gateway** (`services/policy-gateway`) | Authorization policy enforcement | NOT CONNECTED |
| **BFF Core** (`packages/bff-core`) | Express.js BFF framework with auth, tenant, correlation middleware | NOT CONNECTED |
| **Kuzzle IoT** | Real-time IoT data platform with WebSocket + MQTT | NOT CONNECTED |
| **Temporal Cloud** | Workflow orchestration (multi-step processes) | NOT CONNECTED |
| **Redis** | Caching layer | NOT CONNECTED |
| **Elasticsearch** | Full-text search (Kuzzle backend) | NOT CONNECTED |
| **Docker Compose** | Full-stack local development (17+ containers) | N/A |
| **Traefik** | Reverse proxy with path-based routing | N/A |
| **Prometheus + Grafana** | Metrics and monitoring | NOT CONNECTED |
| **Sentry** | Error tracking | NOT CONNECTED |
| **Webhook System** | HMAC-SHA256 signed webhooks with retry | NOT CONNECTED |
| **Event Bus** | cityos.{vertical}.{op}.v1 events via Outbox pattern | NOT CONNECTED |
| **SSE Streams** | Server-Sent Events for real-time workflow updates | NOT CONNECTED |

---

## 22. CURRENT APP EXCLUSIVE FEATURES (Not in Reference App)

| Feature | Description |
|---|---|
| **Expo React Native** | Native iOS/Android + Web (reference is web-only) |
| **Dark Mode** | Full ThemeContext with light/dark toggle |
| **i18n (English + Arabic, RTL)** | 60+ translated keys with RTL layout |
| **Offline Indicator** | Connection status component |
| **Error Boundary** | Crash recovery UI |
| **AsyncStorage persistence** | Local data survival across restarts |
| **Contact Profile Modal** | View contact details |
| **Active Quests Widget** | Gamification mission tracker |
| **Express.js API Server** | 11 backend gateway routes |
| **Voice Input Button** | Native microphone input |
| **Media Picker Button** | Camera/gallery attachment |

---

## 23. ADDITIONAL RECOMMENDED CAPABILITIES (Beyond Both Apps)

| Capability | Description | Priority |
|---|---|---|
| **Push Notifications** | Expo push notifications for real-time alerts | HIGH |
| **Biometric Auth** | FaceID/TouchID for secure login | HIGH |
| **Offline-First Sync** | Queue actions offline, sync when connected | HIGH |
| **Deep Linking** | Universal links for app-to-app navigation | HIGH |
| **Geofencing** | Location-based triggers for city services | MEDIUM |
| **NFC/QR Scanner** | Scan passes, tickets, payments | MEDIUM |
| **Apple/Google Pay** | Native payment methods | HIGH |
| **AR Wayfinding** | Augmented reality navigation in malls/airports | LOW |
| **Haptic Feedback** | Tactile feedback for confirmations | MEDIUM |
| **Widget Support** | iOS/Android home screen widgets | MEDIUM |
| **Watch Companion** | Apple Watch / Wear OS quick actions | LOW |
| **CarPlay/Android Auto** | In-car copilot interface | LOW |
| **Accessibility** | VoiceOver/TalkBack, dynamic text sizing | HIGH |
| **App Clips / Instant Apps** | Lightweight entry points without install | MEDIUM |
| **Social Sharing** | Share discoveries, events, itineraries | MEDIUM |
| **Multi-language TTS** | Text-to-speech for AI responses | MEDIUM |
| **Background Location** | Continuous tracking for delivery/ride apps | MEDIUM |
| **Local Notifications** | Reminders, agenda alerts | HIGH |
| **Keychain/Secure Store** | Secure credential storage | HIGH |
| **Expo Updates (OTA)** | Over-the-air updates without app store | HIGH |

---

## 24. SUMMARY SCORECARD

| Dimension | Current App | Reference Chat App | CMS Backend |
|---|---|---|---|
| **Artifact Types** | 48 | 205 | 920+ blocks planned |
| **Scenario Files** | 21 | 21 | — |
| **Discovery Categories** | 20 | 20 | — |
| **UI Panels/Dialogs** | 17 | 15 | — |
| **Backend Systems** | 1 (Express) | 1 (Supabase) | 17+ systems |
| **API Endpoints** | 11 | ~5 | 392 |
| **BFF Services** | 0 | 0 | 8 |
| **CMS Collections** | 0 | 0 | 180+ |
| **Domain Packages** | 0 | 0 | 65+ |
| **Commerce Modules** | 0 | 0 | 129 (Medusa) |
| **App Families** | 1 | 1 | 18 (80+ surfaces) |
| **Design Token Categories** | 1 (colors) | — | 11 (colors, spacing, typography, borders, breakpoints, elevation, motion, shadows, layout, semantic, z-index) |
| **Shared UI Components** | 0 | — | 18 (design-system) + universal-ui |
| **Chat Features** | 16/16 | 16/16 | — |
| **Dark Mode** | ✅ | ❌ | ✅ (tokens) |
| **i18n (Arabic/RTL)** | ✅ | ❌ | ✅ (en/fr/ar) |
| **Mobile Native** | ✅ | ❌ | ✅ (Expo planned) |
| **Offline Support** | ✅ | ❌ | — |
| **Real Auth** | ❌ | ✅ (Supabase) | ✅ (Keycloak) |
| **Real Backend** | ❌ | ✅ (partial) | ✅ (full stack) |
| **Multi-tenancy** | ❌ | ❌ | ✅ (5-tier) |
| **SDUI Protocol** | ❌ | ❌ | ✅ |
| **Multi-Surface** | 1 surface | 1 surface | 18 app families |
| **IoT Real-time** | ❌ | ❌ | ✅ (Kuzzle) |
| **Workflow Orchestration** | ❌ | ❌ | ✅ (Temporal) |
| **PWA / Desktop** | ❌ | ❌ | ✅ (planned) |
| **POS / Counter** | ❌ | ❌ | ✅ (designed) |

---

## 25. PRIORITIZED ROADMAP

### Phase 0: SHARED FOUNDATION
1. **Adopt CMS Design Tokens** — Port `@cityos/design-tokens` (colors, spacing, typography, motion, elevation) into our workspace
2. **Implement Universal UI** — Create React Native versions of `@cityos/universal-ui` components
3. **SDUI Protocol Package** — Port `@dakkah/sdui-protocol` Zod schemas + TypeScript types
4. **SduiRenderer (Mobile)** — Build React Native renderer for SDUI node types (text, button, image, stack, card, carousel, grid, map)
5. **SduiRenderer (Web)** — Build React DOM renderer with Tailwind CSS mapping
6. **Auth SDK** — Port `@cityos/auth` Keycloak PKCE client

### Phase 1: SUPER APP COMPLETION (Connect to CMS Backend)
1. **Keycloak Auth Integration** — Replace AsyncStorage auth with Keycloak OIDC
2. **BFF Platform Connection** — Connect to bff-platform (port 4006) for auth, tenancy
3. **Server-side Thread Persistence** — Store conversations in CMS PostgreSQL
4. **Copilot Gateway** — Connect AI chat to CMS `/api/ai/chat` and `/api/ai/execute`
5. **SDUI Integration** — Fetch and render SDUI screens from Experience Composer
6. **Copilot Settings Dialog** — AI tuning (temperature, model, privacy mode)
7. **Toast Notifications** — User feedback system
8. **Push Notifications** — Expo push notification setup

### Phase 2: COMMERCE APPS
1. **BFF Commerce Connection** — Products, cart, checkout, orders via bff-commerce (port 4001)
2. **Stripe Payments** — Real payment processing via CMS Stripe integration
3. **Storefront App** — Adapt 1,169-file storefront from TanStack Router to React Vite
4. **POS / Counter App** — New Expo mobile artifact with hardware bridge (NFC, barcode, thermal printer)
5. **Meilisearch Integration** — Universal cross-domain search
6. **15 HIGH priority artifacts** — logistics-map, fleet-health-matrix, telehealth, property-listing, bill-pay, toll-pass, hotel-concierge, mini-video, smart-filters, comparison-grid, kyc-verification, emr-patient-record, tax-summary, demand-forecast

### Phase 3: BUSINESS & MERCHANT APPS
1. **Merchant App** — New Expo mobile artifact; POS tablet operations, booking notifications, campaigns
2. **Business Dashboard** — New React Vite artifact; SDUI-based merchant console
3. **BFF Transport Connection** — Fleet tracking, delivery, ride-hailing via bff-transport (port 4004)
4. **Fleetbase Integration** — Real-time fleet tracking, driver dispatch

### Phase 4: GOVERNMENT, HEALTH & LOGISTICS APPS
1. **City Dashboard** — New React Vite artifact; macro analytics, dark theme, SDUI real-time
2. **Smart City Portal** — New React Vite artifact; citizen government services
3. **Dev Portal** — New React Vite artifact; API docs, key generation, SDK tracking
4. **Driver App** — New Expo mobile artifact; role-based SDUI (courier waypoints / go-online)
5. **FleetOps Dashboard** — New React Vite artifact; adapt 141-file dashboard
6. **BFF Governance Connection** — Permits, proposals, citizen services via bff-governance (port 4002)
7. **BFF Healthcare Connection** — Appointments, records via bff-healthcare (port 4003)
8. **Walt.id DID** — Verifiable credentials, digital identity

### Phase 5: CONSUMER WEB, PWA & AI
1. **Consumer Web Platform** — New React Vite artifact; browser counterpart to Super App with SEO
2. **PWA Desktop App** — New React Vite artifact; service worker, offline-first, installable desktop
3. **AI Assistant Widget** — New React Vite artifact; embeddable chat with generative SDUI
4. **Generative SDUI** — AI constructs SDUI blocks dynamically via LLM tool-calling
5. **BFF Events Connection** — Events, sports, tourism via bff-events (port 4005)
6. **BFF Social Connection** — Social media, engagement via bff-social (port 4008)
7. **BFF IoT Connection** — IoT sensors, agriculture via bff-iot (port 4007)

### Phase 6: AMBIENT & SPECIALTY APPS
1. **Kiosk Runtime** — New React Vite artifact; full-screen kiosk with hardware bridge simulation
2. **TV App** — New React Vite artifact; spatial navigation simulator, carousel-optimized
3. **Car App** — New React Vite artifact; list-based CarPlay/Android Auto simulator
4. **Storybook** — New React Vite artifact; design system documentation with all component stories
5. **Temporal Workflows** — Multi-step process orchestration
6. **All remaining 100+ artifacts** — Domain verticals

### Phase 7: NATIVE PLATFORM FEATURES & MIGRATION
1. **Biometric Auth** — FaceID/TouchID
2. **NFC/QR Scanner** — Passes, tickets, payments
3. **Apple/Google Pay** — Native payment methods
4. **Geofencing** — Location-based city triggers
5. **Widgets** — Home screen widgets
6. **Accessibility** — Full VoiceOver/TalkBack support
7. **Expo OTA Updates** — Over-the-air deployments
8. **Migration to CMS Monorepo** — Move all completed apps into `apps/` in `dakkah-cityos-cms`
