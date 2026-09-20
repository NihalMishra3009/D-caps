[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-f89820?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6db33f?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![OptaPlanner](https://img.shields.io/badge/OptaPlanner-10.2-e01563?logo=redhat&logoColor=white)](https://www.optaplanner.org/)
[![GraphHopper](https://img.shields.io/badge/GraphHopper-OSM%20Routing-2c3e50)](https://www.graphhopper.com/)
[![AWS CDK](https://img.shields.io/badge/AWS%20CDK-v2-ff9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/cdk/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT--0-green.svg)](./LICENSE)


# Navi Mumbai Emergency Medical Supply Delivery & Route Optimization Platform

![Navi Mumbai Medical Logistics Command Center](./docs/imgs/demo_screenshot.png)

## Overview

In critical medical logistics and next-day pharmaceutical delivery, deciding **which vehicle should carry each consignment, in what sequence, and along exact road network paths** is a high-stakes multi-objective Optimization Problem. Dispatch operations must strictly enforce hard business constraints — vehicle volume/weight capacities, hospital delivery time windows, and priority tiers — while minimizing total route distances, travel durations, and fleet operating costs.

This project delivers an enterprise-grade **Medical Logistics Command Center & Route Optimization Platform** specifically tailored for **Navi Mumbai & Mumbai Metropolitan Region**.

> **Complete Guides & Architectural Documentation**:
> * **[PROJECT_EXPLAINER.md](./PROJECT_EXPLAINER.md)** — Comprehensive plain-language guide detailing the real-world problem being solved, component breakdown (*kon kya kaam kar raha hai*), and unique 3D/decision-intelligence innovations.
> * **[implementation-current.md](./implementation-current.md)** — Reverse-engineered technical architecture reference covering OptaPlanner constraints, GraphHopper road matrix cache, REST endpoints, and DynamoDB schema.
> * **[design.md](./design.md)** — Complete frontend design specification describing the Cloudscape design system, MapLibre 3D WebGL integration, and UI states.


---

## What Problem Are We Solving?

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

## ️ System Architecture & Component Breakdown

The application is divided into three core layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│           1. FRONTEND COMMAND CENTER            │
│        React 19 + AWS Cloudscape + MapLibre GL 3D       │
│                                    │
│ - User Interface for Dispatchers                   │
│ - Live 3D Tactical Radar Map (3D Buildings, Satellite Imagery)    │
│ - Decision intelligence and operational planning tools                  │
└───────────────────────────────────┬────────────────────────────────────┘
                  │ (REST API Requests)
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│          2. OPTIMIZATION & ROUTING ENGINE           │
│      Java 21 + Spring Boot + OptaPlanner + GraphHopper      │
│                                    │
│ - DispatchController & DispatchService: Ingests orders & jobs    │
│ - OptaPlanner 9.x: Solves VRPTW math constraints           │
│ - GraphHopper 8.0: Calculates exact OSM road driving matrices     │
└───────────────────────────────────┬────────────────────────────────────┘
                  │ (Persistence & Storage)
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│           3. AWS CLOUD INFRASTRUCTURE            │
│             AWS CDK (TypeScript)              │
│                                    │
│ - ECS Fargate: Containerized OptaPlanner & GraphHopper Services   │
│ - DynamoDB: High-speed storage for Solver Jobs & Delivery Jobs    │
│ - API Gateway: Secure HTTP routing to backend containers       │
│ - S3: OSM map data & CSV batch order storage             │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Roles
* **Frontend Command Center ([`apps_web/`](./apps_web))**: Built with React 19, TypeScript, Vite, AWS Cloudscape Design System, and MapLibre GL JS 3D.
* **Optimization Engine ([`apps_opt_engine/`](./apps_opt_engine))**: Java 21, Spring Boot 3.x, OptaPlanner 9.x (enforcing 11 score constraints), and GraphHopper 8.0 OSM routing engine.
* **Cloud Infrastructure ([`apps_infra/`](./apps_infra))**: AWS CDK in TypeScript provisioning ECS Fargate containers, DynamoDB, S3, API Gateway v2, and Cognito.

---

## End-to-End Workflow

The platform follows this operational workflow:

1. Dispatcher opens the delivery command center.
2. Delivery orders and available vehicle information are loaded.
3. Orders contain operational requirements such as destination, delivery window, priority and payload requirements.
4. The optimization engine receives the delivery job.
5. GraphHopper uses OpenStreetMap road data to calculate realistic driving distances and travel times.
6. OptaPlanner evaluates vehicle assignments and delivery sequences against the configured constraints.
7. The solver balances hard operational constraints and optimization objectives to produce a delivery plan.
8. The resulting vehicle assignments, stop sequences, route information and solver metrics are returned to the application.
9. The frontend presents the result through the optimization dashboard, vehicle capacity indicators, warnings, explanations and the interactive map.
10. Dispatchers can compare the optimized result with a baseline, inspect assignment reasoning and evaluate operational risks.
11. When conditions change, the dispatcher can trigger re-optimization or run a non-destructive what-if scenario.
12. The dispatcher uses the resulting information to understand and operate the delivery plan.

## Operational Capabilities

### Medical Delivery Planning

The platform accepts daily medical supply orders and available fleet information and produces an optimized dispatch plan. Orders can represent emergency medicines, blood supplies, diagnostic reagents and other time-sensitive healthcare deliveries.

The planning process considers:
- Delivery locations
- Delivery time windows
- Vehicle volume and payload limits
- Customer or hospital priority
- Vehicle ownership and operating cost
- Depot proximity
- Multiple deliveries to the same healthcare location

The result is a vehicle assignment and delivery sequence that can be inspected by the dispatcher.

### Constraint and Risk Awareness

The optimization workflow makes important operational constraints visible to the dispatcher.

The system can identify situations such as:
- Tight delivery windows
- Capacity overload
- Priority delivery risk
- Use of contracted vehicles and associated operating cost
- Other conditions that affect the quality or feasibility of the delivery plan

This provides operational context around the solver result rather than presenting only a list of routes.

### Assignment Explainability

A delivery assignment can be inspected using the information available from the optimized plan.

The application presents decision context such as:
- Compatibility with the delivery time window
- Vehicle capacity
- Depot proximity
- Delivery priority
- Operational cost considerations

This helps dispatchers understand why a particular assignment was produced.

### Interactive Route Visualization

The command center provides a MapLibre GL-based 3D map for understanding the generated delivery plan geographically.

The visualization supports:
- Route polylines
- Delivery waypoints
- Stop sequence markers
- Multiple vehicle routes
- 3D building visualization
- Satellite and vector map presentation
- Interactive camera controls
- Route direction context

The map connects the optimization result to the actual metropolitan road environment.

### Optimization Comparison

When a valid baseline is available, the application can compare it with the optimized plan.

The comparison can show:
- Total route distance
- Travel time
- Fleet utilization
- Distance reduction
- Travel-time reduction
- Solver score

This makes the effect of optimization measurable instead of relying only on visual inspection.

### Dynamic Re-optimization

Delivery operations can change after an initial plan has been generated. Vehicle availability, capacity conditions or emergency requirements may require the dispatch plan to be recalculated.

The dispatcher can trigger another optimization cycle using the existing solver workflow so that the plan can adapt to changed operating conditions.

### What-If Planning

The platform also supports non-destructive scenario analysis.

A dispatcher can evaluate hypothetical situations such as:
- A demand increase
- A reduction in available fleet
- Additional travel-time or traffic delays
- Other operational changes

The purpose is to understand how the delivery plan responds to changing conditions without directly modifying production records.

---

## End-to-End Operational Workflow

1. The dispatcher opens the medical logistics command center.
2. Daily healthcare delivery orders and available vehicle information are loaded.
3. Each order is evaluated according to its destination, delivery window, priority and payload requirements.
4. The optimization engine receives the delivery job.
5. GraphHopper uses OpenStreetMap road data to calculate realistic road distances and travel times.
6. OptaPlanner evaluates vehicle assignments and delivery sequences against the configured constraints.
7. The solver produces an optimized dispatch plan.
8. The resulting assignments, stop sequences, route information and solver metrics are returned to the application.
9. The command center presents the plan through operational dashboards, capacity information, risk indicators, assignment explanations and the interactive map.
10. The dispatcher can inspect individual assignments and understand the operational reasoning behind them.
11. A valid baseline can be compared with the optimized plan to quantify the improvement.
12. If operating conditions change, the dispatcher can trigger re-optimization.
13. Hypothetical changes can be evaluated through non-destructive scenario analysis.
14. The resulting plan gives the dispatcher a practical view of how the fleet should execute the day's healthcare deliveries.

## Demo Dataset: Navi Mumbai Healthcare Outposts

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

## Quickstart & Local Setup

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

### 3. AWS Infrastructure

The project includes an AWS CDK infrastructure layer in [`apps_infra/`](./apps_infra).
It defines the cloud infrastructure used by the platform, including the networking,
compute, storage and API components.

For infrastructure details, see the [Architecture Guide](./docs/architecture.md).

```bash
cd apps_infra
pnpm install
npx cdk synth
```

> **Note:** AWS deployment is not required to run the core optimization workflow locally.
> The project can be developed and demonstrated using the frontend and optimization
> engine setup described above.

---

## Recent Changes

### Mumbai / Navi Mumbai Migration
- Migrated the routing configuration from the previous South Korea OSM extract to **Geofabrik's Western India (`western-zone-latest.osm.pbf`) extract** for Mumbai, Navi Mumbai and Maharashtra.
- Updated GraphHopper runtime configuration to use `western-zone-latest.osm.pbf`.
- Updated the optimization-engine Docker build configuration to package the Western India OSM data.
- Updated the local optimization-engine build script to use the Western India OSM source.

### Optimization & Frontend
- Added the **Optimization Summary Dashboard** with delivery, fleet, distance, travel-time, utilization and solver metrics.
- Added **per-vehicle capacity utilization** indicators.
- Added constraint/risk warnings and assignment explanations.
- Added the **3D route visualization** using MapLibre GL.
- Added before-versus-optimized comparison, re-optimization and what-if simulation workflows.
- Documented the current frontend design and technical architecture.

### AWS Infrastructure
- Updated the CDK VPC configuration for `ap-south-1` using explicit Availability Zones.
- Preserved the existing ARM64 ECS/Fargate configuration.
- Updated infrastructure configuration to support the Mumbai/Navi Mumbai routing environment.

---

## Repository Structure

```text
.
├── apps_opt_engine/    # Java 21 Optimization Engine (OptaPlanner + GraphHopper + Spring Boot)
│  ├── apps/
│  │  ├── nextday-delivery/  # VRPTW OptaPlanner Dispatch Engine Service
│  │  └── distancecache-util/ # GraphHopper Distance & Time Matrix Generator Utility
│  └── scripts/         # Dockerfiles & setup scripts
├── apps_web/       # React 19 + TypeScript + AWS Cloudscape UI Application
│  ├── src/
│  │  ├── pages/SolverPage/   # Delivery Job Solver, Dashboard, 3D Map & Capabilities 1-8
│  │  ├── components/      # Reusable UI components & MapLibre wrappers
│  │  └── services/       # API services & mock dispatch data providers
├── apps_infra/      # AWS CDK Infrastructure Stack (ECS Fargate, Lambda, S3, DynamoDB)
├── PROJECT_EXPLAINER.md  # Plain-language guide (Problem statement, kon kya kaam kar raha hai, unique innovations)
├── implementation-current.md # Reverse-engineered technical architecture specification
├── design.md       # Complete frontend design specification
├── docs/         # Documentation, quickstart guides, and screenshots
└── README.md
```

---

---

---

## Authors

- Shreya Awari – [Github](https://github.com/shreyaawari28)
- Sujal Patil – [Github](https://github.com/SujalPatil21)
- Tejas Halvankar – [Github](https://github.com/Tejas-H01)
- Nihal Mishra – [Github](https://github.com/NihalMishra3009)

## License

This sample project is licensed under the MIT-0 License. See the [`LICENSE`](./LICENSE) file for details.
