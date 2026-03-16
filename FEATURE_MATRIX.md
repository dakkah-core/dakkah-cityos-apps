# Dakkah CityOS — Universal Super App Feature Matrix

## Three-Way Comparison: Current Mobile App vs Reference Chat App vs CMS Backend

> **Vision**: Dakkah CityOS is a Universal Super App — a Conversational City Experience OS where
> ALL capabilities are accessed through an AI copilot. The mobile app (this project) will eventually
> move to `apps/superapp` inside the CMS monorepo after all implementations are complete.

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
17. [Multi-Surface Apps (14 surfaces)](#17-multi-surface-apps)
18. [SDUI Protocol & Capability Negotiation](#18-sdui-protocol)
19. [Microservices & Infrastructure](#19-microservices--infrastructure)
20. [Current App Exclusive Features](#20-current-app-exclusive-features)
21. [Additional Recommended Capabilities](#21-additional-recommended-capabilities)
22. [Summary Scorecard](#22-summary-scorecard)
23. [Prioritized Roadmap](#23-prioritized-roadmap)

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
| **Design System** | constants/colors.ts | Tailwind + shadcn/ui | Token Bridge + 51 components + SCSS | GAP |

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

## 17. MULTI-SURFACE APPS (14 Surfaces)

The CMS monorepo contains apps for 14+ different "surfaces" (user interfaces):

| App | Technology | Purpose | Current App Status |
|---|---|---|---|
| **superapp** | Expo React Native | Universal consumer app (THIS PROJECT) | IN DEVELOPMENT |
| **storefront** | Next.js | Web commerce front | NOT CONNECTED |
| **city-dashboard** | Next.js | City operations dashboard | NOT CONNECTED |
| **business-dashboard** | Next.js | Business analytics dashboard | NOT CONNECTED |
| **smart-city-portal** | Next.js | Citizen-facing portal | NOT CONNECTED |
| **web-platform** | Next.js | General web platform | NOT CONNECTED |
| **dev-portal** | Next.js | Developer documentation portal | NOT CONNECTED |
| **driver-app** | Expo React Native | Driver/delivery companion | NOT CONNECTED |
| **merchant-app** | Expo React Native | Merchant management app | NOT CONNECTED |
| **tv-app** | React Native | Smart TV interface | NOT CONNECTED |
| **car-app** | React Native | In-car dashboard (CarPlay/Android Auto) | NOT CONNECTED |
| **watch-app** | — | Smartwatch companion | SCAFFOLD ONLY |
| **kiosk-runtime** | — | Public kiosk interface | SCAFFOLD ONLY |
| **ai-assistant** | React | Embedded AI assistant widget | NOT CONNECTED |
| **storybook** | Storybook | Component documentation | NOT CONNECTED |
| **payload-cms** | Next.js + Payload | Admin panel | NOT CONNECTED |

---

## 18. SDUI PROTOCOL & CAPABILITY NEGOTIATION

The CMS includes a **Server-Driven UI** protocol for rendering content across all surfaces:

| Feature | Description | Current App Status |
|---|---|---|
| **SDUI Protocol** (`@dakkah/sdui-protocol`) | Typed JSON protocol for server-driven layouts | NOT IMPLEMENTED |
| **Capability Negotiator** (`@cityos/capability-negotiator`) | Downgrades complex layouts for constrained devices (watch, car, TV) | NOT IMPLEMENTED |
| **Experience Composer** (`@cityos/experience-composer`) | Composes SDUI payloads from block data | NOT IMPLEMENTED |
| **Tenant Router** (`@cityos/tenant-router`) | Routes SDUI requests per tenant configuration | NOT IMPLEMENTED |
| **Node types** | stack, grid, carousel, card, text, image, map, video | NOT IMPLEMENTED |
| **Device targets** | iOS, Android, Web, tvOS, watchOS, CarPlay, Kiosk | NOT IMPLEMENTED |

---

## 19. MICROSERVICES & INFRASTRUCTURE

| Service | Description | Current App Status |
|---|---|---|
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

## 20. CURRENT APP EXCLUSIVE FEATURES (Not in Reference App)

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

## 21. ADDITIONAL RECOMMENDED CAPABILITIES (Beyond Both Apps)

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

## 22. SUMMARY SCORECARD

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
| **Chat Features** | 16/16 | 16/16 | — |
| **Dark Mode** | ✅ | ❌ | ✅ (tokens) |
| **i18n (Arabic/RTL)** | ✅ | ❌ | ✅ (en/fr/ar) |
| **Mobile Native** | ✅ | ❌ | ✅ (Expo planned) |
| **Offline Support** | ✅ | ❌ | — |
| **Real Auth** | ❌ | ✅ (Supabase) | ✅ (Keycloak) |
| **Real Backend** | ❌ | ✅ (partial) | ✅ (full stack) |
| **Multi-tenancy** | ❌ | ❌ | ✅ (5-tier) |
| **SDUI Protocol** | ❌ | ❌ | ✅ |
| **Multi-Surface** | 1 surface | 1 surface | 14+ surfaces |
| **IoT Real-time** | ❌ | ❌ | ✅ (Kuzzle) |
| **Workflow Orchestration** | ❌ | ❌ | ✅ (Temporal) |

---

## 23. PRIORITIZED ROADMAP

### Phase 1: CRITICAL GAPS (Connect to CMS Backend)
1. **Keycloak Auth Integration** — Replace AsyncStorage auth with Keycloak OIDC
2. **BFF Platform Connection** — Connect to bff-platform (port 4006) for auth, tenancy
3. **Server-side Thread Persistence** — Store conversations in CMS PostgreSQL
4. **Copilot Gateway** — Connect AI chat to CMS `/api/ai/chat` and `/api/ai/execute`
5. **Copilot Settings Dialog** — AI tuning (temperature, model, privacy mode)
6. **Toast Notifications** — User feedback system
7. **Push Notifications** — Expo push notification setup

### Phase 2: COMMERCE & CITY SERVICES
1. **BFF Commerce Connection** — Products, cart, checkout, orders via bff-commerce (port 4001)
2. **Stripe Payments** — Real payment processing via CMS Stripe integration
3. **15 HIGH priority artifacts** — logistics-map, fleet-health-matrix, telehealth, property-listing, bill-pay, toll-pass, hotel-concierge, mini-video, smart-filters, comparison-grid, kyc-verification, emr-patient-record, tax-summary, demand-forecast
4. **Meilisearch Integration** — Universal cross-domain search
5. **Content-Enriched Products** — Product data + CMS editorial content merged

### Phase 3: TRANSPORT & LOGISTICS
1. **BFF Transport Connection** — Fleet tracking, delivery, ride-hailing via bff-transport (port 4004)
2. **Fleetbase Integration** — Real-time fleet tracking, driver dispatch
3. **40+ Logistics Artifacts** — Fleet management, driver hub, supply chain
4. **Real-time WebSocket** — Kuzzle connection for live tracking

### Phase 4: GOVERNMENT & HEALTH
1. **BFF Governance Connection** — Permits, proposals, citizen services via bff-governance (port 4002)
2. **BFF Healthcare Connection** — Appointments, records via bff-healthcare (port 4003)
3. **Walt.id DID** — Verifiable credentials, digital identity
4. **ERPNext Connection** — Invoices, inventory, HR

### Phase 5: EVENTS, SOCIAL, IOT
1. **BFF Events Connection** — Events, sports, tourism via bff-events (port 4005)
2. **BFF Social Connection** — Social media, engagement via bff-social (port 4008)
3. **BFF IoT Connection** — IoT sensors, agriculture via bff-iot (port 4007)
4. **Temporal Workflows** — Multi-step process orchestration

### Phase 6: SDUI & MULTI-SURFACE
1. **SDUI Protocol Integration** — Render server-driven UI from CMS blocks
2. **Capability Negotiation** — Adapt UI for phone/tablet/TV/watch/car
3. **Experience Composer** — Dynamic layout composition
4. **All remaining 100+ artifacts** — Domain verticals
5. **Migration to `apps/superapp`** — Move codebase into CMS monorepo

### Phase 7: NATIVE PLATFORM FEATURES
1. **Biometric Auth** — FaceID/TouchID
2. **NFC/QR Scanner** — Passes, tickets, payments
3. **Apple/Google Pay** — Native payment methods
4. **Geofencing** — Location-based city triggers
5. **Widgets** — Home screen widgets
6. **Accessibility** — Full VoiceOver/TalkBack support
7. **Expo OTA Updates** — Over-the-air deployments
