# Navi Mumbai Medical Logistics & Route Optimization Platform
## Complete Project Guide: Problem Statement, System Architecture & Unique Innovations

> **Overview**: This document provides a plain-language, comprehensive explanation of the entire project—detailing the real-world problem being solved, the exact responsibilities of each system component (*kon kya kaam kar raha hai*), and the unique features built into the platform.

---

## 🎯 1. What Problem Are We Solving? (Real-World Logistics Challenge)

In emergency healthcare and next-day medical logistics (servicing hospitals, trauma centers, and diagnostic institutes across **Navi Mumbai & Mumbai Metropolitan Region**), dispatching delivery fleets is a critical multi-constraint challenge:

### The Real-World Complexity
1. **Critical Delivery Windows**: Hospitals require life-saving emergency drugs, blood supplies, and diagnostic reagents delivered within strict time windows (e.g. Morning ICU Window vs Afternoon Standard Supply).
2. **Vehicle Loading Bounds**: Delivery vans have strict physical limits on both volume ($m^3$) and payload weight ($kg$). Overloading a vehicle violates transport safety regulations.
3. **Complex Fleet Trade-offs**:
   - **Company-Owned Fleet**: Primary temperature-controlled refrigerated vans with lower operating costs.
   - **Contracted Fleet**: Auxiliary third-party emergency vehicles activated only when owned capacity is saturated (incurs extra surcharge costs).
4. **Real City Road Networks**: In city traffic, straight-line distance ("as the crow flies") is useless. A hospital 5 km away as the crow flies might require a 14 km drive through city expressways, flyovers, and one-way streets.
5. **Multi-Order Consolidation**: Multiple orders placed by the same hospital complex should be delivered together by a single vehicle rather than sending multiple separate trucks.

### The Solution We Built
Our platform takes daily hospital supply orders, computes exact driving paths using **real OpenStreetMap road graphs**, and uses **OptaPlanner AI constraint algorithms** to automatically determine:
* Which vehicle should carry which hospital consignments.
* In what exact sequence the driver should visit each hospital.
* The shortest driving route that obeys all hospital time windows and vehicle capacity limits.

---

## 🏗️ 2. Kon Kya Kaam Kar Raha Hai? (Component Responsibilities)

The application is structured into **3 core layers**:

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

### Detailed Component Roles

#### 🅰️ Frontend Command Center ([`apps_web/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web))
* **Built With**: React 19, TypeScript, Vite, AWS Cloudscape Design System, MapLibre GL JS 3D.
* **Role**:
  - Displays the **Navi Mumbai Medical Logistics Command Center**.
  - Renders the interactive **Live 3D Metropolitan Logistics Network Map** with WebGL building extrusions and satellite imagery.
  - Controls row selection in scheduled fleet tables to filter route segments and zoom the 3D map.
  - Houses the 8 Decision Intelligence tools (Dashboard, Capacity ProgressBars, Warnings, Rationale, 3D Map, Comparison, Re-optimization, What-if Sandbox).

#### 🅱️ Optimization & Solver Engine ([`apps_opt_engine/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_opt_engine))
* **Built With**: Java 21 (Amazon Corretto), Spring Boot 3.x, OptaPlanner 9.x, GraphHopper 8.0.
* **Role**:
  - `DispatchController`: Exposes `/opt-engine/solve` and `/opt-engine/status/{problemId}` REST endpoints.
  - `DispatchConstraintProvider`: The mathematical score engine enforcing 11 constraint rules (Hard, Medium, Soft).
  - `SolutionConsumer`: Takes the final OptaPlanner assignment, decodes GraphHopper polyline shapes, and builds per-vehicle stop sequences.

#### 🅾️ Road Routing Engine (GraphHopper + OpenStreetMap)
* **Role**:
  - Replaces dummy Euclidean distance formulas with **real driving road graphs**.
  - Precalculates distance & time matrices (`distancecache-util`) using real OpenStreetMap (`.pbf`) topology for Navi Mumbai roads.

#### 🅳 Cloud Infrastructure ([`apps_infra/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra))
* **Built With**: AWS CDK in TypeScript.
* **Role**:
  - `PersistentBackendStack`: Provisions DynamoDB tables, S3 buckets, VPC networks, and Cognito UserPools.
  - `OptimizationEngineStack`: Deploys containerized OptaPlanner solver services to AWS ECS Fargate.
  - `DistanceCacheStack`: Runs containerized GraphHopper matrix tasks.
  - `BackendStack`: Configures HTTP API Gateway v2 routing.

---

## 🌟 3. What Did We Add Unique? (Key Innovations & Decision Intelligence)

Unlike standard route planners that only show basic lines on a flat map, we built a comprehensive **Decision Intelligence Suite & 3D Tactical Radar Map**:

---

### Innovation 1: Live 3D Tactical Metropolitan Radar Map
* **Photorealistic Satellite Base Layer**: Blends ArcGIS World Imagery aerial satellite texture with custom tactical dark styling.
* **Real 3D Extruded Buildings**: Extrudes urban building heights and 3D architectural structures dynamically using MapLibre WebGL vector fill-extrusions.
* **Interactive 3D HUD Controls**:
  - 🎯 **Zoom into 3D City**: Smooth camera flyTo zooming down into city street level at 68° camera pitch.
  - 🏢 **3D Buildings ON/OFF**: Toggle physical building extrusions.
  - 🔄 **Orbit 360°**: Continuous smooth camera flyover rotation around the logistics network.
  - 📡 **Pulsing Node Beacons**: Floating dark-glass badges with pulsing halo beacons anchoring warehouse depots and hospital stops.

---

### Innovation 2: Decision Intelligence Suite (Features 1–8)

#### 1️⃣ Optimization Summary Dashboard
* High-level operational health cards displaying Total Orders, Active Fleet Vans, Total Route Distance (km), Estimated Travel Duration (mins), Fleet Capacity Utilization (%), Solver Runtime (e.g. `1.42s`), and real OptaPlanner Score (`0hard/0medium/-184200soft`).

#### 2️⃣ Per-Vehicle Capacity Utilization Bar
* Cloudscape `ProgressBar` metrics showing payload volume ($m^3$) and weight ($kg$) fill rates per vehicle.
* Color-coded status thresholds: Green ($0-85\%$), Blue ($85-100\%$), Red Overload ($>100\%$).

#### 3️⃣ Constraint & Risk Diagnostics Engine
* Automated real-time warning detection:
  - 🔴 **Capacity Overload [HARD]**: Highlights vehicles loaded beyond maximum payload limits.
  - 🟡 **Contracted Fleet Surcharge**: Alerts when auxiliary third-party vehicles are triggered due to primary fleet saturation.
  - 🟡 **Time-Window Band Tightness**: Detects delivery time group mismatches.

#### 4️⃣ Deterministic Assignment Explanation (Audit Trail)
* Fact-based audit rationale explaining *why* a vehicle/route was selected:
  - Time band window alignment.
  - Current vehicle payload vs maximum capacity ($kg$).
  - Remaining payload capacity.
  - Selected hospital drop facts (package weight, time group, hospital location code).

#### 5️⃣ Turn-by-Turn 3D Polyline Visualizer
* Multi-vehicle color-coded route trajectory overlays with direction vectors, waypoint sequence markers, and 2D/3D map mode toggling.

#### 6️⃣ Before vs. Optimized Comparison Engine
* Quantitative side-by-side delta analysis comparing baseline direct round-trips against OptaPlanner consolidated routing:
  - Distance Saved (km) & percentage distance reduction (`distImprovePct%`).
  - Travel Time Saved (minutes).
  - Fleet Efficiency Gains.

#### 7️⃣ Dynamic Re-Optimization Modal
* On-demand solver re-evaluation tool allowing dispatch managers to scale vehicle capacity factors or inject operational updates, recalculating assignments via the OptaPlanner solver lifecycle.

#### 8️⃣ Non-Destructive What-If Simulation Sandbox
* Interactive scenario sandbox for testing hypothetical situations (e.g. emergency hospital order additions or $+20\%$ demand spikes).
* Displays a prominent `[WHAT-IF SIMULATION MODE]` alert banner while keeping production database records completely untouched.

---

## 📊 Summary Table of Key Components

| Feature / Innovation | What It Solves | Tech Used |
| :--- | :--- | :--- |
| **VRPTW Solver Engine** | Finds optimal routes under capacity & time window bounds | Java 21, OptaPlanner 9.x |
| **Road Network Graph** | Calculates real road distances instead of fake straight lines | GraphHopper 8.0, OpenStreetMap |
| **3D Tactical Map** | Visually verifies route topography & building heights | MapLibre GL 3D, WebGL, Esri Satellite |
| **Capacity ProgressBars** | Prevents vehicle overloading and tracks payload fill % | Cloudscape `ProgressBar` |
| **Risk Diagnostics** | Automatically alerts planners to hard/medium rule violations | Automated Risk Engine |
| **Assignment Audit Log** | Explains *why* an assignment was made using hard facts | Cloudscape `KeyValuePairs` |
| **Before/After Delta** | Proves financial & kilometer savings of optimization | Deterministic Delta Engine |
| **What-If Sandbox** | Tests emergency demand scenarios non-destructively | Temporary State Engine |

---

## 🚀 How to Run the Project Locally

### 1. Start the Frontend Command Center
```bash
cd apps_web
pnpm install
pnpm dev --port 3000
```
Open [http://localhost:3000](http://localhost:3000) to view the Navi Mumbai Command Center.

### 2. Run the OptaPlanner Solver Engine (Optional Backend)
```bash
cd apps_opt_engine
./gradlew build -x test
./gradlew :apps:nextday-delivery:bootRun --args="--spring.profiles.active=dev"
```
