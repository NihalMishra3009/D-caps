# Navi Mumbai Medical Supply Delivery & Route Optimization Platform

![Navi Mumbai Medical Logistics Command Center](./docs/imgs/demo_screenshot.png)

## Overview

In critical medical logistics and next-day pharmaceutical delivery, deciding **which vehicle should carry each consignment, in what sequence, and along exact road network paths** is a high-stakes multi-objective Optimization Problem. Dispatch operations must strictly enforce hard business constraints — vehicle volume/weight capacities, hospital delivery time windows, and priority tiers — while minimizing total route distances, travel durations, and fleet operating costs.

This project delivers an enterprise-grade **Medical Logistics Command Center & Route Optimization Platform** specifically tailored for **Navi Mumbai & Seoul Metropolitan regions**.

### Key Capabilities

* **Multi-Objective VRPTW Solver**: Solves Vehicle Routing Problems with Time Windows (VRPTW) using **[OptaPlanner](https://www.optaplanner.org/)** with hard, medium, and soft score constraints.
* **Real Road-Graph Routing**: Computes exact driving distances and matrix travel times via **[GraphHopper](https://www.graphhopper.com/)** running on OpenStreetMap (OSM) data.
* **Live 3D Tactical Radar Map**: Interactive 3D visualization built with **MapLibre GL JS**, featuring 3D extruded urban buildings, satellite radar modes, 360° camera orbit, custom location markers, and multi-vehicle color-coded route paths.
* **Advanced Decision Intelligence (Features 1–8)**:
  1. **Optimization Summary Dashboard**: High-level KPIs including total route distance, active fleet count, capacity utilization %, late delivery risks, and soft score penalty breakdowns.
  2. **Per-Vehicle Capacity Utilization**: Interactive visual metrics (`ProgressBar`) tracking volume (m³) and weight (kg) load vs maximum limit per vehicle, including overload warnings.
  3. **Constraint & Risk Warning Engine**: Real-time automated detection and visual alerting for time-window risks, capacity overloads, priority customer delays, and contracted vehicle surcharges.
  4. **Deterministic Assignment Explanation**: Transparent audit log explaining exactly *why* an order was assigned to a specific vehicle based on time windows, depot proximity, capacity match, and ownership constraints.
  5. **3D Interactive Route Map**: Multi-vehicle route layer toggles, waypoint sequencing, direction vectors, satellite/tactical view modes, and focus-on-route camera controls.
  6. **Before vs. Optimized Comparison**: Quantitative side-by-side delta analysis comparing baseline sequential dispatch against OptaPlanner optimization (distance saved %, travel time reduction %, fleet efficiency gain).
  7. **Dynamic Solver Re-optimization**: Real-time solver re-evaluation handling mid-day disruptions such as vehicle breakdowns, urgent order injections, or road blocks.
  8. **What-if Simulation Engine**: Non-destructive scenario testing engine allowing dispatch planners to simulate fleet reductions, demand spikes, or traffic delays prior to executing dispatch jobs.

---

## Demo Scenario: Navi Mumbai Medical Logistics Network

The application comes pre-configured with a realistic **Navi Mumbai Emergency Medical Supply Dispatch** dataset servicing key healthcare infrastructure:

* **Central Warehouse Hub**: Vashi Medical Logistics Depot / Belapur Central Warehouse.
* **Healthcare Outposts & Hospitals**:
  * Panvel Advanced Trauma Care Centre
  * Seawoods Advanced Diagnostics Hub
  * Juinagar Community Healthcare Centre
  * Rabale Industrial Health Clinic
  * Metro Hospital & Emergency Centre, Vashi
  * Nerul Specialty Medical Centre
* **Fleet Mix**: Owned temperature-controlled refrigerated vans + auxiliary contracted emergency vehicles.
* **Constraints**:
  * Temperature-sensitive medicine delivery time windows.
  * Priority 1 (ICU/Emergency) vs Priority 2 (Standard Supply) ordering tiers.
  * Strict vehicle volume ($m^3$) and payload ($kg$) constraints.

---

## Decision Intelligence Suite (Features 1–8)

| Feature | Description | UI Component |
| :--- | :--- | :--- |
| **Feature 1: Summary Dashboard** | Aggregate metrics for total distance, travel time, active fleet, and score breakdown. | Header KPI Cards & Score Pill |
| **Feature 2: Capacity Utilization** | Visual payload breakdown ($m^3$ & $kg$) per vehicle with overload indicators. | Cloudscape `ProgressBar` & Status Badges |
| **Feature 3: Constraint / Risk Warnings** | Automated warnings for time window risks, overload alerts, and contracted surcharge costs. | Alert Box & Warning Badges |
| **Feature 4: Assignment Explanation** | Fact-based audit rationale explaining vehicle routing decisions. | Expandable Audit Details & Fact List |
| **Feature 5: 3D Route Map** | Interactive 3D vector map with satellite imagery, 3D buildings, and route paths. | MapLibre GL 3D Canvas with Custom Controls |
| **Feature 6: Delta Comparison** | Side-by-side metrics comparing Unoptimized Baseline vs OptaPlanner VRPTW. | Side-by-Side Comparison Container & Delta Pills |
| **Feature 7: Re-optimization** | On-demand solver triggering to dynamically recalculate modified constraints. | Re-optimize Action Modal & Solver Trigger |
| **Feature 8: What-if Simulation** | Sandbox mode to test hypotheticals without mutating actual dispatch jobs. | Interactive Simulation Panel & Parameter Sliders |

---

## Technology Stack

### Optimization & Backend Engine
* **Language & Framework**: Java 21, Spring Boot 3.x
* **Constraint Solver**: OptaPlanner 9.x (VRPTW Score Director)
* **Road Routing Engine**: GraphHopper 8.x + OpenStreetMap (OSM)
* **Build System**: Gradle 8.x (Multi-project build)

### Frontend Command Center
* **Framework**: React 19, TypeScript, Vite
* **Design System**: AWS Cloudscape Design System (`@cloudscape-design/components`)
* **3D Map Rendering**: MapLibre GL JS v3, WebGL 3D extruded layer plugins
* **Icons & Micro-interactions**: Lucide React, Canvas-Confetti

### Cloud Infrastructure (AWS)
* **Infrastructure as Code**: AWS CDK (TypeScript)
* **Compute**: AWS ECS Fargate (Containerized Solver & Distance Matrix Services), AWS Lambda
* **Storage & Database**: Amazon S3 (OSM maps & order datasets), Amazon DynamoDB (Distance matrix cache)
* **Container Registry**: Amazon ECR

---

## Repository Layout

```
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
├── docs/                  # Documentation, quickstart guides, and screenshots
└── README.md
```

---

## Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **pnpm**: `v9.x` or higher
* **Java SDK**: OpenJDK 21
* **Docker Desktop**: Required for local GraphHopper matrix generation and ECS local testing

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

### 2. Optimization Engine Setup
```bash
cd apps_opt_engine

# Build the Java Spring Boot applications
./gradlew build -x test

# Run the Next-Day Delivery Solver service locally
./gradlew :apps:nextday-delivery:bootRun --args="--spring.profiles.active=dev"
```

### 3. AWS CDK Deployment
For full cloud deployment details, see the [Quickstart Guide](./docs/quickstart.md) and [Architecture Guide](./docs/architecture.md).

```bash
cd apps_infra
pnpm install
npx cdk deploy --all
```

---

## Project Governance & Documentation

* [Quickstart Guide](./docs/quickstart.md) — Step-by-step installation, AWS credentials, and walkthrough.
* [Architecture Specification](./docs/architecture.md) — System architecture diagram, data flow, and OptaPlanner score rules.
* [`CHANGELOG.md`](./CHANGELOG.md) — Version history and release notes.
* [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Guidelines for reporting issues and submitting pull requests.
* [`LICENSE`](./LICENSE) — MIT-0 License.

---

## References & Acknowledgments

* Based on optimization architecture patterns from [AWS Last Mile Delivery Hyperlocal](https://github.com/aws-samples/aws-last-mile-delivery-hyperlocal).
* Powered by [OptaPlanner Constraint Solver](https://www.optaplanner.org/) and [GraphHopper Direction Engine](https://www.graphhopper.com/).

---

## License

This sample project is licensed under the MIT-0 License. See the [`LICENSE`](./LICENSE) file for details.

