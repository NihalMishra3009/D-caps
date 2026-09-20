# Delivery Dispatch & Route Optimization Platform --- UI Design Specification

## 1. Design Objective

Redesign the frontend into one consistent logistics product experience
based on the supplied visual references.

The primary visual reference is the supplied logistics dashboard image:
a clean, premium enterprise interface with a light gray canvas, white
content surfaces, restrained borders, compact typography, large
operational imagery, and information layered directly onto the vehicle.

The supplied Pinterest reference is treated as the landing-page
inspiration. The resolved Pinterest result is a logistics
dashboard/web-design reference. citeturn0search0

### Non-negotiable constraint

**Do not change the backend, optimization engine, API contracts,
database models, solver logic, routing logic, or existing
decision-intelligence calculations.**

This is a **frontend design and presentation redesign only**.

Existing backend and domain behavior remains the source of truth.

------------------------------------------------------------------------

# 2. Current Implementation Baseline

The existing application is a React 19 + TypeScript + Vite frontend
using AWS Cloudscape, MapLibre/Leaflet mapping, React Router, and
existing API/context layers. fileciteturn0file0L23-L35

The current application already contains pages for:

-   Customer Location
-   Warehouse
-   Vehicle
-   Order
-   Distance Cache
-   Solver
-   Delivery-job inspection

The existing application shell contains:

-   Header
-   Collapsible side navigation
-   Breadcrumbs

The main solver inspection page is `DeliveryJobList`.
fileciteturn0file0L120-L130

The redesign must sit on top of these existing capabilities rather than
replacing their data or backend behavior.

------------------------------------------------------------------------

# 3. Overall Visual Direction

## 3.1 Design language

The complete website should feel like:

> **Premium logistics command center + modern fleet operations
> platform**

Avoid making it look like a generic admin dashboard.

The visual language should combine:

-   Large visual vehicle/fleet presentation
-   Minimal enterprise UI
-   Soft gray background
-   White cards
-   Black/dark charcoal typography
-   Small amounts of muted green for operational status
-   Purple as a controlled interaction/accent color
-   Thin borders
-   Large whitespace
-   Compact data labels
-   Rounded but not overly rounded components
-   Subtle shadows
-   High information density without visual clutter

The reference image uses a large truck as the visual anchor and places
operational information around/on the truck. The Fleet section should
follow this principle.

------------------------------------------------------------------------

# 4. Design Tokens

## 4.1 Color system

Use CSS variables so the visual system can be changed centrally.

``` css
:root {
  --bg-page: #f3f3f1;
  --bg-surface: #ffffff;
  --bg-surface-muted: #f8f8f7;

  --text-primary: #181818;
  --text-secondary: #707070;
  --text-muted: #9a9a9a;

  --border: #e5e5e2;
  --border-strong: #d7d7d3;

  --accent-dark: #242424;
  --accent-purple: #7217f5;

  --status-success: #8fcf3f;
  --status-warning: #d8a82e;
  --status-error: #d94b4b;
  --status-info: #6e9cf5;

  --map-bg: #eeeeeb;
}
```

### Usage rules

-   Black/charcoal: navigation, headings, primary controls.
-   Purple: selected vehicle, active route state, primary interactive
    emphasis.
-   Green: operational/healthy/complete state.
-   Yellow/orange: warning.
-   Red: hard constraint/error.
-   Gray: secondary information and inactive UI.

Do not turn the interface into a purple-themed application. Purple
should remain an accent.

------------------------------------------------------------------------

# 5. Typography

Use a clean modern sans-serif.

Preferred stack:

``` css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Hierarchy

  Element           Style
  ----------------- ----------------------------
  Hero heading      48--64px, semibold
  Page heading      28--36px, semibold
  Section heading   18--22px, semibold
  Card heading      14--16px, semibold
  Body              13--15px
  Data label        10--12px uppercase / muted
  KPI value         22--32px
  Micro metadata    10--12px

Avoid oversized typography inside operational screens.

------------------------------------------------------------------------

# 6. Global Layout

## 6.1 Application shell

The application should use a consistent shell across landing page and
authenticated/operational pages.

``` text
┌────────────────────────────────────────────────────────────────────┐
│ Logo        Home   Transportations   Delivery   Load Planning      │
│                                     Shipping       Search   ●  ◯   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                        PAGE CONTENT                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Desktop

-   Header: 64--72px
-   Content max width: approximately 1400--1500px
-   Horizontal page padding: 36--56px
-   Large white/gray negative space
-   Avoid excessive sidebar width

### Mobile

-   Collapse navigation into a menu
-   Keep the logo visible
-   Preserve primary action
-   Convert multi-column layouts into vertical sections
-   Vehicle canvas becomes horizontally scrollable or stacked

------------------------------------------------------------------------

# 7. Navigation

Use the reference navigation concept as the primary information
architecture.

### Main navigation

1.  Home
2.  Transportations
3.  Delivery
4.  Load Planning
5.  Shipping

Additional operational pages can remain accessible through the existing
application navigation where required.

### Active state

The active navigation item should use:

-   Dark charcoal background
-   White text
-   Compact pill/rounded rectangle
-   No bright gradient

Example:

``` text
Home          [ Transportations ]     Delivery
```

------------------------------------------------------------------------

# 8. Landing Page

## 8.1 Purpose

The landing page is the visual entry point to the logistics platform.

It should introduce the product before exposing the dense command-center
functionality.

The landing page should visually belong to the same product as the Fleet
and Solver pages.

Do not create a separate marketing style.

------------------------------------------------------------------------

## 8.2 Hero composition

Use an editorial logistics composition rather than a conventional SaaS
hero.

### Structure

``` text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  MOVE & OPTIMIZE                                            │
│                                                             │
│  Smarter dispatch.                                         │
│  Better fleet utilization.                                  │
│                                                             │
│  Plan routes, manage vehicles and monitor                   │
│  delivery operations from one command center.               │
│                                                             │
│  [ Open Command Center ]                                    │
│                                                             │
│                         ┌─────────────────────────────┐     │
│                         │                             │     │
│                         │       LARGE TRUCK           │     │
│                         │       / FLEET VISUAL        │     │
│                         │                             │     │
│                         └─────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hero visual

The truck/fleet image should be the dominant visual object.

Use:

-   White/gray background
-   Clean cutout vehicle
-   Minimal background noise
-   Subtle operational labels around the vehicle
-   No excessive gradients

The visual should immediately communicate logistics/fleet management.

------------------------------------------------------------------------

# 9. Landing Page Sections

## 9.1 Hero

Content:

-   Short product statement
-   Primary CTA
-   Secondary "Explore Fleet" / "View Operations" CTA
-   Large truck/fleet visual

Do not add large blocks of marketing copy.

------------------------------------------------------------------------

## 9.2 Operational capability strip

Use four compact blocks:

``` text
17
CUSTOMER LOCATIONS

8
FLEET VEHICLES

VRPTW
ROUTE OPTIMIZATION

3D
LIVE ROUTE VISUALIZATION
```

The values should come from existing available implementation data where
practical.

The current local fallback contains 17 Navi Mumbai hospitals and 8 fleet
vans. fileciteturn0file0L192-L193

------------------------------------------------------------------------

## 9.3 Product overview

Use three visual cards:

### Fleet

Manage vehicle registrations, capacity, utilization and assignments.

### Dispatch

View optimized vehicle assignments and delivery stops.

### Route Intelligence

Inspect routes, distance, travel time and optimization results.

These cards are entry points into existing functionality, not new
backend features.

------------------------------------------------------------------------

## 9.4 Route visualization section

Use the existing 3D map as a visual product showcase.

The current implementation already supports satellite imagery, 3D
extruded buildings, polyline routes, node badges and camera controls.
fileciteturn0file0L281-L290

Design this section as:

``` text
┌─────────────────────────────────────────────────────────────┐
│ ROUTE INTELLIGENCE                                          │
│                                                             │
│  Optimized movement across the delivery network.            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                    3D MAP                             │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 10. Fleet Section --- Primary Reference Implementation

This is the most important redesign requirement.

The supplied truck dashboard image is the direct visual reference for
the Fleet experience.

When a user clicks a vehicle/fleet item, the vehicle should become the
main visual object and its information should be displayed **on and
around the truck**, rather than presenting only a conventional data
table.

------------------------------------------------------------------------

# 11. Fleet Page Structure

``` text
┌────────────────────────────────────────────────────────────────────┐
│ Transportations                                                    │
│ Fleet                                                              │
│                                                                    │
│  Vehicle 01     Vehicle 02     Vehicle 03     Vehicle 04          │
│  ● Active       ● Active       ○ Idle         ● Active             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│              VEHICLE INFORMATION CANVAS                            │
│                                                                    │
│       ┌──────────────────────────────────────────────┐              │
│       │                                              │              │
│       │                 TRUCK IMAGE                  │              │
│       │                                              │              │
│       │    ┌──────┐  ┌──────┐  ┌──────┐             │              │
│       │    │ 82%  │  │ 5.0T │  │ 3/5  │             │              │
│       │    │ LOAD │  │ CAP. │  │ DROPS│             │              │
│       │    └──────┘  └──────┘  └──────┘             │              │
│       │                                              │              │
│       └──────────────────────────────────────────────┘              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ Vehicle details          Route / assignment       Operational state │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 12. Vehicle Information Overlay

When a vehicle is selected, information should visually attach to the
truck.

### Information categories

Display only data that already exists in the current vehicle/delivery
models.

Relevant existing data includes:

-   Vehicle registration (`carNo`)
-   Maximum payload (`maxCapacity`)
-   Current vehicle load (`loadCapacity`)
-   Remaining payload
-   Delivery time group
-   Number of assigned drops
-   Assigned hospital/customer stops
-   Route information
-   Operational warnings

The existing implementation already exposes these assignment facts.
fileciteturn0file0L266-L276

------------------------------------------------------------------------

## 12.1 Truck labels

Example:

``` text
              ┌──────────────────────┐
              │  UTILIZATION         │
              │  82%                 │
              └──────────────────────┘
                       ↓
             ┌─────────────────────────────┐
             │                             │
     ───────►│          TRUCK              │◄───────
             │                             │
             └─────────────────────────────┘
                       ↑
              ┌──────────────────────┐
              │  4 DROPS             │
              │  1,820 / 2,500 KG    │
              └──────────────────────┘
```

The labels should feel integrated into the vehicle composition.

Do not cover important parts of the truck.

------------------------------------------------------------------------

# 13. Vehicle Selection Interaction

### Default state

Show a fleet overview with several vehicles.

Each vehicle can appear as:

-   Small truck thumbnail
-   Registration
-   Capacity
-   Utilization
-   Status

### Selected state

Clicking a vehicle:

1.  Makes that vehicle the main visual.
2.  Updates the truck image/illustration.
3.  Updates all overlays.
4.  Updates the details panel.
5.  Highlights the vehicle in the fleet selector.
6.  Updates route/assignment information.
7.  Shows relevant warnings if present.

Do not trigger a backend request merely to create the visual transition
if the required data is already loaded.

------------------------------------------------------------------------

# 14. Vehicle Canvas Controls

Use small controls positioned at the right side of the vehicle canvas.

Suggested controls:

``` text
       +
       −
```

Optional:

``` text
      Fit
```

These controls should be visually subordinate.

Avoid floating toolbars with many icons.

------------------------------------------------------------------------

# 15. Fleet Utilization

Use a compact utilization indicator.

Example:

``` text
UTILIZATION
82%

████████████████░░░░
```

The current implementation already calculates fleet utilization and
per-vehicle utilization. fileciteturn0file0L221-L233

Existing utilization logic should remain unchanged.

The redesign only changes presentation.

------------------------------------------------------------------------

# 16. Vehicle Detail Panel

Below the truck canvas, use a three-column information area.

### Column 1 --- Vehicle

``` text
VEHICLE

Registration
MH 46 AB 1234

Maximum payload
2,500 kg

Current load
2,050 kg

Remaining
450 kg
```

### Column 2 --- Assignment

``` text
ASSIGNMENT

Time group
09:00–13:00

Assigned drops
4

Primary location
Vashi Medical Hub
```

### Column 3 --- Route

``` text
ROUTE

Distance
38.4 km

Estimated time
1h 42m

Stops
4

Status
Complete
```

Use only fields supported by the existing data model.

------------------------------------------------------------------------

# 17. Delivery / Order List

The reference image includes a compact order table below the visual
fleet section.

Use the same principle.

Columns:

-   Customer
-   Shipping / Order ID
-   Location
-   Status

Example:

``` text
ORDER LIST

Customer          Order ID       Location          Status
------------------------------------------------------------
M. K. Medical     #9836          Green Road        ● Complete
R. Pharmacy       #1780          Park Street       ● On Delivery
Apex Medical      #4824          Silver River      ● On Delivery
```

The exact field names should follow the current API/model data.

------------------------------------------------------------------------

# 18. Map + Fleet Split View

Below the vehicle section:

``` text
┌──────────────────────────────┬──────────────────────────────────┐
│                              │                                  │
│          MAP                 │          ORDER LIST              │
│                              │                                  │
│     route / stops            │          assignments             │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

The map remains the operational visualization.

The order list remains the data inspection surface.

This preserves the current functionality while making the UI visually
closer to the supplied reference.

------------------------------------------------------------------------

# 19. Solver / Optimization Dashboard

The redesign should not remove the current decision-intelligence
functionality.

The existing implementation includes:

1.  Optimization summary
2.  Vehicle capacity utilization
3.  Risk warnings
4.  Assignment explanation
5.  3D route visualization
6.  Before-vs-optimized comparison
7.  Re-optimization
8.  What-if simulation

These are already integrated into the current application.
fileciteturn0file0L349-L365

The redesign changes their presentation only.

------------------------------------------------------------------------

# 20. Optimization Summary

Use a horizontal KPI strip instead of large generic dashboard cards.

``` text
ORDERS       VEHICLES       DISTANCE       EST. TIME
17           8              126 km         4h 32m

FLEET UTIL.  SOLVER TIME    SCORE
84%          1.42s          0hard/...
```

Cards should be compact and visually connected.

------------------------------------------------------------------------

# 21. Warnings

Use a compact operational alert rail.

Example:

``` text
OPERATIONAL CHECKS

●  No capacity violations
●  2 contracted fleet assignments
●  1 tight delivery time window
```

The current warning system already evaluates capacity overload,
contracted fleet surcharge and time-window tightness.
fileciteturn0file0L253-L261

Do not invent new warning logic.

------------------------------------------------------------------------

# 22. Assignment Explanation

When the user selects a vehicle or order, show the explanation in a
clean facts panel.

``` text
ASSIGNMENT EXPLANATION

Vehicle
MH 46 AB 1234

Time band
09:00–13:00

Assigned drops
4

Current load
1,820 kg

Maximum payload
2,500 kg

Remaining capacity
680 kg
```

This replaces the feeling of a generic admin inspector with a deliberate
operational information panel.

------------------------------------------------------------------------

# 23. Before vs Optimized

Use a visual comparison block:

``` text
BEFORE                         OPTIMIZED

Direct runs                    Consolidated routes

184 km                         126 km

5h 12m                         4h 32m

                              ↓ 58 km
```

The underlying calculation must remain the current `comparisonData`
implementation.

The current implementation compares baseline direct-run distance against
OptaPlanner consolidated distance and calculates distance reduction.
fileciteturn0file0L295-L303

------------------------------------------------------------------------

# 24. What-if Simulation

Maintain the existing non-destructive behavior.

Visual treatment:

``` text
┌──────────────────────────────────────────────────────────┐
│ WHAT-IF SIMULATION MODE                                  │
│                                                          │
│ Temporary scenario — production plan is unchanged.       │
│                                                          │
│ [ Add emergency order ]  [ Increase payload ]            │
│                                                          │
│                              [ Restore plan ]             │
└──────────────────────────────────────────────────────────┘
```

The current implementation explicitly keeps what-if changes in temporary
state and does not modify persistent database records.
fileciteturn0file0L319-L328

------------------------------------------------------------------------

# 25. Re-optimization

Keep the existing re-optimization action.

Visual design:

``` text
RE-OPTIMIZE

Capacity scaling
[ 1.00x ]

Current fleet capacity
20,000 kg

Projected capacity
20,000 kg

[ Run Re-optimization ]
```

The current workflow already adjusts the capacity scaling factor and
submits a re-evaluation. fileciteturn0file0L308-L315

------------------------------------------------------------------------

# 26. Map Design

The map should visually integrate with the rest of the product.

### Existing capabilities to preserve

-   MapLibre 3D
-   Satellite imagery
-   3D buildings
-   Route polylines
-   Route node badges
-   Camera controls
-   Leaflet fallback

These are already implemented. fileciteturn0file0L281-L290

### Visual treatment

Use:

-   Soft neutral controls
-   White floating controls
-   Minimal labels
-   Dark route line
-   Purple selected route
-   Green operational markers
-   Small dark-glass node labels

Do not replace the current map engine.

------------------------------------------------------------------------

# 27. Customer Location Page

Use the same design language.

Layout:

``` text
CUSTOMER LOCATIONS

[ Search customer / hospital ]

┌─────────────────────────────┬──────────────────────────────┐
│ Customer list               │ Map                          │
│                             │                              │
│ Fortis Vashi                │         ●                    │
│ Apollo Belapur              │    ●                         │
│ MGM Vashi                   │               ●              │
│ ACTREC Kharghar             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

The current local fallback includes Navi Mumbai medical facilities
including Fortis Vashi, Apollo Belapur, MGM Vashi, Tata ACTREC Kharghar
and Panvel Trauma Centre. fileciteturn0file0L127-L130

------------------------------------------------------------------------

# 28. Warehouse Page

Use a compact operational layout.

``` text
WAREHOUSES

┌─────────────────────────────────────────────────────┐
│ Warehouse                                          │
│                                                     │
│ Location        Vehicles       Active Orders        │
│ Navi Mumbai     8              17                   │
└─────────────────────────────────────────────────────┘

                         MAP
```

Do not introduce new warehouse business logic.

------------------------------------------------------------------------

# 29. Orders / Delivery Page

Use the same order-list language as the Fleet screen.

Primary actions:

-   Search
-   Filter
-   View order
-   View assigned vehicle
-   View route

The page should feel like another view of the same operational system
rather than a separate application.

------------------------------------------------------------------------

# 30. Load Planning

Use a visually prominent loading/fleet composition.

``` text
LOAD PLANNING

Vehicle
┌─────────────────────────────────────────────────┐
│                                                 │
│                    TRUCK                        │
│                                                 │
│       ████████████████████░░░░                 │
│                 82%                             │
│                                                 │
└─────────────────────────────────────────────────┘

Payload
1,820 / 2,500 kg

Stops
4 / 5
```

The existing constraint system already includes vehicle capacity,
minimum load ratio and maximum destination-count rules.
fileciteturn0file0L157-L170

The UI must expose these facts without modifying the underlying
constraints.

------------------------------------------------------------------------

# 31. Shipping Page

Keep the page lightweight.

Use:

-   Shipment list
-   Status
-   Customer
-   Vehicle
-   Route
-   Delivery state

Use the same compact table style as the Fleet order list.

------------------------------------------------------------------------

# 32. Status System

Use consistent status indicators across the whole application.

  Status        Visual
  ------------- ------------------
  Complete      Green dot
  On Delivery   Amber/orange dot
  Active        Green dot
  Idle          Gray dot
  Warning       Amber
  Error         Red
  Selected      Purple

Do not use colored badges everywhere.

Small status dots are preferred.

------------------------------------------------------------------------

# 33. Cards

Cards should be:

-   White
-   Thin border
-   8--14px radius
-   Very subtle shadow or no shadow
-   Generous internal padding
-   Minimal decoration

Avoid:

-   Glassmorphism everywhere
-   Strong gradients
-   Huge shadows
-   Excessive rounded pills
-   Neon colors

------------------------------------------------------------------------

# 34. Buttons

### Primary

Dark charcoal background.

``` text
[ Open Command Center ]
```

### Secondary

White background with border.

``` text
[ View Fleet ]
```

### Accent action

Purple.

``` text
[ Re-optimize ]
```

### Destructive

Use red only for genuinely destructive actions.

------------------------------------------------------------------------

# 35. Icons

Use the existing UI icon system where possible.

Icons should be:

-   Small
-   Linear
-   Consistent
-   Secondary to text

Avoid using large decorative icons.

------------------------------------------------------------------------

# 36. Tables

Tables should visually resemble the supplied reference.

Rules:

-   Compact row height
-   Light separators
-   No heavy boxed grid
-   Small headers
-   Status aligned to the right
-   Hover state subtle
-   Selected row lightly highlighted

Example:

``` text
CUSTOMER       SHIPPING ID      LOCATION          STATUS
──────────────────────────────────────────────────────────
M. K. Medical  #9836            Green Road        ● Complete
R. Pharmacy    #1780            Park Street       ● On Delivery
Apex Medical   #4824            Silver River      ● On Delivery
```

------------------------------------------------------------------------

# 37. Responsive Behavior

## Desktop

Primary experience.

-   Large truck canvas
-   Side-by-side map/list
-   Multi-column KPI layout

## Tablet

-   Reduce horizontal spacing
-   Stack detail panels
-   Maintain truck canvas
-   Collapse navigation

## Mobile

-   Single-column layout
-   Fleet selector becomes horizontal scroll
-   Truck canvas becomes vertically contained
-   Overlay labels reposition around the vehicle
-   Tables become cards or horizontal scroll
-   Map becomes a dedicated section

The Fleet visual must remain recognizable on small screens.

------------------------------------------------------------------------

# 38. Animation

Use subtle motion only.

Allowed:

-   Vehicle selection fade/scale
-   Active route transition
-   KPI number transition
-   Map marker pulse
-   Panel reveal

Avoid:

-   Large page transitions
-   Constant floating animation
-   Excessive parallax
-   Decorative animation that competes with operational information

Animation duration:

``` text
150–250ms
```

Use ease-out transitions.

------------------------------------------------------------------------

# 39. Accessibility

Maintain:

-   Keyboard navigation
-   Visible focus states
-   Sufficient text contrast
-   Accessible button labels
-   Semantic headings
-   Screen-reader labels for icon-only controls
-   Status information that is not communicated only through color

The vehicle canvas must not make important information available only
visually.

------------------------------------------------------------------------

# 40. Frontend Implementation Rules

## Preserve

-   React 19
-   TypeScript
-   Vite
-   React Router
-   Existing API client
-   Existing contexts
-   Existing models
-   Existing MapLibre/Leaflet implementation
-   Existing Cloudscape functionality where practical
-   Existing backend API contracts
-   Existing solver logic
-   Existing optimization calculations

The current frontend stack is documented as React 19 + TypeScript +
Vite + Cloudscape with MapLibre and Leaflet.
fileciteturn0file0L66-L76

## Do not modify

-   Java/Spring Boot optimization engine
-   OptaPlanner constraints
-   GraphHopper routing
-   DynamoDB schema
-   API endpoints
-   AWS infrastructure
-   Solver calculations
-   Vehicle/order domain models unless strictly required for
    presentation compatibility

The current API contract includes `/vehicle`, `/order`,
`/customer-location`, `/warehouse`, solver and delivery-job endpoints.
fileciteturn0file0L333-L344

------------------------------------------------------------------------

# 41. Recommended Frontend Component Structure

Suggested presentation-layer organization:

``` text
src/
├── components/
│   ├── layout/
│   │   ├── SiteHeader/
│   │   ├── Navigation/
│   │   └── PageContainer/
│   │
│   ├── fleet/
│   │   ├── FleetSelector/
│   │   ├── VehicleCanvas/
│   │   ├── VehicleOverlay/
│   │   ├── VehicleStats/
│   │   ├── VehicleRoute/
│   │   └── FleetOrderList/
│   │
│   ├── dashboard/
│   │   ├── KPIBar/
│   │   ├── WarningRail/
│   │   ├── AssignmentPanel/
│   │   └── ComparisonPanel/
│   │
│   └── map/
│       └── existing MapLibre/Leaflet components
│
├── pages/
│   ├── Landing/
│   ├── Fleet/
│   ├── Delivery/
│   ├── LoadPlanning/
│   ├── Shipping/
│   ├── CustomerLocation/
│   ├── Warehouse/
│   └── Solver/
│
└── styles/
    ├── tokens.css
    ├── global.css
    └── components.css
```

This is a presentation organization recommendation. It does not require
backend restructuring.

------------------------------------------------------------------------

# 42. Fleet Vehicle Canvas Implementation

The vehicle canvas is the key custom UI component.

## Required behavior

``` text
selectedVehicle
      │
      ├── vehicle image
      ├── registration label
      ├── capacity label
      ├── utilization label
      ├── drop count
      ├── route status
      └── operational warnings
```

### Data flow

Use already loaded vehicle/delivery data.

Do not create a second vehicle database.

``` text
Existing API / Context
        ↓
Existing vehicle + delivery data
        ↓
FleetSelector
        ↓
Selected Vehicle
        ↓
VehicleCanvas
        ↓
Overlay + Detail Panels
```

------------------------------------------------------------------------

# 43. Vehicle Image Strategy

The vehicle visual should support two implementation options:

### Option A --- Transparent vehicle image

Preferred if suitable vehicle assets are available.

``` text
PNG/WebP
transparent background
        ↓
VehicleCanvas
        ↓
absolute-positioned data labels
```

### Option B --- CSS/HTML composition

If no suitable image exists, create a clean vehicle illustration using
frontend assets.

The vehicle should remain the visual anchor.

Do not use generic stock imagery with unrelated branding.

------------------------------------------------------------------------

# 44. Information Placement Rules

Information should be placed according to the physical structure of the
truck.

### Front/cabin area

Use:

-   Vehicle registration
-   Driver/vehicle identity if supported by data

### Cargo area

Use:

-   Capacity
-   Load
-   Utilization
-   Cargo/drop information

### Under/near truck

Use:

-   Route
-   Stop count
-   Status

This makes the visualization semantically meaningful rather than
decorative.

------------------------------------------------------------------------

# 45. Empty States

Use the same visual language.

Example:

``` text
NO VEHICLE SELECTED

Select a vehicle from the fleet list
to inspect capacity, route and assignment.

[ Select Vehicle ]
```

For missing baseline:

Use the existing implementation message:

> Baseline unavailable --- no pre-optimization plan is available.

The current implementation already defines this unavailable state.
fileciteturn0file0L295-L303

------------------------------------------------------------------------

# 46. Loading States

Do not use large generic spinners.

Prefer:

-   Skeleton vehicle canvas
-   Skeleton KPI values
-   Skeleton table rows
-   Map loading indicator

Example:

``` text
┌──────────────────────────────────────────────┐
│                                              │
│              [ vehicle skeleton ]            │
│                                              │
└──────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 47. Error States

Keep operational errors explicit.

Example:

``` text
ROUTE DATA UNAVAILABLE

The vehicle is available, but route geometry
could not be displayed.

[ View Assignment Data ]
```

Do not hide backend/API errors behind generic UI messages.

------------------------------------------------------------------------

# 48. Landing-to-Application Flow

The complete experience should follow:

``` text
LANDING
   │
   ├── Explore Fleet
   │       ↓
   │    FLEET
   │       ↓
   │   Vehicle Canvas
   │       ↓
   │   Assignment / Route
   │
   └── Open Command Center
           ↓
      SOLVER / OPERATIONS
           ↓
      Optimization
           ↓
      Route + Fleet
           ↓
      Delivery
```

The landing page and application pages must look like one product.

------------------------------------------------------------------------

# 49. Visual Consistency Rules

Every page must share:

-   Same header
-   Same typography
-   Same background
-   Same border radius
-   Same status system
-   Same button language
-   Same spacing scale
-   Same navigation treatment
-   Same map controls
-   Same table treatment

A user should not feel that the landing page was designed separately
from the dashboard.

------------------------------------------------------------------------

# 50. Spacing System

Use an 8px base grid.

``` text
4px   micro
8px   compact
12px  small
16px  standard
24px  section
32px  large
48px  major
64px  hero
```

Use whitespace aggressively around major sections.

------------------------------------------------------------------------

# 51. Design Priority

When there is a conflict between visual decoration and operational
clarity:

1.  Operational information
2.  Vehicle/fleet visualization
3.  Navigation
4.  Route visibility
5.  Status/warnings
6.  Secondary decoration

The design should never sacrifice usable fleet information merely to
resemble the reference image.

------------------------------------------------------------------------

# 52. Implementation Phases

## Phase 1 --- Global visual foundation

Implement:

-   Design tokens
-   Typography
-   Background
-   Borders
-   Buttons
-   Navigation
-   Global spacing
-   Light enterprise theme

No backend changes.

------------------------------------------------------------------------

## Phase 2 --- Landing page

Implement:

-   Hero
-   Fleet visual
-   Capability strip
-   Product sections
-   3D map showcase
-   Navigation into existing application

------------------------------------------------------------------------

## Phase 3 --- Fleet redesign

Implement first because it is the primary reference.

Tasks:

-   Fleet selector
-   Vehicle canvas
-   Vehicle image
-   Information overlays
-   Utilization
-   Assignment panel
-   Route panel
-   Order list
-   Responsive behavior

------------------------------------------------------------------------

## Phase 4 --- Existing operational pages

Apply the same visual system to:

-   Delivery
-   Load Planning
-   Shipping
-   Customer Locations
-   Warehouse
-   Solver

Do not rewrite their business logic.

------------------------------------------------------------------------

## Phase 5 --- Solver dashboard refinement

Restyle:

-   KPI summary
-   Warnings
-   Assignment explanation
-   Comparison
-   Re-optimization
-   What-if simulation
-   3D route view

All existing calculations remain unchanged.

------------------------------------------------------------------------

## Phase 6 --- Responsive and accessibility pass

Verify:

-   Desktop
-   Tablet
-   Mobile
-   Keyboard navigation
-   Focus states
-   Contrast
-   Empty states
-   Loading states
-   Error states

------------------------------------------------------------------------

# 53. Acceptance Criteria

The redesign is complete when:

### Overall

-   [ ] Landing page and application look like one product.
-   [ ] Visual language matches the supplied logistics reference.
-   [ ] Interface is predominantly light gray/white.
-   [ ] Typography and spacing are consistent.
-   [ ] No unnecessary visual clutter.

### Fleet

-   [ ] Clicking a vehicle selects it.
-   [ ] Selected vehicle becomes the visual focus.
-   [ ] Vehicle information appears on/around the truck.
-   [ ] Capacity is visible.
-   [ ] Utilization is visible.
-   [ ] Assigned drops are visible.
-   [ ] Vehicle status is visible.
-   [ ] Route/assignment information is visible.
-   [ ] Existing data is reused.
-   [ ] No duplicate backend data source is introduced.

### Operations

-   [ ] Existing solver data remains functional.
-   [ ] Existing warnings remain functional.
-   [ ] Existing comparison remains functional.
-   [ ] Existing re-optimization remains functional.
-   [ ] Existing what-if simulation remains functional.
-   [ ] Existing 3D map remains functional.

### Backend safety

-   [ ] No Java backend changes.
-   [ ] No OptaPlanner changes.
-   [ ] No GraphHopper changes.
-   [ ] No API contract changes.
-   [ ] No DynamoDB schema changes.
-   [ ] No AWS infrastructure changes.

------------------------------------------------------------------------

# 54. Final Design Principle

The website should not become a copy of the reference image.

Instead:

> **Use the reference's visual hierarchy and interaction concept, while
> adapting it to the actual Delivery Dispatch & Route Optimization
> product.**

The most important visual idea is the **vehicle as an information
canvas**.

The user should be able to look at a truck and immediately understand:

``` text
WHO / WHICH VEHICLE?
        ↓
HOW MUCH IS LOADED?
        ↓
HOW FULL IS IT?
        ↓
HOW MANY DROPS?
        ↓
WHERE IS IT GOING?
        ↓
IS THERE A PROBLEM?
```

That principle should define the Fleet experience and then propagate
into the rest of the website.

The current system already has the required underlying data and
operational features; the redesign should expose those capabilities
through a coherent visual system rather than changing the underlying
implementation.
