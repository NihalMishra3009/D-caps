# Navi Mumbai Medical Logistics Command Center
## Current Frontend Design Document

> **Document Purpose**: This document provides an accurate, complete, and code-verified technical specification of the **CURRENT FRONTEND IMPLEMENTATION** for the Navi Mumbai Medical Supply Delivery & Route Optimization Platform. Every section, component, data flow, and visual description reflects the authoritative source code in [`apps_web/src/`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src).

---

### 1. Design Document Purpose

The purpose of this document is to serve as the definitive specification for the existing frontend design and implementation. It details the actual UI components, layout structures, visual themes, state management, MapLibre GL 3D integration, AWS Cloudscape Design System patterns, and Decision Intelligence Features 1–8 as implemented in the codebase.

---

### 2. Current Frontend Overview

The frontend is an enterprise-grade **Medical Logistics Command Center** designed for order dispatchers and fleet planners managing temperature-controlled pharmaceutical deliveries across Navi Mumbai & Seoul Metropolitan regions.

* **Primary Application Goal**: Visualize multi-objective Vehicle Routing Problems with Time Windows (VRPTW), inspect vehicle capacity loading, review decision explanations, render 3D turn-by-turn road trajectories, execute on-demand re-optimizations, and perform what-if scenario simulations.
* **UI Theme**: Dark-mode tactical command center built with AWS Cloudscape Design System, augmented with WebGL 3D MapLibre satellite radar visualization.

---

### 3. Technology & Design System

#### Core Stack
* **Framework**: React 19 (`react`, `react-dom`)
* **Language**: TypeScript (`v5.7`)
* **Build Tooling & Dev Server**: Vite (`v7.3`)
* **Routing**: React Router (`v6.30`) with nested route modules
* **Design System**: AWS Cloudscape Design System (`@cloudscape-design/components`, `@cloudscape-design/global-styles`)
* **3D Map Engine**: MapLibre GL JS (`v6.4`), WebGL 3D building fill-extrusion layers
* **2D Map Fallback**: React Leaflet (`react-leaflet`, `leaflet`)
* **Icons & Micro-interactions**: Lucide React (`lucide-react`), Canvas Confetti (`canvas-confetti`)
* **Polyline Processor**: Mapbox Polyline (`@mapbox/polyline`)

---

### 4. Application Architecture

```text
[Browser Navigation]
        ↓
   AppRoot (AuthenticatedUserContextProvider, BrowserRouter)
        ↓
   AppLayout (AppHeader, SideNavigation, BreadcrumbGroup, CSAppLayout)
        ↓
  Nested Routes (Outlet)
        ├── HomePage (Overview & 3D Radar)
        ├── CustomerLocationRouter (List & Details)
        ├── WarehouseRouter (List & Details)
        ├── VehicleRouter (List & Details)
        ├── OrderRouter (List & Details)
        ├── DistanceCacheRouter (List & Details)
        └── SolverPageRouter (SolverJobQueryProvider, DeliveryJobQueryProvider)
                 ├── SolverJobList (Historical Runs)
                 └── DeliveryJobList (Main Command Center & Features 1–8)
```

#### State Management & API Layer
* **Context Providers**: `AuthenticatedUserContextProvider`, `SolverJobQueryProvider`, `DeliveryJobQueryProvider`.
* **API Handlers**: `apps_web/src/api/Common.ts` (Mock/Local Storage DB handler with Navi Mumbai initial datasets) & `apps_web/src/api/NextDayDelivery.ts`.

---

### 5. Page & Route Structure

| Page Name | Route Path | Purpose | Key File |
| :--- | :--- | :--- | :--- |
| **Command Center Home** | `/` | Operational network summary & 3D radar preview | [`HomePage/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/HomePage/index.tsx) |
| **Customer Locations List** | `/customer-location` | Hospital & clinic destination registry | [`CustomerLocation/List/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/CustomerLocation/List/index.tsx) |
| **Customer Location Details**| `/customer-location/:id` | Individual healthcare facility record | [`CustomerLocation/Details/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/CustomerLocation/Details/index.tsx) |
| **Warehouses List** | `/warehouse` | Logistics hub & depot registry | [`Warehouse/List/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/Warehouse/List/index.tsx) |
| **Warehouse Details** | `/warehouse/:id` | Individual warehouse depot record | [`Warehouse/Details/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/Warehouse/Details/index.tsx) |
| **Vehicles Fleet List** | `/vehicle` | Fleet van registry & capacities | [`Vehicle/List/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/Vehicle/List/index.tsx) |
| **Vehicle Details** | `/vehicle/:id` | Individual vehicle specification | [`Vehicle/Details/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/Vehicle/Details/index.tsx) |
| **Consignment Orders List** | `/order` | Daily batch orders registry | [`Order/List/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/Order/List/index.tsx) |
| **Distance Cache List** | `/distance-cache` | GraphHopper road matrix status | [`DistanceCache/List/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/DistanceCache/List/index.tsx) |
| **Solver Runs List** | `/solver-job` | OptaPlanner dispatch runs history | [`SolverJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/SolverJobList/index.tsx) |
| **Dispatch Command Center** | `/solver-job/:solverJobId` | Main solver inspection UI (Features 1–8) | [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx) |

---

### 6. Main Command Center Layout

The main solver UI ([`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx)) uses a split two-column dashboard design:

1. **Header & Dashboard Banner**:
   - Cloudscape `Header` with action buttons (`Solver Runs`, `What-If Simulation`, `Re-Optimize Run`, `Refresh`).
   - Feature 1 Summary Dashboard (`Grid` with 7 metric boxes).
2. **Left Column (5 / 12 width)**:
   - Feature 2 Vehicle Table (`Table` with single selection, capacity utilization progress bars, overload badges, sorting).
3. **Right Column (7 / 12 width)**:
   - Interactive Cloudscape `Tabs`:
     - **Tab 1**: Feature 4 Assignment Explanation (`KeyValuePairs` for vehicle & drop rationale).
     - **Tab 2**: Feature 3 Constraint & Risk Diagnostics (`Alert` list for violations).
     - **Tab 3**: Feature 6 Before vs. Optimized Comparison (`Grid` comparing direct runs vs consolidated runs).
   - Assigned Hospital & Clinic Stops Table (`Table` for route stop sequence).
   - Feature 5 Interactive 3D Route Map (`NextDayDeliveryMap` with 3D/2D views).

---

### 7. Navigation & Header

* **AppHeader**: Top fixed bar displaying `"Navi Mumbai Medical Logistics Command Center"` and active user menu dropdown (`Local Admin`).
* **SideNavigation**: Left collapsable drawer categorized into:
  - **Overview & Command**: Overview link (`/`).
  - **Operations**: Customer Locations (`/customer-location`), Warehouses & Hubs (`/warehouse`), Vehicles Fleet (`/vehicle`), Consignment Orders (`/order`).
  - **Optimization Engine**: Distance Cache Matrix (`/distance-cache`), Solver & Dispatch Jobs (`/solver-job`).
* **BreadcrumbGroup**: Dynamic breadcrumbs tracking route hierarchy (e.g. `Home / Solver Jobs / job-mum-01`).

---

### 8. Optimization Summary Dashboard (Feature 1)

Located at the top of [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx):

* **Component Structure**: Cloudscape `Container` with a 7-column `Grid`.
* **Metrics Rendered**:
  1. **Total Orders**: Count of unique hospital delivery stops.
  2. **Fleet Vehicles**: Count of active dispatched vehicles.
  3. **Total Distance**: Total route distance in kilometers (`km`).
  4. **Est. Travel Time**: Estimated duration in minutes (`mins`).
  5. **Fleet Utilization**: Overall volume/weight fill percentage (`%`).
  6. **Solver Runtime**: Convergence duration extracted from `solverJob.solverDurationInMs` (e.g., `1.42s`).
  7. **OptaPlanner Score**: Solver score penalty string (e.g., `0hard/0medium/-184200soft`).

---

### 9. Delivery / Vehicle Table (Feature 2)

Located in [`DeliveryJobList/table-columns.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/table-columns.tsx):

* **Columns**:
  - `carNo` (Vehicle Reg No., styled blue text)
  - `deliveryTimeGroup` (Time Band, styled Cloudscape `Badge`)
  - `orderCount` (Assigned hospital drops count)
  - `loadCapacity` (Assigned load in `kg`)
  - `maxCapacity` (Max payload limit in `kg`)
  - `utilization` (Capacity Utilization `ProgressBar`)
  - `createdAt` (Formatted timestamp)
* **Table Features**: Single row selection, automatic selection state synchronization with map and tabs.

---

### 10. Capacity Utilization UI (Feature 2 Details)

* **Component**: Cloudscape `ProgressBar` inside `table-columns.tsx`.
* **Logic**:
  - `utilPct = Math.round((load / max) * 100)`
  - `barValue = Math.min(100, Math.max(0, utilPct))`
  - Status color rules:
    - `< 80%`: Status `in-progress` (Blue)
    - `80–100%`: Status `success` (Green)
    - `> 100%`: Status `error` (Red Overload)
  - Fallback: Returns `"N/A"` if capacity or load is missing, non-numeric, or zero.

---

### 11. Constraint & Risk Warnings (Feature 3)

* **Component**: Rendered inside Tab 2 of [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Data Sources & Rules**:
  - **Hard Capacity Overload**: Triggered when `load > maxCapacity`. Rendered as an `error` Alert.
  - **Contracted Fleet Surcharge**: Triggered when `carNo` contains `'CON'` or `isContracted` flag is set. Rendered as a `warning` Alert.
  - **Time-Window Band Tightness**: Triggered when hospital order `deliveryTimeGroup` exceeds vehicle band. Rendered as a `warning` Alert.
* **Empty State**: Displays Cloudscape `StatusIndicator` with type `success`: `"No current constraint or operational warnings."`

---

### 12. Assignment Explanation (Feature 4)

* **Component**: Rendered inside Tab 1 of [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Content**:
  - **Vehicle Rationale (`KeyValuePairs`)**: Assigned vehicle registration, time band window, assigned drops count, current vehicle load, maximum payload, and remaining payload capacity.
  - **Selected Drop Rationale (`KeyValuePairs`)**: Appears when a specific hospital stop row is selected in the stops sub-table. Displays hospital code, package weight (`kg`), and target time window.
* **Unselected State**: Displays `"Select an order or vehicle row to view assignment rationale."`

---

### 13. Route Visualization / Map (Feature 5)

* **Component**: [`NextDayDeliveryMap.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/MapComponent/NextDayDeliveryMap.tsx) & [`Interactive3DMap.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/components/MapComponent/Interactive3DMap.tsx).
* **Map Controls**:
  - **Mode Toggle**: Segmented control switching between `3D Tactical (Three.js & MapLibre)` and `2D OpenStreetMap`.
  - **3D HUD Buttons**: `Zoom into 3D City` (focus flyTo), `3D Buildings: ON/OFF` (toggle fill-extrusion), `Orbit 360°` (continuous camera rotation).
* **Layers**:
  - **Base Imagery**: Photorealistic Esri World Imagery Satellite tiles.
  - **3D Buildings**: OpenFreeMap vector building extrusions height-scaled dynamically.
  - **Route Lines**: Decoded Polyline GeoJSON paths rendered with glowing outline and primary line colors.
  - **Markers**: Floating dark-glass badges with pulsing beacon halos for warehouse hubs and customer stops.

---

### 14. Before vs Optimized Comparison (Feature 6)

* **Component**: Rendered inside Tab 3 of [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Calculation Engine**:
  - **Baseline (Unoptimized Direct Runs)**: Computed deterministically by summing round-trip distances ($2 \times \text{directDistance}$) from the depot to each assigned hospital location.
  - **Optimized (OptaPlanner Consolidated)**: Actual route distance and duration totals.
* **Metrics Rendered**:
  - Unoptimized distance (`km`), duration (`mins`), and required individual round-trips.
  - OptaPlanner distance (`km`), duration (`mins`), and consolidated multi-stop runs.
  - Percentage distance reduction badge (`distImprovePct%`) and total kilometers saved.
* **Unavailable State**: Displays `"Baseline unavailable — no pre-optimization plan is available."` if location coordinates are missing.

---

### 15. Re-optimization UI (Feature 7)

* **Component**: Action button in Header + Cloudscape `Modal` in [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Form Inputs**:
  - Fleet Capacity Scaling Factor (`Input`, default `'1.0'`).
* **Workflow**:
  1. User clicks `"Re-Optimize Run"`.
  2. Modal opens with scaling parameter input.
  3. User clicks `"Run Re-Optimization"`.
  4. Triggers re-optimization pass with loading spinner (`reoptimizeLoading`), updates vehicle capacities, and re-selects active job.
  5. Console logs explicit `[REOPTIMIZATION FALLBACK]` lifecycle event.

---

### 16. What-If Simulation UI (Feature 8)

* **Component**: Action button in Header + Cloudscape `Modal` + Top Warning Banner in [`DeliveryJobList/index.tsx`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_web/src/pages/SolverPage/DeliveryJobList/index.tsx).
* **Form Inputs**:
  - Simulated Hospital Order Name (`Input`, default `'Emergency Trauma Hub'`).
  - Emergency Consignment Weight in `kg` (`Input`, default `'850'`).
* **Non-Destructive Behavior**:
  - Performs calculations in temporary state (`whatIfResult`).
  - Displays prominent yellow warning banner: `[WHAT-IF SIMULATION MODE]`.
  - Production database state remains unchanged.
  - User can exit simulation mode via `"Restore Production Plan"` button.

---

### 17. User Interactions

1. **Row Selection**: Clicking a vehicle row in the scheduled fleet table filters the assigned stops table, highlights the vehicle route on the 3D map, and updates the Assignment Explanation facts.
2. **Tab Switching**: Clicking tabs switches between Assignment Explanation, Risk Warnings, and Before vs. Optimized Comparison without page reloads.
3. **Map Navigation**: Users can click markers on the 3D map to trigger camera flyTo animations and view node coordinate cards.
4. **Simulation Trigger**: Clicking What-If Simulation opens the sandbox modal; running a simulation updates the dashboard utilization metric temporarily.

---

### 18. Data Flow

```text
Backend REST / Mock Storage (Common.ts)
        ↓
NextDayDelivery API Client (getSolverJobById & getDeliveryJobsBySolverJob)
        ↓
React Component State (solverJob, deliveryJobs, selectedDeliveryJob)
        ↓
Derived Memoized Metrics (summaryMetrics, activeWarnings, comparisonData)
        ↓
Cloudscape UI & MapLibre 3D Canvas (Table, ProgressBar, Tabs, Interactive3DMap)
```

---

### 19. Component Inventory

| Component Name | Source File | Purpose | Parent Component | Data Sources |
| :--- | :--- | :--- | :--- | :--- |
| `AppRoot` | `src/components/AppRoot/index.tsx` | Root router & auth context wrapper | React DOM Root | Router config |
| `AppLayout` | `src/components/AppLayout/index.tsx` | Main shell layout & navigation | `AppRoot` | React Router `location` |
| `AppHeader` | `src/components/AppHeader/index.tsx` | Top navigation bar | `AppLayout` | Auth Context |
| `HomePage` | `src/pages/HomePage/index.tsx` | Overview dashboard & map radar | `AppLayout` | `Common.ts` API |
| `DeliveryJobList` | `src/pages/SolverPage/DeliveryJobList/index.tsx` | Main Command Center & Features 1–8 | `SolverPageRouter` | `NextDayDelivery.ts` API |
| `NextDayDeliveryMap`| `src/components/MapComponent/NextDayDeliveryMap.tsx` | Route map container with 3D/2D toggle | `DeliveryJobList` | `segments` & `route` props |
| `Interactive3DMap` | `src/components/MapComponent/Interactive3DMap.tsx` | WebGL 3D MapLibre satellite radar | `NextDayDeliveryMap` | `markers` & `polylines` props |

---

### 20. Visual Language

* **Color Palette (Dark Tactical Command Center)**:
  - Base Background: Deep Space Obsidian (`#02040a`, `#060b19`)
  - Card & Container Surface: Glassmorphic Navy (`rgba(10, 18, 36, 0.96)`)
  - Primary Accent: Cyan / Sky Blue (`#38bdf8`, `#0284c7`)
  - Success / Route Line: Emerald Green (`#34d399`, `#10b981`)
  - Warning / Band Accent: Amber / Gold (`#facc15`)
  - Overload / Hard Error: Crimson Red (`#ef4444`)
  - Contracted / Secondary Accent: Purple (`#c084fc`, `#a855f7`)

---

### 21. Typography

* **Font Family**: Inherited from AWS Cloudscape Design System (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
* **Monospace Numbers**: Used for numeric weights, distances, lat/long coordinates, and IDs (`fontFamily: 'monospace'`).
* **Headers**: Cloudscape `Header` variants (`h1`, `h2`, `h3`).

---

### 22. Layout & Spacing

* **Container Spacing**: Handled via Cloudscape `SpaceBetween` with sizes `'s'`, `'m'`, `'l'`.
* **Grid Grids**: Cloudscape `Grid` with responsive `colspan` definitions for 12-column layouts.
* **Padding**: Standardized spacing via Cloudscape design tokens (`padding={{ vertical: 'xs' }}`).

---

### 23. Responsive Behavior

* **Desktop & High-Res Monitors**: Full 2-column split view (5-col vehicle table / 7-col map & tabs).
* **Tablet / Small Screen Breakdown**: Cloudscape `Grid` automatically stacks columns vertically on smaller viewports (`colspan: { default: 12, l: 5 }`).

---

### 24. Loading / Empty / Error States

* **Loading States**: Table loading spinners (`loadingText='Loading scheduled fleet...'`), button loading flags (`loading={reoptimizeLoading}`).
* **Empty States**: Table empty props (`empty='No vehicles scheduled'`), tab fallback messages (`"Select an order or vehicle row to view assignment rationale."`).
* **Error States**: Alert boxes for capacity overloads and fallback indicators for missing data.

---

### 25. Accessibility

* Built on **AWS Cloudscape Design System**, which provides native ARIA roles, keyboard navigation support, high-contrast dark mode text ratios, and accessible form labels.

---

### 26. Current Frontend Limitations

1. **Remote Backend Credentials**: Live remote execution against AWS ECS Fargate requires active AWS credentials.
2. **Static Route Geometry Fallback**: Polyline decoding depends on GraphHopper output; straight-line fallbacks are used when route geometry is unpopulated.

---

### 27. Current File Structure

```text
apps_web/
├── package.json
├── vite.config.ts
├── src/
│   ├── api/
│   │   ├── Common.ts              # Mock/LocalStorage API & initial Navi Mumbai data
│   │   └── NextDayDelivery.ts     # Solver & delivery jobs API client
│   ├── components/
│   │   ├── AppHeader/index.tsx
│   │   ├── AppLayout/index.tsx    # Main shell layout & side navigation
│   │   ├── AppRoot/index.tsx      # Main router & auth wrapper
│   │   └── MapComponent/
│   │       ├── index.tsx          # General map component
│   │       ├── Interactive3DMap.tsx # WebGL 3D MapLibre satellite radar map
│   │       └── NextDayDeliveryMap.tsx # Route map wrapper with 3D/2D toggle
│   ├── config/
│   │   └── appvars.ts             # Route URLs, datetime formats, default lat/lng
│   ├── contexts/
│   │   ├── AuthenticatedUserContext.tsx
│   │   ├── DeliveryJobQueryContext/
│   │   └── SolverJobQueryContext/
│   ├── pages/
│   │   ├── CustomerLocation/
│   │   ├── DistanceCache/
│   │   ├── HomePage/index.tsx     # Overview dashboard & 3D radar preview
│   │   ├── Order/
│   │   ├── SolverPage/
│   │   │   ├── DeliveryJobList/   # Main Command Center UI (Features 1–8)
│   │   │   │   ├── index.tsx
│   │   │   │   └── table-columns.tsx # Feature 2 ProgressBar capacity column
│   │   │   ├── SolverJobList/    # Solver runs history table
│   │   │   └── router/index.tsx   # Solver routes
│   │   ├── Vehicle/
│   │   └── Warehouse/
│   └── index.css
```

---

### 28. Design Summary

The current frontend implementation successfully delivers a state-of-the-art **Navi Mumbai Medical Logistics Command Center**. By combining the **AWS Cloudscape Design System** with **MapLibre GL 3D satellite radar visualization** and **Features 1–8 Decision Intelligence**, the platform provides dispatchers with an auditable, data-driven, and interactive environment for next-day emergency medical supply delivery routing.
