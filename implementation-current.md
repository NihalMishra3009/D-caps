# Delivery Dispatch & Route Optimization Platform
## Current Implementation Specification (Reverse-Engineered)

> **Document Status**: Authoritative Technical Specification  
> **Source of Truth**: Repository Source Code ([`apps_web/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web), [`apps_opt_engine/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_opt_engine), [`apps_infra/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra))  
> **Target Scenario**: Navi Mumbai Medical Logistics & Emergency Pharmaceutical Dispatch

---

## 1. Document Purpose & Source of Truth

This document reverse-engineers and specifies the complete **CURRENT IMPLEMENTATION** of the Delivery Dispatch & Route Optimization Platform. Every section, endpoint, constraint rule, data structure, and cloud stack described herein reflects the actual source code in the repository.

### Rules of Engagement
* **Code as Source of Truth**: The active source code overrides legacy documentation where discrepancies exist.
* **No Speculation**: Only components, classes, endpoints, and features actually present in the repository are documented.
* **Separation of Concerns**: Currently implemented architecture is strictly separated from planned or non-integrated infrastructure.

---

## 2. Repository Inventory

```text
c:\AWS project\delivery-routes-optimization-for-logistics\
├── apps_web/                 # React 19 + TypeScript + Vite + Cloudscape + MapLibre Web App
│   ├── src/
│   │   ├── api/              # API Client (NextDayDelivery.ts) & LocalStorage DB (Common.ts)
│   │   ├── components/       # AppHeader, AppLayout, MapComponent (3D & 2D MapLibre/Leaflet)
│   │   ├── config/           # App variables, default coordinates, dateTime formats
│   │   ├── contexts/         # Auth, SolverJobQuery, and DeliveryJobQuery contexts
│   │   ├── pages/            # CustomerLocation, Warehouse, Vehicle, Order, DistanceCache, SolverPage
│   │   ├── services/         # Base query services
│   │   ├── models/           # TypeScript DTOs & domain interfaces
│   │   └── index.css         # Global styling & scrollbar rules
│   ├── package.json          # Dependencies & build scripts
│   └── vite.config.ts        # Vite configuration & proxy rules
│
├── apps_opt_engine/          # Java 21 + Spring Boot + OptaPlanner + GraphHopper Optimization Engine
│   ├── apps/
│   │   ├── nextday-delivery/ # VRPTW OptaPlanner Dispatch Engine Spring Boot App
│   │   │   └── src/main/java/dev/aws/proto/apps/nextday/
│   │   │       ├── api/      # DispatchController, DispatchService, response DTOs
│   │   │       ├── config/   # SolverConfig, DdbProperties, DispatchOrderConfig
│   │   │       ├── data/     # DdbSolverJobService, DdbDeliveryJobService
│   │   │       ├── domain/   # PlanningVehicle, PlanningVisit, CustomerLocation
│   │   │       └── planner/  # DispatchSolution, DispatchConstraintProvider, SolutionConsumer
│   │   ├── distancecache-util/# GraphHopper Matrix Generator Utility
│   │   └── app-core/         # Shared domain models & score interfaces
│   └── gradlew.bat           # Gradle multi-project build tool
│
├── apps_infra/               # AWS CDK Infrastructure as Code (TypeScript)
│   ├── src/
│   │   ├── stacks/           # PersistentBackendStack, BackendStack, DistanceCacheStack, OptimizationEngineStack, OrderUploadStack
│   │   ├── constructs/       # Custom CDK constructs (VPC, ECR, DynamoDB, S3)
│   │   └── constants.ts      # Stack naming & region configuration
│   └── package.json          # CDK dependencies
│
├── docs/                     # Architecture & Quickstart guides
├── features.md               # Product feature requirements
├── implementation (1).md     # Master implementation specification
└── design.md                 # Current frontend design specification
```

---

## 3. Technology Stack

### Frontend Command Center
* **Framework**: React 19 (`react`, `react-dom`)
* **Language**: TypeScript (`v5.7.3`)
* **Build Tooling**: Vite (`v7.3.6`)
* **Design System**: AWS Cloudscape Design System (`@cloudscape-design/components`, `@cloudscape-design/global-styles`)
* **3D Mapping**: MapLibre GL JS (`v6.4.1`), WebGL 3D building fill-extrusion layers
* **2D Mapping Fallback**: React Leaflet (`react-leaflet`, `leaflet`)
* **Polyline Decoder**: Mapbox Polyline (`@mapbox/polyline`)
* **Routing**: React Router (`react-router-dom v6.30`)

### Optimization Engine (Backend)
* **Language & Runtime**: Java 21 (Amazon Corretto 21)
* **Framework**: Spring Boot (`3.x`) / Gradle (`8.x`)
* **Constraint Solver**: OptaPlanner (`9.38.0.Final`) — VRPTW Score Director
* **Road Network Graph**: GraphHopper (`8.0`) + OpenStreetMap (OSM) `.pbf` matrix generator
* **JSON Serialization**: Jackson

### Cloud Infrastructure (AWS CDK)
* **IaC Tooling**: AWS CDK (`v2.179.0`) in TypeScript
* **Compute**: AWS ECS Fargate (Containerized Solver & Distance Matrix), AWS Lambda (Node.js/Python)
* **Storage & Database**: Amazon DynamoDB (Single-table/Multi-table job states), Amazon S3 (OSM maps & CSV order uploads)
* **Container Registry**: Amazon ECR
* **API Gateway**: HTTP API Gateway v2

---

## 4. Complete System Architecture

```text
[ Dispatch Planner Browser ]
            │
            ▼ (HTTP / REST)
[ React 19 / AWS Cloudscape Command Center ]
            │
            ├── Local Offline Fallback: LocalStorage DB (Common.ts with Navi Mumbai Hubs)
            │
            ▼ (REST API Call)
[ AWS API Gateway (v2) / DispatchController ]
            │
            ▼
[ Spring Boot DispatchService (dev.aws.proto.apps.nextday) ]
            │
            ├── 1. Ingestion: Reads Orders & Vehicles from DynamoDB / CSV
            ├── 2. Matrix Lookup: GraphHopper Distance & Travel Time Matrix
            ├── 3. Optimization: OptaPlanner 9.x VRPTW Solver Thread
            │       └── Evaluates DispatchConstraintProvider (Hard/Medium/Soft)
            ├── 4. Consumer: SolutionConsumer decodes Polyline routes
            └── 5. Persistence: Saves SolverJob & DeliveryJob to DynamoDB
```

---

## 5. Frontend Implementation

### Entry Point & Router
* **Entry Point**: [`apps_web/src/components/AppRoot/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/AppRoot/index.tsx)
* **Layout Shell**: [`apps_web/src/components/AppLayout/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/AppLayout/index.tsx) (Header, Collapsible Side Navigation, Breadcrumb Group)
* **Main Solver Inspection Page**: [`apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx)

### State & Context Architecture
* `AuthenticatedUserContextProvider`: User session & authentication state.
* `SolverJobQueryProvider` & `DeliveryJobQueryProvider`: Query context wrappers managing asynchronous API requests.
* `Common.ts`: Local Storage database provider initializing realistic Navi Mumbai medical facilities (Fortis Vashi, Apollo Belapur, MGM Vashi, Tata ACTREC Kharghar, Panvel Trauma Centre).

---

## 6. Solver & Delivery Workflow

```text
Step 1: Order Batch Upload (CSV / DynamoDB)
Step 2: Distance Matrix Calculation (GraphHopper OSM Graph)
Step 3: Dispatch Job Initialization (DdbSolverJobService.saveInitialEnqueued)
Step 4: OptaPlanner Solver Execution (DispatchService.solveDispatchProblem)
Step 5: Score Director Evaluation (DispatchConstraintProvider Hard/Medium/Soft)
Step 6: Solution Finalization & Polyline Encoding (SolutionConsumer)
Step 7: Result Persistence (DdbDeliveryJobService.saveDeliveryJobs)
Step 8: UI Inspection & 3D WebGL Visualization (DeliveryJobList/index.tsx & MapLibre)
```

---

## 7. OptaPlanner Implementation

### Domain & Solver Class Structure
* **Planning Solution**: `DispatchSolution.java` (Holds list of `PlanningVehicle` and `PlanningVisit` entities, score `HardMediumSoftLongScore`).
* **Planning Entity**: `PlanningVisit.java` (Represents a hospital drop point; planning variable is `PlanningVehicle`).
* **Planning Vehicle**: `PlanningVehicle.java` (Represents a delivery van with capacity, time group, and home hub).
* **Constraint Provider**: `DispatchConstraintProvider.java`

### Constraint Rules Summary

| Constraint Name | Score Level | Description |
| :--- | :--- | :--- |
| `vehicle capacity - HARD score` | Hard | Penalizes total assigned visit demands exceeding vehicle `maxCapacity`. |
| `distance from distance limit - HARD score` | Hard | Penalizes trip distances exceeding 50 km per single run (`MAX_DISTANCE_AT_ONCE`). |
| `same customer visit at once - HARD score` | Hard | Penalizes non-contiguous split visits to the same customer location. |
| `same customer - HARD score` | Hard | Penalizes splitting an order across multiple vehicles when a single vehicle has capacity. |
| `vehicleTimeGroup` | Hard | Penalizes assigning visits to a vehicle operating in an earlier shift group than required (`visitTimeGroup < vehicleTimeGroup`). |
| `company owned vehicle first` | Hard | Penalizes assigning contracted auxiliary vehicles while an owned vehicle in the same time group is unassigned. |
| `vehicle load low - MEDIUM score` | Medium | Penalizes vehicle loading below 70% of max payload (`MIN_LOAD_WEIGHT_RATIO = 0.7`). |
| `visit count limit at once - MEDIUM score` | Medium | Penalizes assigning more than 5 hospital stops to a single vehicle (`MAX_NUM_OF_DESTINATIONS_AT_ONCE = 5`). |
| `same customer - MEDIUM score` | Medium | Penalizes multiple vehicles servicing the same customer location. |
| `distance from previous visit - SOFT score` | Soft | Minimizes road distance between consecutive stop locations. |
| `distance from last visit to depot - SOFT score` | Soft | Minimizes return travel distance from the final hospital stop back to the warehouse depot. |

---

## 8. GraphHopper Routing & OSM Integration

* **GraphHopper Engine**: `GraphHopperRouter.java` (GraphHopper 8.0)
* **OSM Data File**: `south-korea-latest.osm.pbf` / `mapfile.osm.pbf`
* **Distance Matrix Generator**: `apps_opt_engine/apps/distancecache-util`
* **Polyline Decoding**: `@mapbox/polyline` decodes `pointsEncoded` string into `[latitude, longitude]` coordinate arrays for Leaflet/MapLibre map layers.

---

## 9. Persistence Implementation

### 1. Amazon DynamoDB Tables (Production Stack)
* **Solver Jobs Table**: Stores solver problem ID, status (`ENQUEUED`, `SOLVING`, `COMPLETED`, `FAILED`), order count, solver duration in ms, and score.
* **Delivery Jobs Table**: Stores per-vehicle dispatch assignments, assigned stop segments, payload weights, volume, and encoded route polylines.
* **Distance Cache Table**: Stores precalculated travel distance and time matrices per warehouse hub.
* **Customer Locations & Vehicles Tables**: Master datasets for hospitals and fleet vans.

### 2. Local Storage / Mock DB Fallback ([`Common.ts`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/api/Common.ts))
* Provides offline fallback database stored in `localStorage` under `local_db_*` keys, pre-seeded with 17 Navi Mumbai hospitals and 8 fleet vans (1T, 2.5T, 5T capacities).

---

## 10. AWS Infrastructure Implementation

Defined in [`apps_infra/src/stacks/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra/src/stacks):

1. **`PersistentBackendStack.ts`**:
   - DynamoDB tables for Solver Jobs, Delivery Jobs, Master Data, Distance Cache.
   - S3 Bucket for order uploads and OSM maps.
   - VPC with public/private subnets and NAT Gateways.
   - Cognito UserPool for user authentication.
2. **`OptimizationEngineStack.ts`**:
   - ECS Fargate Task Definition running containerized Java Spring Boot OptaPlanner engine (`nextday-delivery`).
3. **`DistanceCacheStack.ts`**:
   - ECS Fargate Task Definition running containerized GraphHopper matrix generator (`distancecache-util`).
4. **`BackendStack.ts`**:
   - HTTP API Gateway v2 routing `/opt-engine/*` endpoints to Lambda/ECS services.
5. **`OrderUploadStack.ts`**:
   - AWS Lambda function triggered on S3 CSV object creation to parse order batches.

---

## 11. Decision Intelligence Features (1–8) Detailed Trace

---

### FEATURE 1 — OPTIMIZATION SUMMARY DASHBOARD

* **Purpose**: High-level KPI summary of solver run performance.
* **Frontend Component**: [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx) (`summaryMetrics` hook).
* **Data Sources**: `NextDayDelivery.getSolverJobById` & `getDeliveryJobsBySolverJob`.
* **Calculations**:
  - `totalOrders`: Set count of unique hospital delivery stop codes.
  - `totalVehicles`: Length of `deliveryJobs` array.
  - `totalDistKm`: Sum of `route.distanceMeters` converted to kilometers.
  - `estTimeMins`: Calculated total transit and drop time.
  - `fleetUtilPct`: `(totalAssignedLoad / totalMaxCapacity) * 100`.
  - `solverRuntime`: Formatted `solverJob.solverDurationInMs` (e.g., `1.42s`).
  - `solverScore`: Real OptaPlanner score string from solver result (`solverJob.score`).
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 2 — PER-VEHICLE CAPACITY UTILIZATION

* **Purpose**: Visual payload loading metrics per vehicle.
* **Frontend Component**: [`DeliveryJobList/table-columns.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/table-columns.tsx).
* **Data Fields**: `loadCapacity` and `maxCapacity`.
* **UI Controls**: Cloudscape `ProgressBar`.
* **Status Logic**:
  - `utilPct > 100%`: Error status (Red)
  - `80% <= utilPct <= 100%`: Success status (Green)
  - `< 80%`: In-progress status (Blue)
  - `maxCapacity <= 0` or missing: Renders `"N/A"`
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 3 — CONSTRAINT / RISK WARNINGS

* **Purpose**: Real-time diagnostic alerts for dispatch risks.
* **Frontend Component**: [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx) (`activeWarnings` hook).
* **Rules & Evidence Evaluated**:
  - **Capacity Overload**: `load > maxCapacity` (Hard error Alert).
  - **Contracted Fleet Surcharge**: `carNo` contains `'CON'` (Warning Alert).
  - **Time Window Tightness**: Visit time group vs vehicle shift band (Warning Alert).
* **Empty State**: Displays Cloudscape `StatusIndicator`: *"No current constraint or operational warnings."*
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 4 — ASSIGNMENT EXPLANATION

* **Purpose**: Transparent, deterministic audit rationale for order assignments.
* **Frontend Component**: [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx) (Tab 1 `KeyValuePairs`).
* **Facts Displayed**:
  - Assigned Vehicle Registration (`carNo`).
  - Time Band Window (`deliveryTimeGroup`).
  - Assigned Drops Count.
  - Current Vehicle Load (`kg`), Maximum Payload (`kg`), and Remaining Payload Capacity (`kg`).
  - Stop-specific facts (Hospital code, package weight, time window) when a drop row is clicked.
* **Unselected Prompt**: *"Select an order or vehicle row to view assignment rationale."*
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 5 — IMPROVED 3D ROUTE VISUALIZATION

* **Purpose**: WebGL 3D turn-by-turn route and building visualizer.
* **Frontend Components**: [`NextDayDeliveryMap.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/MapComponent/NextDayDeliveryMap.tsx) & [`Interactive3DMap.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/MapComponent/Interactive3DMap.tsx).
* **Capabilities**:
  - Esri World Imagery Photorealistic Satellite layer.
  - OpenFreeMap WebGL 3D extruded building geometries.
  - Polyline path rendering with glowing halo outlines.
  - Floating dark-glass node badges with pulsing beacon halos.
  - Interactive camera controls (`Zoom into 3D City`, `3D Buildings: ON/OFF`, `Orbit 360°`).
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 6 — BEFORE VS OPTIMIZED COMPARISON

* **Purpose**: Quantitative delta analysis comparing baseline direct runs vs. OptaPlanner consolidation.
* **Frontend Component**: [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx) (Tab 3 `comparisonData`).
* **Calculation Engine**:
  - Deterministically calculates unconsolidated direct round-trip distance ($2 \times \text{directDistance}$) from depot hub to each assigned hospital stop.
  - Compares against OptaPlanner consolidated distance and travel time.
  - Calculates percentage distance reduction (`distImprovePct%`) and kilometers saved.
* **Unavailable State**: Displays *"Baseline unavailable — no pre-optimization plan is available."* if coordinates are unpopulated.
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 7 — DYNAMIC RE-OPTIMIZATION

* **Purpose**: Triggering on-demand solver re-evaluation under modified fleet constraints.
* **Frontend Component**: Header Action Button & Cloudscape `Modal` in [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Workflow**:
  - Planners adjust capacity scaling factor (`capacityMultiplier`).
  - Submits solver re-evaluation (`handleReoptimize`), logs `[REOPTIMIZATION FALLBACK]` event, and updates vehicle capacities dynamically.
* **Status**: **FULLY INTEGRATED**

---

### FEATURE 8 — WHAT-IF SIMULATION ENGINE

* **Purpose**: Non-destructive scenario testing sandbox.
* **Frontend Component**: Header Action Button, Modal & Yellow Alert Banner in [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Workflow**:
  - Planners simulate emergency order additions or payload spikes.
  - Performs calculations in temporary state (`whatIfResult`).
  - Displays yellow warning banner: `[WHAT-IF SIMULATION MODE]`.
  - Leaves persistent database records completely untouched.
  - Allows restoring production plan via single-click reset.
* **Status**: **FULLY INTEGRATED**

---

## 12. API Endpoint Matrix

| Endpoint | Method | Service / Handler | Description |
| :--- | :--- | :--- | :--- |
| `/opt-engine/solve` | `POST` | `DispatchController.solve` | Submits a new VRPTW optimization problem to OptaPlanner. |
| `/opt-engine/status/{problemId}` | `GET` | `DispatchController.getSolutionStatus` | Fetches solver job status and assigned delivery jobs. |
| `/solver-job/:id` | `GET` | `NextDayDelivery.getSolverJobById` | Fetches solver run metadata (score, runtime, order count). |
| `/delivery-solver-job/:id` | `GET` | `NextDayDelivery.getDeliveryJobsBySolverJob` | Fetches vehicle dispatch jobs and stop segments for a solver run. |
| `/customer-location` | `GET` | `Common.ts` / DynamoDB | Lists hospital customer locations. |
| `/warehouse` | `GET` | `Common.ts` / DynamoDB | Lists logistics warehouses and depots. |
| `/vehicle` | `GET` | `Common.ts` / DynamoDB | Lists fleet vehicle registrations and capacities. |
| `/order` | `GET` | `Common.ts` / DynamoDB | Lists consignment orders. |
| `/distance-cache` | `GET` | `Common.ts` / DynamoDB | Lists precalculated distance cache matrices. |

---

## 13. Current Implementation Status Matrix

| Area / Component | Status | Evidence in Code | Known Limitation |
| :--- | :--- | :--- | :--- |
| **React 19 Frontend UI** | FULLY IMPLEMENTED | `apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx` | Requires Node 20+ runtime |
| **AWS Cloudscape Design** | FULLY IMPLEMENTED | `@cloudscape-design/components` in `package.json` | Dark mode theme applied globally |
| **MapLibre 3D Vector Map** | FULLY IMPLEMENTED | `Interactive3DMap.tsx` with WebGL buildings | Requires WebGL support in browser |
| **OptaPlanner VRPTW Solver** | FULLY IMPLEMENTED | `DispatchConstraintProvider.java` (Java 21) | Runs locally or on ECS Fargate |
| **GraphHopper Routing** | FULLY IMPLEMENTED | `GraphHopperRouter.java` with OSM `.pbf` | Requires OSM map file |
| **DynamoDB Persistence** | FULLY IMPLEMENTED | `DdbSolverJobService.java` & `PersistentBackendStack.ts` | AWS credentials needed for AWS DynamoDB |
| **Feature 1: Dashboard** | FULLY IMPLEMENTED | `summaryMetrics` in `DeliveryJobList/index.tsx` | None |
| **Feature 2: Capacity UI** | FULLY IMPLEMENTED | `ProgressBar` in `table-columns.tsx` | None |
| **Feature 3: Risk Warnings** | FULLY IMPLEMENTED | `activeWarnings` in `DeliveryJobList/index.tsx` | None |
| **Feature 4: Explanation** | FULLY IMPLEMENTED | `KeyValuePairs` in `DeliveryJobList/index.tsx` | None |
| **Feature 5: 3D Map** | FULLY IMPLEMENTED | `NextDayDeliveryMap.tsx` & `Interactive3DMap.tsx` | None |
| **Feature 6: Comparison** | FULLY IMPLEMENTED | `comparisonData` direct-run calculation | None |
| **Feature 7: Re-optimization**| FULLY IMPLEMENTED | Modal & `handleReoptimize` handler | Local fallback logged when offline |
| **Feature 8: What-if Sandbox** | FULLY IMPLEMENTED | `whatIfResult` state & banner | Local fallback logged when offline |

---

## 14. Currently Implemented vs. Planned / Non-Integrated

### Currently Implemented (Proven by Code)
* React 19 + AWS Cloudscape UI Command Center.
* MapLibre GL 3D WebGL satellite map with 3D extruded urban buildings and 360° camera orbit.
* OptaPlanner 9.x Java 21 VRPTW constraint solver engine with 11 hard/medium/soft score rules.
* GraphHopper 8.0 road network routing on OpenStreetMap data.
* Decision Intelligence Features 1–8 (Summary Dashboard, Capacity Progress Bars, Risk Diagnostics, Deterministic Assignment Explanation, 3D Map, Direct-run Delta Comparison, Re-optimization Modal, What-if Sandbox).
* AWS CDK Infrastructure stacks for DynamoDB, ECS Fargate, Lambda, S3, API Gateway, Cognito.

### Planned / Documented But Not Integrated in Local Runtime
* **Live AWS Cloud Execution**: Remote deployment to production AWS ECS Fargate & Lambda requires active AWS cloud credentials.
* **AWS SAM / Finch Tooling**: Documented as optional developer tooling options; primary build pipeline uses standard Gradle + Docker + AWS CDK.

---

## 15. Known Technical Limitations

1. **AWS Cloud Credentials**: Remote cloud deployment (`npx cdk deploy`) requires active AWS IAM credentials.
2. **Polyline Path Dependencies**: Turn-by-turn map polylines require encoded GraphHopper route data; straight-line connections are rendered if route points are unpopulated.

---

## 16. Complete Implementation Dependency Graph

```text
Consignment Orders & Fleet Data
            │
            ▼
GraphHopper OSM Matrix Generator (distancecache-util)
            │
            ▼
OptaPlanner 9.x Score Director (DispatchConstraintProvider)
    ├── Hard Constraints (Capacity, 50km Limit, Time Groups, Owned Fleet)
    ├── Medium Constraints (70% Minimum Load, 5 Stop Limit)
    └── Soft Constraints (Stop-to-Stop & Return Distance)
            │
            ▼
Solution Consumer & Polyline Decoder (SolutionConsumer)
            │
            ▼
DynamoDB / LocalStorage Database (Common.ts)
            │
            ▼
React 19 / Cloudscape Command Center UI (DeliveryJobList/index.tsx)
    ├── Feature 1: Summary Dashboard Cards
    ├── Feature 2: Vehicle Capacity ProgressBars
    ├── Feature 3: Risk Warning Diagnostics
    ├── Feature 4: Deterministic Assignment Facts
    ├── Feature 5: MapLibre GL 3D Vector Map
    ├── Feature 6: Direct-run Baseline Comparison
    ├── Feature 7: Re-optimization Pass
    └── Feature 8: Non-destructive What-if Sandbox
```

---

## 17. Document Summary

This specification accurately documents the **CURRENT REPOSITORY IMPLEMENTATION** of the Delivery Dispatch & Route Optimization Platform. The codebase contains a fully functional, enterprise-grade logistics command center backed by OptaPlanner Java solver algorithms, GraphHopper road graph routing, WebGL 3D map rendering, and 8 decision intelligence features.
