# Delivery Dispatch & Route Optimization Platform — Features

This document extracts the selected product features from the master implementation specification and describes **what each feature does, how it works, what data it uses, and the implementation rules**.

## Core Principles

- Preserve all existing functionality.
- Extend the existing application; do not rebuild it.
- Use the existing OptaPlanner solver, GraphHopper routing, MapLibre map, Cloudscape UI, and AWS architecture.
- No ML, LLM, chatbot, or fake AI reasoning.
- Use only real/legitimate data available from the current system.
- Never fabricate routes, distances, travel times, assignments, solver scores, constraint violations, or AWS results.
- Existing API and database contracts remain compatible; additive changes only when necessary.
- No unnecessary refactoring or new microservices.
- Loading, empty, error, and fallback states must be handled.
- AWS credentials are currently unavailable, so implementation must proceed without pretending that live AWS calls succeeded.
- Priority order: existing functionality > data correctness > architecture compatibility > feature completeness > visual polish.

---

# Feature 1 — Optimization Summary Dashboard

## Purpose

Provide a compact summary of the completed optimization result so a user can immediately understand the outcome without manually inspecting every vehicle and route.

## What it displays

The dashboard contains:

1. **Total Orders**
2. **Vehicles Used**
3. **Total Distance**
4. **Total Travel Time**
5. **Fleet Capacity Utilization**
6. **Solver Runtime**
7. **Solver Score**

## How it works

### Total Orders

Orders are counted from the actual delivery-job result.

- Use actual order IDs from the route/stop data.
- Ignore warehouse-only stops such as `TO_WAREHOUSE`.
- Use a `Set` of order IDs so an order is not counted more than once.
- If the detailed route data is unavailable, use the existing `solverJob.orderCount` when legitimately available.
- As a final legitimate fallback, use the existing stop count where supported.

### Vehicles Used

Count the existing optimized delivery jobs:

```text
Vehicles Used = number of deliveryJobs
```

No new vehicle calculation is introduced.

### Total Distance

For every vehicle:

1. Prefer the existing vehicle-level route distance.
2. Convert meters to kilometers for display.
3. Sum each vehicle exactly once.
4. Only use segment-level distance when the vehicle-level value is unavailable.

This prevents double-counting route distance.

### Total Travel Time

For every vehicle:

1. Prefer the existing route travel-time value.
2. Convert seconds into a human-readable hours/minutes representation.
3. Use segment-level time only when the aggregate route time is unavailable.
4. Sum each vehicle once.

### Fleet Capacity Utilization

Calculate:

```text
Fleet Utilization =
Total Assigned Load / Total Fleet Maximum Capacity × 100
```

Only valid numeric capacity values are used.

### Solver Runtime

Display the runtime already associated with the solver job.

No new timing mechanism is invented if an existing solver runtime is available.

### Solver Score

Display the actual OptaPlanner solver score from the existing solver result.

Do not reinterpret or invent a score.

## UI behavior

- Implemented using the existing Cloudscape UI.
- Placed at the top of the existing Delivery Job List workflow.
- Existing table, map, selection, and navigation behavior remains unchanged.
- Empty/loading/error states must be handled.
- Missing metrics should display an appropriate unavailable state rather than fake values.

## Existing implementation

The summary dashboard is implemented in:

```text
apps_web/src/pages/SolverPage/DeliveryJobList/OptimizationSummaryDashboard.tsx
```

The Delivery Job List was minimally extended to obtain the solver-job result and render the dashboard.

---

# Feature 2 — Per-Vehicle Capacity Utilization

## Purpose

Show how much of each vehicle's available capacity is being used.

This lets the user inspect fleet utilization at the individual vehicle level.

## How it works

For each vehicle:

```text
Capacity Utilization =
Load Capacity / Maximum Capacity × 100
```

The implementation uses the existing:

- `loadCapacity`
- `maxCapacity`

values from the vehicle/delivery-job data.

## Display

The capacity value is shown as:

- a Cloudscape `ProgressBar`
- a percentage value

### Status rules

| Utilization | Display Status |
|---|---|
| `< 80%` | In progress |
| `80–100%` | Success |
| `> 100%` | Error |

The visual progress bar is clamped to 100%, but the displayed percentage preserves the real value when it exceeds 100%.

Example:

```text
Actual utilization: 125%
Progress bar: 100%
Displayed text: 125%
Status: Error
```

## Invalid/missing data

If maximum capacity is:

- missing
- zero
- non-numeric
- otherwise invalid

then the UI displays:

```text
N/A
```

Numeric strings are converted safely using numeric conversion.

## Important constraint

This feature does not modify the solver or assignment logic. It is a read-only visualization of the existing optimization result.

## Existing implementation

The implementation is in:

```text
apps_web/src/pages/SolverPage/DeliveryJobList/table-columns.tsx
```

Existing table sorting, selection, and map behavior remains unchanged.

---

# Feature 3 — Constraint / Risk Warnings

## Purpose

Surface actual optimization problems or constraint-related risks that are supported by the existing solver and result data.

The feature is intended to answer:

> “Is there anything in this optimization result that needs attention?”

## How it works

First inspect the existing OptaPlanner constraint definitions and solver result.

Relevant backend sources include:

```text
DispatchConstraintProvider.java
SolverJob
DeliveryJob
order models
vehicle models
SolutionConsumer.java
DdbSolverJobService.java
DdbDeliveryJobService.java
```

The warning system may only use information that is:

### Directly Supported

The existing system explicitly provides the information.

Examples can include:

- capacity violations
- unassigned orders
- missing vehicle assignments
- delivery-time violations
- routing failures
- hard constraint violations
- explicit solver infeasibility information

### Safely Derivable

The information can be calculated directly and unambiguously from existing data.

### Not Supported

Do not create warnings when the system has no evidence.

For example, do **not** invent rules such as:

- “route is too long”
- “too many stops”
- “vehicle utilization is low”
- “negative score means risk”
- “high distance means bad route”

unless the existing application explicitly defines those conditions.

## Warning structure

A warning should communicate:

1. What happened.
2. Which actual object is affected, when available.
3. The evidence supporting the warning.
4. The severity/category if the existing system supports it.

Example concept:

```text
Capacity violation
Vehicle V-03
Assigned load exceeds maximum capacity.
```

## Fallback

If no supported warning evidence exists:

```text
No supported warnings available
```

or an equivalent unavailable/empty state.

Do not manufacture warnings simply to make the feature look populated.

---

# Feature 4 — Assignment Explanation

## Purpose

Explain an existing optimization assignment using deterministic facts from the solver result.

This is **not AI-generated reasoning**.

The feature should answer questions such as:

- Which vehicle was assigned?
- Where does the order appear in that vehicle's route?
- What is the vehicle's current load?
- What capacity remains?
- What delivery/time information is available?
- Are there relevant constraint or solver facts?

## How it works

When a user selects an order or vehicle, gather the corresponding existing data.

### Assignment facts

Show the actual:

```text
Order
→ Assigned Vehicle
→ Route Position
→ Vehicle Load
→ Vehicle Maximum Capacity
```

### Route facts

If available:

```text
Stop Sequence
Distance
Travel Time
Delivery Time Information
```

### Constraint facts

If the solver result exposes relevant constraint information, show it.

If it does not, explicitly state that the reason is unavailable.

## Important rule

Do not claim:

> “The solver selected this vehicle because it was closest.”

unless the existing solver data actually proves that.

Do not infer hidden solver reasoning.

The explanation must be based on actual data, for example:

```text
Assigned to Vehicle V-02.
Route position: Stop 4.
Current vehicle load: 720 kg.
Maximum capacity: 1,000 kg.
Capacity utilization: 72%.
```

This is deterministic and auditable.

---

# Feature 5 — Improved Route Visualization

## Purpose

Make the existing optimized routes easier to understand visually without replacing the existing map.

## Existing technology

Continue using:

- MapLibre GL JS
- existing route data
- existing map interactions

Do not introduce a second mapping system.

## Visualization

The map should support, where the underlying data exists:

1. Route lines
2. Warehouse/start location
3. Delivery stop markers
4. Vehicle-specific route identification
5. Stop sequence visibility
6. Selected vehicle highlighting
7. Selected order highlighting

## Route rendering

For each vehicle:

```text
Warehouse
   ↓
Stop 1
   ↓
Stop 2
   ↓
Stop 3
   ↓
...
```

The displayed geometry must come from actual GraphHopper/existing route data.

Do not generate straight-line or synthetic routes when real route geometry is unavailable.

## Interaction

Existing behavior must remain intact.

Selecting a vehicle/order should continue to work with:

- table selection
- map highlighting
- existing route/stop interactions

## Fallback

If route geometry is unavailable:

- retain legitimate stop/location information where available
- clearly indicate unavailable route geometry
- do not invent a route line

---

# Feature 6 — Before vs Optimized Comparison

## Purpose

Allow the user to compare a legitimate baseline against the optimized solution.

The comparison should show what changed after optimization.

## Critical rule

A real baseline is required.

Possible legitimate baselines include:

- existing initial assignment
- existing unoptimized route
- persisted baseline
- solver input state that represents the pre-optimization solution

The implementation must inspect the current system to determine whether such a baseline actually exists.

## If a baseline exists

Compare supported metrics such as:

```text
Baseline Distance
Optimized Distance
Distance Change
Distance Improvement %
```

and, where available:

```text
Baseline Travel Time
Optimized Travel Time
Travel Time Change
Travel Time Improvement %
```

## Improvement calculation

Only calculate percentages when both values are valid.

Conceptually:

```text
Improvement % =
(Baseline - Optimized) / Baseline × 100
```

Do not calculate a percentage if the baseline is:

- missing
- zero
- invalid

## If no baseline exists

Display:

```text
Baseline unavailable
```

or an equivalent N/A state.

Do not create a fake “before” route.

## Important

The feature must not imply optimization improvement when the system has no valid evidence for it.

---

# Feature 7 — Re-optimization

## Purpose

Allow an existing optimization result to be recalculated when supported input conditions change.

Examples include supported changes to:

- delivery orders
- vehicle availability
- vehicle capacity
- other existing solver inputs

## Architecture

Use the existing optimization lifecycle.

The flow should remain conceptually:

```text
Existing Input Data
        ↓
Existing Solver Job
        ↓
OptaPlanner
        ↓
Existing Optimization Result
        ↓
Existing Persistence / Delivery Job Workflow
```

Do not create a second independent optimization engine.

## Re-optimization flow

1. User requests re-optimization.
2. Existing input state is collected.
3. Supported changes are applied.
4. A new solver run is triggered using the existing solver lifecycle.
5. OptaPlanner recalculates the assignment.
6. The resulting delivery jobs/routes are returned through the existing workflow.
7. The UI refreshes to show the new result.

## Preservation

If the current persistence model already supports previous results, preserve them.

Do not create a new optimization-history architecture merely for this feature.

## AWS unavailable

The code path can be implemented and locally validated as far as possible.

It must not claim that the remote optimization succeeded.

Use explicit logging such as:

```text
[REOPTIMIZATION FALLBACK]
```

when a supported fallback is required.

---

# Feature 8 — What-if Simulation

## Purpose

Allow users to test a hypothetical operational change without changing the production/current optimization state.

This is a **non-destructive simulation**.

## Example scenarios

Where supported by the existing input model:

- add an order
- remove an order
- change vehicle availability
- change vehicle capacity
- modify another supported optimization input

## Flow

Conceptually:

```text
Current Production State
        ↓
Create Temporary Scenario
        ↓
Apply Hypothetical Change
        ↓
Run Existing Optimization Flow
        ↓
Generate Temporary Result
        ↓
Compare / Display Scenario
        ↓
Discard Scenario
```

The production/current state must remain unchanged unless there is an explicit existing save/apply operation.

## UI requirements

The result should be clearly labeled:

```text
WHAT-IF
SIMULATION
```

Users must be able to distinguish:

- current production result
- simulated result

## Non-destructive requirement

The simulation must not silently:

- overwrite production orders
- overwrite production vehicle assignments
- replace the saved optimization result
- mutate persistent production state

## Result

Where supported, show the simulated optimization outcome using actual computed data.

Possible comparisons include:

```text
Current Distance
Scenario Distance

Current Vehicles
Scenario Vehicles

Current Capacity Utilization
Scenario Capacity Utilization
```

Only show metrics that actually exist in both states.

## AWS unavailable

Use legitimate available data for local validation where possible.

Log:

```text
[WHAT-IF FALLBACK]
```

when a fallback is required.

Never fabricate a simulated result.

---

# Feature Interaction / Overall Workflow

The features are designed to work together inside the existing optimization workflow.

```text
                         ┌──────────────────────────┐
                         │ Existing Orders/Vehicles │
                         └────────────┬─────────────┘
                                      ↓
                         ┌──────────────────────────┐
                         │ Existing OptaPlanner      │
                         │ Optimization              │
                         └────────────┬─────────────┘
                                      ↓
                         ┌──────────────────────────┐
                         │ Existing Solver Result    │
                         └────────────┬─────────────┘
                                      ↓
              ┌───────────────────────┼───────────────────────┐
              ↓                       ↓                       ↓
      Summary Dashboard       Vehicle Capacity        Constraint Warnings
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ↓
                         ┌──────────────────────────┐
                         │ Delivery Job / Route UI  │
                         └────────────┬─────────────┘
                                      ↓
              ┌───────────────────────┼───────────────────────┐
              ↓                       ↓                       ↓
      Assignment Explanation   Route Visualization   Before vs Optimized

                                      ↓
                         ┌──────────────────────────┐
                         │ Re-optimization          │
                         └────────────┬─────────────┘
                                      ↓
                         ┌──────────────────────────┐
                         │ What-if Simulation       │
                         │ (non-destructive)        │
                         └──────────────────────────┘
```

---

# Data Integrity Rules

Every feature must follow these rules:

## Never fabricate

Do not invent:

- order assignments
- vehicle assignments
- route geometry
- distances
- travel times
- solver scores
- constraint violations
- baseline results
- simulated results
- AWS responses

## Existing data first

Prefer:

1. Existing persisted result
2. Existing solver result
3. Existing route data
4. Existing input data
5. Legitimate local/project data

Only then use a supported fallback.

## Fallback logging

Fallback behavior should be explicit, for example:

```text
[AWS FALLBACK]
[ROUTING FALLBACK]
[OPTIMIZATION FALLBACK]
[BASELINE FALLBACK]
[REOPTIMIZATION FALLBACK]
[WHAT-IF FALLBACK]
```

Fallbacks must never silently replace the production architecture.

---

# Architecture Constraints

## Frontend

Continue using:

- React 19
- TypeScript
- Vite
- AWS Cloudscape
- MapLibre GL JS

## Backend

Continue using:

- Java 21
- Spring Boot
- OptaPlanner

## Routing

Continue using:

- GraphHopper
- OpenStreetMap

## AWS

Continue using the existing:

- Lambda
- ECS
- DynamoDB
- S3
- Cognito
- CloudFront
- AWS CDK

No new microservice architecture is required for these features.

---

# Validation Requirements

After implementation:

## Frontend

Run relevant:

- TypeScript checks
- build checks
- tests where available

Known pre-existing frontend issue:

```text
immer / TypeScript 5.9 generic mismatch
```

This should be distinguished from newly introduced failures.

## Backend

Run relevant:

- Gradle checks
- Java compilation
- tests

Known pre-existing backend issue:

```text
FilePersistence.java / S3FilePersistence.java
```

from the earlier migration state.

Do not incorrectly attribute these pre-existing problems to the new features.

## Git review

Before committing:

```text
git status
git diff --stat
git diff
```

Verify:

- intended files only
- no secrets
- no temporary/debug files
- no unrelated changes
- no accidental architecture changes

Then:

```text
git add <only-intended-files>
git commit -m "feat: enhance delivery optimization workflow"
git push
```

Never force-push.

---

# Feature Completion Checklist

| Feature | Core Result |
|---|---|
| 1. Optimization Summary Dashboard | High-level optimization metrics |
| 2. Per-Vehicle Capacity Utilization | Capacity usage for every vehicle |
| 3. Constraint / Risk Warnings | Evidence-based optimization warnings |
| 4. Assignment Explanation | Deterministic explanation of assignments |
| 5. Improved Route Visualization | Clearer MapLibre route/stop visualization |
| 6. Before vs Optimized Comparison | Legitimate baseline vs optimized metrics |
| 7. Re-optimization | Re-run existing solver for changed inputs |
| 8. What-if Simulation | Non-destructive hypothetical optimization |

## Final Product Goal

The existing Delivery Dispatch & Route Optimization Platform should become easier to understand and operate without changing its core optimization architecture.

The user should be able to:

1. Run/inspect an optimization.
2. Immediately see the overall result.
3. Inspect vehicle capacity.
4. Identify actual constraint problems.
5. Understand why an assignment looks the way it does from available facts.
6. Visually inspect routes and stops.
7. Compare against a real baseline when one exists.
8. Re-optimize when operational inputs change.
9. Test hypothetical scenarios without modifying production state.
