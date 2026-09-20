# Navi Mumbai Emergency Medical Supply Delivery & Route Optimization Platform

![Navi Mumbai Medical Logistics Command Center](./docs/imgs/demo_screenshot.png)

## Overview

In critical medical logistics and next-day pharmaceutical delivery, deciding **which vehicle should carry each consignment, in what sequence, and along exact road network paths** is a high-stakes multi-objective Optimization Problem. Dispatch operations must strictly enforce hard business constraints — vehicle volume/weight capacities, hospital delivery time windows, and priority tiers — while minimizing total route distances, travel durations, and fleet operating costs.

This project delivers an enterprise-grade **Medical Logistics Command Center & Route Optimization Platform** specifically tailored for **Navi Mumbai & Mumbai Metropolitan Region**.

> 📌 **Complete Guides & Architectural Documentation**:
> * **[PROJECT_EXPLAINER.md](./PROJECT_EXPLAINER.md)** — Comprehensive plain-language guide detailing the real-world problem being solved, component breakdown (*kon kya kaam kar raha hai*), and unique 3D/decision-intelligence innovations.
> * **[implementation-current.md](./implementation-current.md)** — Reverse-engineered technical architecture reference covering OptaPlanner constraints, GraphHopper road matrix cache, REST endpoints, and DynamoDB schema.
> * **[design.md](./design.md)** — Complete frontend design specification describing the Cloudscape design system, MapLibre 3D WebGL integration, and UI states.

---

## 🎯 What Problem Are We Solving?

In emergency healthcare delivery (servicing 17 hospitals, trauma centers, and diagnostic clinics across Navi Mumbai):
1. **Critical Delivery Windows**: Hospitals require life-saving emergency drugs, blood supplies, and diagnostic reagents delivered within strict time windows (Morning ICU vs Afternoon Standard Supply).
2. **Vehicle Loading Bounds**: Delivery vans have strict physical limits on both volume ($m^3$) and payload weight ($kg$). Overloading a vehicle violates transport safety regulations.
3. **Complex Fleet Trade-offs**:
   * **Company-Owned Fleet**: Primary temperature-controlled refrigerated vans with lower operating costs.
   * **Contracted Fleet**: Auxiliary third-party emergency vehicles activated only when owned capacity is saturated (incurs extra surcharge costs).
4. **Real City Road Networks**: In city traffic, straight-line distance ("as the crow flies") is useless. A hospital 5 km away as the crow flies might require a 14 km drive through city expressways, flyovers, and one-way streets.
5. **Multi-Order Consolidation**: Multiple orders placed by the same hospital complex should be delivered together by a single vehicle rather than sending multiple separate trucks.

Our platform takes daily hospital supply orders, computes exact driving paths using **real OpenStreetMap road graphs**, and uses **OptaPlanner AI constraint algorithms** to automatically determine vehicle assignments and stop sequences.

---

## 🏗️ System Architecture & Component Breakdown

The application is divided into three core layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      1. FRONTEND COMMAND CENTER                        │
│                React 19 + AWS Cloudscape + MapLibre GL 3D              │
│                                                                        │
│  - User Interface for Dispatchers                                      │
│  - Live 3D Tactical Radar Map (3D Buildings, Satellite Imagery)        │
│  - 8 Decision Intelligence Features                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (REST API Requests)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   2. OPTIMIZATION & ROUTING ENGINE                     │
│           Java 21 + Spring Boot + OptaPlanner + GraphHopper            │
│                                                                        │
│  - DispatchController & DispatchService: Ingests orders & jobs        │
│  - OptaPlanner 9.x: Solves VRPTW math constraints                      │
│  - GraphHopper 8.0: Calculates exact OSM road driving matrices         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Persistence & Storage)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     3. AWS CLOUD INFRASTRUCTURE                        │
│                         AWS CDK (TypeScript)                           │
│                                                                        │
│  - ECS Fargate: Containerized OptaPlanner & GraphHopper Services      │
│  - DynamoDB: High-speed storage for Solver Jobs & Delivery Jobs        │
│  - API Gateway: Secure HTTP routing to backend containers              │
│  - S3: OSM map data & CSV batch order storage                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Roles
* **Frontend Command Center ([`apps_web/`](./apps_web))**: Built with React 19, TypeScript, Vite, AWS Cloudscape Design System, and MapLibre GL JS 3D.
* **Optimization Engine ([`apps_opt_engine/`](./apps_opt_engine))**: Java 21, Spring Boot 3.x, OptaPlanner 9.x (enforcing 11 score constraints), and GraphHopper 8.0 OSM routing engine.
* **Cloud Infrastructure ([`apps_infra/`](./apps_infra))**: AWS CDK in TypeScript provisioning ECS Fargate containers, DynamoDB, S3, API Gateway v2, and Cognito.

---

## 🌟 Unique Features & Innovations

### 1. Live 3D Tactical Metropolitan Radar Map
* **Photorealistic Satellite Imagery**: ArcGIS World Imagery base layer combined with custom dark tactical styling.
* **3D Building Extrusions**: Dynamic WebGL building heights and architectural structures.
* **Interactive HUD Controls**: Smooth 3D camera zoom (68° pitch), physical building toggle, 360° continuous camera orbit, and pulsing halo beacons anchoring hospital stops.

### 2. Decision Intelligence Suite (Features 1–8)

| Feature | Description | UI Component |
| :--- | :--- | :--- |
| **Feature 1: Summary Dashboard** | High-level KPIs including total route distance, active fleet count, capacity utilization %, and score penalty breakdown. | Header KPI Cards & Score Pill |
| **Feature 2: Capacity Utilization** | Visual payload breakdown ($m^3$ & $kg$) per vehicle with color-coded fill rate indicators ($0-85\%$ Green, $85-100\%$ Blue, $>100\%$ Red). | Cloudscape `ProgressBar` & Status Badges |
| **Feature 3: Constraint / Risk Warnings** | Real-time automated alerts for time-window tightness, hard capacity overloads, and contracted surcharge triggers. | Alert Box & Warning Badges |
| **Feature 4: Assignment Explanation** | Fact-based audit log explaining *why* an order was assigned to a specific vehicle based on time windows, depot proximity, and payload match. | Key-Value Audit Details & Fact List |
| **Feature 5: 3D Route Map** | Interactive 3D vector map with satellite imagery, WebGL 3D extruded buildings, waypoint sequence markers, and route polyline overlays. | MapLibre GL 3D Canvas with Custom Controls |
| **Feature 6: Delta Comparison** | Side-by-side quantitative metrics comparing baseline direct dispatch against OptaPlanner VRPTW optimization (distance saved %, travel time reduction %, fleet efficiency gain). | Side-by-Side Comparison Container & Delta Pills |
| **Feature 7: Re-optimization** | On-demand solver triggering to dynamically recalculate assignments when capacity factors or operational conditions change. | Re-optimize Action Modal & Solver Trigger |
| **Feature 8: What-if Simulation** | Sandbox mode allowing dispatch planners to test hypothetical scenarios (e.g., $+20\%$ demand spike) without mutating production database records. | Interactive Simulation Panel & Parameter Sliders |

---

## 🏥 Demo Dataset: Navi Mumbai Healthcare Outposts

The application comes pre-seeded with 17 key healthcare locations across Navi Mumbai:
* **Central Warehouse Hub**: Vashi Medical Logistics Depot / Belapur Central Warehouse.
* **Hospitals & Outposts**:
  * Panvel Advanced Trauma Care Centre
  * Seawoods Advanced Diagnostics Hub
  * Juinagar Community Healthcare Centre
  * Rabale Industrial Health Clinic
  * Metro Hospital & Emergency Centre, Vashi
  * Nerul Specialty Medical Centre
  * Sanpada Multi-Specialty Clinic
  * Airoli Critical Care Institute
  * Kharghar Diagnostic Lab
  * Kamothe Primary Health Centre
  * Kalamboli Emergency Supply Depot
  * Taloja Industrial Medical Centre
  * Belapur Sector 15 Healthcare Hub
  * Uran Coastal Health Outpost
  * Ulwe Community Medical Centre
  * Ghansoli Pharma Distribution Point

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **pnpm**: `v9.x` or higher
* **Java SDK**: OpenJDK 21
* **Gradle**: Included Gradle wrapper (`./gradlew`)

### 1. Web Application Setup
```bash
# Clone the repository
git clone https://github.com/NihalMishra3009/D-caps.git
cd D-caps

# Install web dependencies
cd apps_web
pnpm install

# Start the local development server
pnpm dev --port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the Command Center.

### 2. Optimization Engine Setup (Optional Backend)
```bash
cd apps_opt_engine

# Build the Java Spring Boot applications
./gradlew build -x test

# Run the Next-Day Delivery Solver service locally
./gradlew :apps:nextday-delivery:bootRun --args="--spring.profiles.active=dev"
```

### 3. AWS CDK Deployment
For full cloud deployment details, see the [Architecture Guide](./docs/architecture.md) and [`apps_infra/`](./apps_infra).

```bash
cd apps_infra
pnpm install
npx cdk deploy --all
```

---

## 📂 Repository Structure

```text
.
├── apps_opt_engine/       # Java 21 Optimization Engine (OptaPlanner + GraphHopper + Spring Boot)
│   ├── apps/
│   │   ├── nextday-delivery/    # VRPTW OptaPlanner Dispatch Engine Service
│   │   └── distancecache-util/  # GraphHopper Distance & Time Matrix Generator Utility
│   └── scripts/                  # Dockerfiles & setup scripts
├── apps_web/              # React 19 + TypeScript + AWS Cloudscape UI Application
│   ├── src/
│   │   ├── pages/SolverPage/     # Delivery Job Solver, Dashboard, 3D Map & Features 1-8
│   │   ├── components/           # Reusable UI components & MapLibre wrappers
│   │   └── services/             # API services & mock dispatch data providers
├── apps_infra/            # AWS CDK Infrastructure Stack (ECS Fargate, Lambda, S3, DynamoDB)
├── PROJECT_EXPLAINER.md   # Plain-language guide (Problem statement, kon kya kaam kar raha hai, unique innovations)
├── implementation-current.md # Reverse-engineered technical architecture specification
├── design.md              # Complete frontend design specification
├── docs/                  # Documentation, quickstart guides, and screenshots
└── README.md
```

---

## 📜 License

This sample project is licensed under the MIT-0 License. See the [`LICENSE`](./LICENSE) file for details.
