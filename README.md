# Navi Mumbai Emergency Medical Supply Delivery & Route Optimization Platform

[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-f89820?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6db33f?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![OptaPlanner](https://img.shields.io/badge/OptaPlanner-10.2-e01563?logo=redhat&logoColor=white)](https://www.optaplanner.org/)
[![GraphHopper](https://img.shields.io/badge/GraphHopper-OSM%20Routing-2c3e50)](https://www.graphhopper.com/)
[![AWS CDK](https://img.shields.io/badge/AWS%20CDK-v2-ff9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/cdk/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT--0-green.svg)](./LICENSE)

![Navi Mumbai Medical Logistics Command Center](./docs/imgs/demo_screenshot.png)

---

## 📑 Table of Contents

- [Executive Overview](#-executive-overview)
- [The Problem: Emergency Healthcare Logistics](#-the-problem-emergency-healthcare-logistics)
- [System Architecture](#-system-architecture)
  - [High-Level Architectural Diagram](#high-level-architectural-diagram)
  - [End-to-End Data Flow](#end-to-end-data-flow)
- [Decision Intelligence Suite (Features 1–8)](#-decision-intelligence-suite-features-18)
- [Subsystem Deep Dives](#-subsystem-deep-dives)
  - [1. Frontend Web Command Center (`apps_web`)](#1-frontend-web-command-center-apps_web)
  - [2. Optimization & Routing Engine (`apps_opt_engine`)](#2-optimization--routing-engine-apps_opt_engine)
  - [3. Cloud Infrastructure & AWS CDK (`apps_infra`)](#3-cloud-infrastructure--aws-cdk-apps_infra)
- [Demo Dataset: 17 Navi Mumbai Healthcare Facilities](#-demo-dataset-17-navi-mumbai-healthcare-facilities)
- [Prerequisites & Environment Setup](#-prerequisites--environment-setup)
- [Quickstart: Local Development](#-quickstart-local-development)
- [AWS Cloud Deployment Guide](#-aws-cloud-deployment-guide)
- [Utility & Automation Scripts](#-utility--automation-scripts)
- [Repository Directory Structure](#-repository-directory-structure)
- [Verification & Testing](#-verification--testing)
- [License](#-license)

---

## 🌟 Executive Overview

In time-critical healthcare supply logistics, deciding **which vehicle carries which medical consignment, in what sequence, and along exact road network paths** is a high-stakes multi-objective Optimization Problem. Dispatch operations must strictly enforce hard business constraints — vehicle volume and payload weight capacities, strict hospital delivery time windows (Emergency ICU vs. Afternoon Routine Supplies), and owned-fleet vs. contracted-fleet cost priorities — while minimizing total route distances, travel durations, and fleet operating costs.

This repository provides a production-grade, enterprise-scale **Medical Logistics Command Center & Route Optimization Platform** engineered for the **Navi Mumbai & Mumbai Metropolitan Region**.

The solution combines:
* **Interactive 3D WebGL Command Center**: Photorealistic satellite map, 3D extruded buildings, 360° tactical camera orbit, waypoint sequence pins, and 2D/3D route inspection.
* **AI Mathematical Solver (OptaPlanner 10.2 / Apache KIE)**: Hard/Medium/Soft constraint streams calculating optimal Capacitated Vehicle Routing with Time Windows (VRPTW).
* **Real OpenStreetMap Routing Engine (GraphHopper)**: Western India OSM road network matrices calculating turn-by-turn driving distances and transit durations instead of misleading straight-line calculations.
* **Serverless & Containerized AWS Architecture**: Declarative AWS CDK v2 infrastructure provisioning ECS Fargate, DynamoDB, API Gateway, S3, Cognito, and CloudFront.

---

## 🎯 The Problem: Emergency Healthcare Logistics

Navi Mumbai poses distinct operational challenges for emergency medical distribution across its 17 hospital networks, trauma centers, and clinical laboratories:

1. **Critical Delivery Windows**: Emergency ICU drugs, blood plasma, and pathology reagents must arrive within strict time windows (`09:00 - 12:00` morning window vs. standard afternoon supply). Late deliveries carry catastrophic patient outcomes.
2. **Dual-Constraint Vehicle Capacities**: Delivery vans have strict physical volume limits ($m^3$) and payload weight bounds ($kg$). Overloading violates safety and temperature-control standards.
3. **Fleet Economics (Owned vs. Contracted)**:
   * **Owned Fleet**: Temperature-controlled refrigerated vans with fixed operating costs. Priority is to maximize their utilization.
   * **Contracted Fleet**: Auxiliary third-party vehicles activated only when owned capacity is saturated, incurring surcharge costs.
4. **Real Urban Topography & Bottlenecks**: Straight-line distance ("as the crow flies") is ineffective in Navi Mumbai due to creeks, port transit, rail corridors, and one-way flyovers. A hospital 4 km away as the crow flies may require a 13.5 km drive via Sion-Panvel Highway or Thane-Belapur Road.
5. **Multi-Order Consolidation**: Multiple orders destined for the same hospital campus must be bundled into a single delivery visit rather than dispatching redundant vehicles.

---

## 🏗️ System Architecture

### High-Level Architectural Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         1. DISPATCH COMMAND CENTER                          │
│                   React 19 + AWS Cloudscape + MapLibre GL                   │
│                                                                             │
│  - Operator Web Console & KPI Dashboard                                     │
│  - 3D Satellite Radar Map (ArcGIS World Imagery + 3D Building Extrusions)  │
│  - Stop-Sequence Synchronized Route Inspection                              │
│  - Decision Intelligence Suite (Features 1–8)                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (REST API / Cognito JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            2. API & INGESTION LAYER                         │
│                  Amazon API Gateway + AWS Lambda Microservices              │
│                                                                             │
│  - Cognito Authorizer & API Key Usage Plans                                 │
│  - CRUD Handlers (Warehouses, Customers, Vehicles, Orders)                  │
│  - S3 Pre-signed URL Order Upload Pipeline & CSV Ingestion                  │
│  - Asynchronous Dispatch Job Trigger                                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (SQS / SSM / ECS RunTask)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     3. OPTIMIZATION & ROUTING ENGINE                        │
│             Java 21 + Spring Boot 3.5 + OptaPlanner + GraphHopper           │
│                                                                             │
│  - GraphHopper 8.0/11.0: Real OSM Western India road driving matrix cache   │
│  - OptaPlanner 10.2: VRPTW AI Constraint Streams (Hard/Medium/Soft)         │
│  - DistanceMatrix CLI: Batch pre-computation into Amazon S3                │
│  - ECS Fargate Tasks with auto-scaling and spot capacity                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (State & Solution Persistence)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         4. STORAGE & CLOUD FOUNDATION                       │
│                             Amazon Web Services (AWS)                       │
│                                                                             │
│  - Amazon DynamoDB: 7 On-Demand tables for orders, fleet, and solver jobs  │
│  - Amazon S3: OSM road graph caches, CSV orders, and static web assets     │
│  - Amazon CloudFront: Global edge caching & SSL termination                 │
│  - AWS Systems Manager (SSM): Decoupled parameter store discovery          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### End-to-End Data Flow

1. **Master Data & Order Intake**:
   - Master data (warehouses, customer destinations, vehicles) is persisted in DynamoDB.
   - New order batches are uploaded via S3 pre-signed URLs or created via the Web UI.
2. **Matrix Generation**:
   - GraphHopper reads OpenStreetMap PBF data (`western-zone-latest.osm.pbf`) to pre-compute driving distance and travel duration matrices between all hub and hospital pairs, serializing results to S3.
3. **VRPTW Optimization**:
   - Spring Boot solver service loads orders and vehicle profiles from DynamoDB and downloads cached distance matrices from S3.
   - OptaPlanner evaluates thousands of permutations per second against 11 score constraints.
4. **Result Publication & Dispatch**:
   - Completed routes, vehicle assignments, arrival timestamps, and penalty scores are written to `SolverJobs` and `DeliveryJobs` DynamoDB tables.
   - The Web Command Center receives results, rendering synchronized stop cards, 2D route lines, and 3D satellite radar maps.

---

## 🧠 Decision Intelligence Suite (Features 1–8)

The platform provides 8 specialized decision-intelligence tools for logistics planners:

| # | Feature | Operational Value | UI Representation |
| :--- | :--- | :--- | :--- |
| **F1** | **Optimization Summary Dashboard** | Real-time operational overview: total distance saved, vehicle count, travel time, and penalty scores. | Metric KPI Cards & Solver Score Badges |
| **F2** | **Capacity Utilization Breakdown** | Per-vehicle physical volume ($m^3$) and payload weight ($kg$) fill rates with safety thresholds ($0-85\%$ Optimal, $85-100\%$ Full, $>100\%$ Warning). | Dual Cloudscape Progress Bars & Capacity Tags |
| **F3** | **Constraint & Risk Warnings** | Proactive warning system detecting tight delivery windows, potential SLA breaches, or contracted fleet surcharge spikes. | Contextual Alert Banners & Severity Chips |
| **F4** | **Assignment Explanation Engine** | Explainable AI audit log detailing the exact mathematical and operational reasoning behind each vehicle-order assignment. | Detailed Key-Value Audit Drawer & Fact Lists |
| **F5** | **Interactive 3D Satellite Radar Map** | Full WebGL 3D tactical visualization with photorealistic imagery, extruded architecture, 360° orbit, and numbered checkpoint pins. | MapLibre GL JS 3D Canvas with Custom HUD Controls |
| **F6** | **Delta Comparison** | Direct quantitative comparison between naive point-to-point dispatch versus AI-optimized multi-stop routes. | Side-by-side metric tiles & percentage savings badges |
| **F7** | **Dynamic Re-optimization** | On-demand solver triggering to re-balance remaining deliveries when emergency orders arrive or road conditions change. | Re-optimize Action Modal with parameter tuning |
| **F8** | **What-If Simulation Sandbox** | Safe scenario modeling allowing planners to test fleet reductions, volume surges (+20%), or depot closures without mutating production data. | Simulation Drawer with parameter sliders |

---

## 🔍 Subsystem Deep Dives

### 1. Frontend Web Command Center (`apps_web`)

* **Technology Stack**: React 19, TypeScript 5.7, Vite 7, AWS Cloudscape Design System v3, MapLibre GL JS v5, Deck.gl, Immer, Axios.
* **Key Capabilities**:
  * Dual Map Rendering: Standard 2D route map with directional arrows and Interactive 3D Satellite Map with extruded 3D building geometry.
  * Stop & Vehicle Synchronization: Clicking any stop in the route list smoothly animates the 3D camera to focus on the target hospital.
  * Runtime Configuration: Configured via `public/static/appvars.js` generated automatically during AWS CDK deployment.

```text
apps_web/
├── src/
│   ├── api/            # API wrappers and coordinate normalization helpers
│   ├── components/     # Cloudscape layouts, AppHeader, and MapComponent (2D/3D)
│   ├── contexts/       # Auth, Query, and Navigation context providers
│   ├── models/         # TypeScript domain definitions (Vehicle, Order, Route, Stop)
│   ├── pages/          # Home, SolverPage, Vehicle, Warehouse, CustomerLocation
│   └── utils/          # Formatting, geographic calculations, and badge helpers
├── vite.config.ts      # Vite 7 build configuration
└── package.json        # Frontend dependencies and scripts
```

### 2. Optimization & Routing Engine (`apps_opt_engine`)

* **Technology Stack**: Java 21 LTS, Spring Boot 3.5, OptaPlanner 10.2 (Apache KIE), GraphHopper 8.0/11.0, AWS SDK for Java v2, Gradle 8.x (Kotlin DSL).
* **OSM Dataset**: Western India OpenStreetMap extract (`western-zone-latest.osm.pbf`) covering Mumbai, Navi Mumbai, Thane, and Maharashtra transit corridors.
* **Score Constraints Enforced**:
  * **Hard Constraints**: Vehicle weight capacity, volume capacity, arrival time window compliance, driver working hours limit.
  * **Medium Constraints**: Owned vehicle assignment priority (penalize unassigned owned vehicles before using contracted fleet).
  * **Soft Constraints**: Minimize total distance, minimize total travel duration, minimize contracted fleet surcharge fees.

```text
apps_opt_engine/
├── apps/
│   ├── nextday-delivery/    # Spring Boot REST microservice & OptaPlanner solver
│   └── distancecache-util/  # CLI tool to precompute OSM road distance matrices
├── core/
│   ├── core-impl/           # AWS DynamoDB, S3, and SSM SDK integrations
│   └── routing/             # GraphHopper routing graph & matrix calculator
├── scripts/                 # Dockerfiles for ECS container task images
└── build_opt_engine.sh      # Automated Geofabrik OSM downloader & build script
```

### 3. Cloud Infrastructure & AWS CDK (`apps_infra`)

* **Technology Stack**: AWS CDK v2.252, TypeScript 5.6, Node.js 24 runtime for Lambdas.
* **CDK Stacks Dependency Graph**:

```text
       ┌────────────────────────┐
       │ PersistentBackendStack │ (VPC, DynamoDB 7 tables, Cognito User Pool)
       └───────────┬────────────┘
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
┌─────────────────┐       ┌──────────────────────┐
│  BackendStack   │       │ OrderUploadPipeStack │
│ (API GW, Lambdas│       │ (S3 Order Ingestion, │
│  S3 Web/CloudFr)│       │  Async Event Pipe)   │
└─────────────────┘       └──────────────────────┘
    │                             │
    ▼                             ▼
┌──────────────────┐      ┌──────────────────────┐
│ DistanceCacheStk │      │    OptEngineStack    │
│ (ECS GH Matrix)  │      │ (ECS OptaPlanner)    │
└──────────────────┘      └──────────────────────┘
```

* **Organization SCP Compliant**: Explicitly configured for `ap-south-1` with declared availability zones (`ap-south-1a`, `ap-south-1b`) to bypass restricted `ec2:DescribeAvailabilityZones` permissions.
* **Decoupled Architecture**: Stacks communicate via AWS SSM Parameter Store keys rather than rigid CloudFormation exports, enabling safe incremental updates.

---

## 🏥 Demo Dataset: 17 Navi Mumbai Healthcare Facilities

The platform includes pre-configured geographic and operational profiles for Navi Mumbai's medical supply chain:

| Location Name | Facility Type | Area | Coordinates | Delivery Window |
| :--- | :--- | :--- | :--- | :--- |
| **Navi Mumbai Medical Distribution Hub** | **Central Depot** | Belapur Sector 11 | `19.0180, 73.0400` | Departure Point |
| **Fortis Hiranandani Hospital** | Emergency Hospital | Vashi | `19.0760, 72.9980` | `09:00 - 11:30` (ICU) |
| **Apollo Hospitals Navi Mumbai** | Multi-Specialty | Belapur CBD | `19.0144, 73.0380` | `10:00 - 13:00` |
| **MGM Hospital & Research Centre** | Tertiary Care | Vashi Sector 3 | `19.0680, 72.9970` | `09:30 - 12:00` |
| **DY Patil Hospital & Trauma Center** | Super Specialty | Nerul | `19.0330, 73.0190` | `11:00 - 14:00` |
| **Kokilaben Dhirubhai Ambani Hospital** | Multi-Specialty | Kopar Khairane | `19.1020, 73.0110` | `10:30 - 13:30` |
| **Reliance Hospital** | Super Specialty | Kopar Khairane | `19.1120, 73.0130` | `11:00 - 14:30` |
| **Terna Specialty Hospital** | Medical Research | Nerul West | `19.0410, 73.0140` | `13:00 - 16:00` |
| **Seawoods Advanced Diagnostics** | Diagnostic Hub | Seawoods Sector 40 | `19.0190, 73.0150` | `12:00 - 15:00` |
| **Kharghar Diagnostic Lab & Clinic** | Pathology Outpost | Kharghar Sector 12 | `19.0430, 73.0670` | `14:00 - 17:00` |
| **Airoli Critical Care Institute** | Critical Care Unit | Airoli Sector 5 | `19.1570, 72.9990` | `13:30 - 16:30` |
| **Panvel Advanced Trauma Care Centre** | Trauma Care Unit | Panvel City | `18.9894, 73.1175` | `15:00 - 18:00` |
| **Kamothe Primary Health Centre** | Community Clinic | Kamothe Sector 6 | `19.0230, 73.0880` | `14:30 - 17:30` |
| **Kalamboli Emergency Supply Depot** | Supply Outpost | Kalamboli | `19.0340, 73.1040` | `15:30 - 18:00` |
| **Rabale Industrial Health Clinic** | Industrial Health | Rabale MIDC | `19.1350, 73.0070` | `12:30 - 15:30` |
| **Sanpada Multi-Specialty Clinic** | Specialist Clinic | Sanpada Sector 5 | `19.0620, 73.0080` | `10:00 - 12:30` |
| **Juinagar Community Healthcare Centre** | Health Outpost | Juinagar Sector 24 | `19.0480, 73.0160` | `11:30 - 14:00` |

---

## ⚙️ Prerequisites & Environment Setup

| Component | Required Version | Verification Command |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x < 25.x` | `node -v` |
| **pnpm** | `>= 9.x` | `pnpm -v` |
| **Java SDK** | OpenJDK 21 LTS | `java -version` |
| **Docker** | Latest Desktop or Engine | `docker version` |
| **AWS CLI** | Version 2.x | `aws --version` |
| **AWS CDK** | v2.252 (bundled locally) | `npx cdk --version` |

---

## 🚀 Quickstart: Local Development

### 1. Web Application

```bash
# 1. Navigate to web directory
cd apps_web

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev --port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Command Center starts with full mock and simulated data enabled for instant evaluation.

### 2. Optimization Engine (Local)

```bash
# 1. Navigate to optimization engine directory
cd apps_opt_engine

# 2. Download OSM Western India map and build artifacts
./build_opt_engine.sh

# 3. Run the Spring Boot Solver service locally
./gradlew :apps:nextday-delivery:bootRun --args="--spring.profiles.active=dev"
```

Available Local Endpoints:
* `POST http://localhost:8080/opt-engine/solve`: Trigger asynchronous route optimization.
* `GET http://localhost:8080/opt-engine/status/{jobId}`: Query solver progress and route solutions.
* `GET http://localhost:8080/actuator/health`: Spring Boot health indicator and GraphHopper status.

---

## ☁️ AWS Cloud Deployment Guide

The deployment targets AWS Account `564159155699` in Region `ap-south-1` (Mumbai).

### Step 1: Bootstrap CDK (First Time Only)

```bash
cd apps_infra
pnpm install
npx cdk bootstrap aws://564159155699/ap-south-1
```

### Step 2: Synthesize & Validate CloudFormation Templates

```bash
pnpm synth
```
This generates templates for all 5 stacks without making AWS modifications.

### Step 3: Deploy All Stacks

```bash
pnpm deploy:dev
```

### Step 4: Post-Deployment Master Data & Sample Order Seeding

```bash
# Seed warehouse, vehicles, and hospital locations into DynamoDB
./scripts/upload-master-data.sh

# Seed sample hospital delivery orders
./scripts/dev-sample-order.sh

# Fetch generated web runtime variables (S3 -> local web app)
./scripts/pull-appvars-js.sh
```

---

## 🛠️ Utility & Automation Scripts

The [`apps_infra/scripts/`](./apps_infra/scripts) directory provides operational shell utilities:

| Script | Purpose |
| :--- | :--- |
| `upload-master-data.sh` | Inserts warehouse depots, vehicle profiles, and hospital customer destinations into DynamoDB. |
| `dev-sample-order.sh` | Seeds sample emergency medical orders with volume, weight, and delivery time windows. |
| `upload-order-with-presigned-url.sh` | Demonstrates the external system intake pipeline by uploading an order CSV via S3 pre-signed URL. |
| `pull-appvars-js.sh` | Downloads the CDK-generated `appvars.js` from S3 to `apps_web/public/static/appvars.js` for local development against live AWS resources. |
| `open-demo-webui.sh` | Queries CloudFormation stack outputs and launches the deployed CloudFront web application in your default browser. |

---

## 📂 Repository Directory Structure

```text
delivery-routes-optimization-for-logistics/
├── README.md                  # Master project documentation (this file)
├── LICENSE                    # MIT-0 License
│
├── apps_web/                  # Frontend Web Command Center (React 19 + Cloudscape + MapLibre)
│   ├── src/
│   │   ├── api/               # API clients & coordinate normalization
│   │   ├── components/        # AppLayout, Navigation, and MapComponent (2D/3D)
│   │   ├── contexts/          # State management contexts
│   │   ├── pages/             # Dispatch Dashboard, Vehicle Details, Hub Management
│   │   └── utils/             # Metric formatters, distance calculators, badges
│   ├── public/                # Static assets, icons, and appvars template
│   ├── vite.config.ts         # Vite build configuration
│   └── package.json           # Frontend package manifest
│
├── apps_opt_engine/           # Optimization & Routing Engine (Java 21 + Spring Boot 3.5)
│   ├── apps/
│   │   ├── nextday-delivery/  # OptaPlanner 10.2 VRPTW Solver service
│   │   └── distancecache-util/# GraphHopper distance matrix CLI utility
│   ├── core/
│   │   ├── core-impl/         # AWS SDK v2 data access (DynamoDB, S3, SSM)
│   │   └── routing/           # GraphHopper Western India OSM route calculator
│   ├── scripts/               # ECS Fargate Dockerfiles
│   ├── build_opt_engine.sh    # Geofabrik Western Zone OSM downloader & builder
│   └── build.gradle.kts       # Multi-module Gradle build script
│
├── apps_infra/                # Cloud Infrastructure (AWS CDK v2 in TypeScript)
│   ├── src/
│   │   ├── bin/               # CDK app entry point
│   │   └── stacks/            # 5 CloudFormation stacks (Persistent, Backend, Opt, etc.)
│   ├── scripts/               # Master data upload & order ingestion helper scripts
│   ├── cdk.json               # CDK app configuration & asset exclusions
│   └── package.json           # Infrastructure package manifest
│
└── docs/                      # Architectural specifications and diagrams
    ├── architecture.md        # Deep dive into serverless + ECS hybrid architecture
    ├── quickstart.md          # Step-by-step walkthrough for developers
    └── imgs/                  # Architecture diagrams and UI screenshots
```

---

## 🧪 Verification & Testing

### Frontend Type-checking & Build
```bash
cd apps_web
pnpm typecheck
pnpm build
```

### Optimization Engine Compilation & Unit Tests
```bash
cd apps_opt_engine
./gradlew check
```

### AWS CDK Synthesis & Linting
```bash
cd apps_infra
pnpm build
pnpm test
pnpm synth
```

---

## 📜 License

This project is licensed under the **MIT-0 License**. See the [`LICENSE`](./LICENSE) file for complete details.
