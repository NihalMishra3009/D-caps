# AWS SHIP-IT 5-MINUTE PREFLIGHT

**STATUS: BLOCKED**

| Area | Status | Finding | Action |
| :--- | :--- | :--- | :--- |
| **AWS IAM / SCP** | **BLOCKER** | User `admin-cli` is blocked by Organization Service Control Policy (`p-bnh8d2ig`) with an explicit deny on `ec2:DescribeAvailabilityZones` during CDK synthesis. | Update SCP to allow EC2 in `ap-south-1`, OR hardcode explicit AZs (`ap-south-1a`, `ap-south-1b`) in `PersistentBackendStack.ts` / `cdk.context.json` to bypass VPC lookup. |
| **Containers / Docker** | **BLOCKER** | CDK builds 2 Docker container assets (`distancecache-util` and `nextday-delivery`) for ARM64 via `DockerImageAsset` during `cdk deploy`. | Ensure Docker Desktop/Engine is active and running with multi-arch/buildx support before deploying. |
| **OSM Map Data** | **WARNING** | `build_opt_engine.sh` and Dockerfiles currently bundle South Korea OSM (`south-korea-latest.osm.pbf`), while dataset and routing are in Navi Mumbai, India (`19.03° N, 73.02° E`). | Update `OSM_URL` to Maharashtra / Western India extract (`western-zone-latest.osm.pbf`) before generating production distance cache. |
| **CDK Bootstrap** | **WARNING** | Target account `564159155699` in `ap-south-1` must have CDK modern bootstrap stack (`CDKToolkit`) provisioned. | Run `npx cdk bootstrap aws://564159155699/ap-south-1`. |
| **CDK Code & Types** | **OK** | All 5 stacks, constructs, and Lambda bundling definitions compile with zero TypeScript errors. | Ready for synthesis once AZ lookup blocker is resolved. |
| **Frontend Assets** | **OK** | Production bundle in `apps_web/dist` is fully built with vendor code splitting, 2D/3D maps, and road geometries. | Ready for S3 deployment via `BackendStack`. |

---

## 1. CDK Architecture & Stacks

- **CDK App Entry Point**: [`apps_infra/bin/app.ts`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra/bin/app.ts) (`npx ts-node --prefer-ts-exts bin/app.ts`)
- **CDK Config / Context Files**:
  - [`apps_infra/cdk.json`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra/cdk.json) (CLI entry point, feature flags, asset exclusions)
  - [`apps_infra/config/default.yml`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra/config/default.yml) (Primary application configuration schema)
  - [`apps_infra/cdk.context.json`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_infra/cdk.context.json) (Currently empty `{}`)
- **Target AWS Account**: `564159155699` (configured in `default.yml`, overridable via `CDK_DEFAULT_ACCOUNT`)
- **Target AWS Region**: `ap-south-1` (configured in `default.yml`, overridable via `CDK_DEFAULT_REGION`)
- **Stacks & Exact Names** (5 Stacks):
  1. `PersistentBackendStack` -> **`devproto-PersistentBackend`** (ID: `Dev-PersistentBackend`)
  2. `BackendStack` -> **`devproto-Backend`** (ID: `Dev-Backend`)
  3. `OrderUploadStack` -> **`devproto-OrderUpload`** (ID: `Dev-OrderUpload`)
  4. `DistanceCacheStack` -> **`devproto-DistanceCache`** (ID: `Dev-DistanceCache`)
  5. `OptimizationEngineStack` -> **`devproto-OptimizationEngine`** (ID: `Dev-OptEngine`)

---

## 2. AWS Resources Breakdown

| Resource Type | Count | Exact Names / Identifiers |
| :--- | :---: | :--- |
| **API Gateway REST APIs** | **2** | `devproto-WebApi`, `devproto-OrderApi` |
| **API Endpoints** | **30** | **WebApi (28)**:<br>• `GET/POST /api/web/customer-location`<br>• `GET/PUT/DELETE /api/web/customer-location/{customerLocationId}`<br>• `GET/POST /api/web/warehouse`<br>• `GET/PUT/DELETE /api/web/warehouse/{warehouseId}`<br>• `GET/POST /api/web/vehicle`<br>• `GET/PUT/DELETE /api/web/vehicle/{vehicleId}`<br>• `GET /api/web/order`, `GET /api/web/order/{orderId}`<br>• `GET /api/web/solver-job`, `GET /api/web/solver-job/{solverJobId}`<br>• `GET /api/web/delivery-job`, `GET /api/web/delivery-job/{deliveryJobId}`<br>• `GET /api/web/delivery-solver-job`, `GET /api/web/delivery-solver-job/{id}`<br>• `GET /api/web/dist-cache`, `GET /api/web/dist-cache/{distCacheId}`<br>• `GET /api/web/build-dist-cache`, `GET /api/web/build-dist-cache/{warehouseCode}`<br>• `GET /api/web/presigned-url`<br>**OrderApi (2)**:<br>• `GET /upload/url`<br>• `POST /dispatch` |
| **Lambda Functions** | **13** | **Web API (10)**: `customer-location-manager`, `warehouse-manager`, `vehicle-manager`, `orders-query`, `solver-job-query`, `delivery-jobs-query`, `delivery-job-by-solver-job-query`, `distance-cache-query`, `rebuild-distance-cache`, `get-s3-presigned-url`<br>**Order API (3)**: `get-s3-presigned-url`, `start-order-dispatch-task`, `create-order-batch` |
| **DynamoDB Tables** | **7** | `devproto-customer-locations` (GSI: `idx-customer-locations-warehouse-code`)<br>`devproto-warehouses` (GSI: `idx-warehouses-code`)<br>`devproto-vehicles`<br>`devproto-orders` (GSI: `idx-orders-status`)<br>`devproto-solver-jobs`<br>`devproto-delivery-jobs` (GSI: `idx-delivery-job-solver-job`)<br>`devproto-distance-cache` |
| **S3 Buckets** | **3** | `devproto-distance-cache-564159155699-ap-south-1`<br>`devproto-WebBucket-<hash>` (CloudFront origin for website)<br>`devproto-order-uploads-564159155699-ap-south-1` |
| **Cognito Resources** | **3** | `devproto-UserPool` (Email sign-in, self-signup disabled)<br>`UserPoolClient` (USER_PASSWORD_AUTH, USER_SRP_AUTH)<br>`AdminUser` (`nihalmishra3009@gmail.com`) |
| **ECS / Fargate Tasks** | **4** | **Clusters (2)**: `devproto-DistanceCache`, `devproto-OptEngine`<br>**Task Definitions (2)**: DistanceCache Fargate Task, OptEngine Fargate Task |
| **ECR Container Assets** | **2** | `distanceCacheDockerPath` (`apps_opt_engine/build/distancecache-util`)<br>`optEngineDockerPath` (`apps_opt_engine/build/nextday-delivery`) |
| **CloudFront Distributions** | **1** | S3 Origin Access Control (OAC) distribution with HTTPS redirect and SPA `/index.html` fallback |
| **SSM Parameters** | **23** | `/DevProto/VPC/Common/VpcId`<br>`/DevProto/Ddb/Orders/TableName`<br>`/DevProto/S3/Orders/BucketName`<br>`/DevProto/Ddb/Orders/Index/Status`<br>`/DevProto/Ddb/SolverJobs/TableName`<br>`/DevProto/Ddb/DeliveryJobs/TableName`<br>`/DevProto/Ddb/DeliveryJobs/Index/SolverJobId`<br>`/DevProto/Ddb/CustomerLocations/TableName`<br>`/DevProto/Ddb/CustomerLocations/Index/WarehouseCode`<br>`/DevProto/Ddb/Warehouses/TableName`<br>`/DevProto/Ddb/Warehouses/Index/WarehouseCode`<br>`/DevProto/Ddb/Vehicles/TableName`<br>`/DevProto/Api/Order/Upload/Url`<br>`/DevProto/Api/Order/Upload/Key`<br>`/DevProto/S3/DistanceCache/BucketName`<br>`/DevProto/DDB/DistanceCache/TableName`<br>`/DevProto/ECS/DistanceCache/ClusterName`<br>`/DevProto/ECS/DistanceCache/AsgCapacityProvider`<br>`/DevProto/ECS/DistanceCache/TaskDefArn`<br>`/DevProto/ECS/DistanceCache/ContainerName`<br>`/DevProto/ECS/OptEngine/ClusterName`<br>`/DevProto/ECS/OptEngine/AsgCapacityProvider`<br>`/DevProto/ECS/OptEngine/TaskDefArn`<br>`/DevProto/ECS/OptEngine/ContainerName` |

---

## 3. Deployment Requirements

### AWS ACCOUNT SETUP
- AWS Account ID active: `564159155699`
- IAM permissions to manage: VPC, EC2, NAT Gateway, DynamoDB, S3, Cognito, API Gateway, Lambda, CloudFront, ECS, ECR, IAM, SSM.
- **Service Control Policy (SCP) resolution**: Ensure `ec2:DescribeAvailabilityZones` is permitted, or explicitly supply AZ context.

### LOCAL MACHINE SETUP
- Node.js 18+ / 20+ & pnpm
- AWS CLI with credentials authenticated to `564159155699`
- Docker Desktop or Docker Engine running with Linux/ARM64 support
- Java 21 (Corretto 21) if re-packaging the optimization engine

### CDK BOOTSTRAP
- Execute once before deploy:
  ```bash
  npx cdk bootstrap aws://564159155699/ap-south-1
  ```

### CREATED AUTOMATICALLY BY CDK
- 1 VPC (2 AZs, 1 NAT Gateway, 2 Public & 2 Private subnets)
- 7 DynamoDB Tables with GSIs and PITR
- 3 S3 Buckets (Encrypted, Block All Public Access)
- 2 API Gateway REST APIs with CORS and Usage Plans
- 13 Lambda functions bundled via esbuild
- Cognito User Pool, Client, and Admin User seed
- 1 CloudFront Distribution with OAC
- 2 ECS Clusters, CloudWatch Log Groups, and Fargate Task Definitions
- 23 SSM Parameters storing resource ARNs/Names across stacks

### MANUAL CONFIGURATION
- **Admin Password**: After deployment, Cognito sends a temporary login password to `nihalmishra3009@gmail.com`.
- **Target Account Override**: If deploying to a different AWS account than `564159155699`, update `apps_infra/config/default.yml` or export `CDK_DEFAULT_ACCOUNT`.

---

## 4. Configuration Details

- **AWS Account ID**: `564159155699`
- **AWS Region**: `ap-south-1`
- **Namespace**: `devproto`
- **Admin Email**: `nihalmishra3009@gmail.com` (Display name: `Administrator`)
- **Required Environment Variables**:
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (or standard AWS SSO / credentials file)
  - Optional overrides: `CDK_DEFAULT_ACCOUNT`, `CDK_DEFAULT_REGION`, `ADMINISTRATOR_EMAIL`
- **Required External SSM Parameters**: `0` (CDK creates and populates all 23 parameters internally).
- **Secrets & API Keys**: CDK provisions the `OrderApiKey` automatically and publishes its key ID to `/DevProto/Api/Order/Upload/Key`.

---

## 5. Containers & Engine

- **Dockerfiles**:
  - Distance Cache: [`apps_opt_engine/scripts/Dockerfile.distancecache`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_opt_engine/scripts/Dockerfile.distancecache)
  - Optimization Engine: [`apps_opt_engine/scripts/Dockerfile.nextdaydelivery`](file:///c:/AWS%20project/delivery-routes-optimization-for-logistics/apps_opt_engine/scripts/Dockerfile.nextdaydelivery)
- **Base Image**: `amazoncorretto:21`
- **Target Architecture**: `ARM64` (`distCacheArchitecture: arm64`, `optEngineArchitecture: arm64`)
- **CPU Allocation**: `4096` (4 vCPU) per task
- **Memory Allocation**: `8192` (8 GB) per task
- **ECR Requirements**: Handled natively by CDK `DockerImageAsset`. Local Docker daemon builds images during `cdk deploy` and pushes directly to CDK asset repositories.
- **GraphHopper OSM Data Status**:
  - **CURRENT CODE USES SOUTH KOREA DATA (`south-korea-latest.osm.pbf`)**.
  - `build_opt_engine.sh` defaults to `https://download.geofabrik.de/asia/south-korea-latest.osm.pbf`.
  - While the frontend displays Navi Mumbai, India, the backend container bundles South Korea roads. Running solver jobs in ECS with Mumbai coordinates against this container will result in routing calculation errors unless updated with Indian/Maharashtra OSM data.

---

## 6. API & Authentication

- **Web REST API (`devproto-WebApi`)**:
  - **Auth**: Cognito User Pools Authorizer (`CognitoAuthorizer`).
  - **CORS**: Enabled for all origins (`ALL_ORIGINS`, `ALL_METHODS`).
  - **Runtime Config Injection**: `BackendStack` automatically generates `static/appvars.js` into the S3 bucket with runtime variables:
    ```javascript
    var appVariables = {
      REGION: "ap-south-1",
      USERPOOL_ID: "<CognitoUserPoolId>",
      USERPOOL_CLIENT_ID: "<UserPoolClientId>",
      API_URL: "<WebApiUrl>"
    };
    ```
- **Order Ingestion REST API (`devproto-OrderApi`)**:
  - **Auth**: API Key (`x-api-key` header) validated against `OrderUsagePlan`.
  - **CORS**: Enabled for all origins.

---

## 7. Deployment Dependency Order

```
                          ┌───────────────────────────┐
                          │  PersistentBackendStack   │
                          │(VPC, DDB, S3, Cognito, CF)│
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           │                            │                           │
           ▼                            ▼                           ▼
┌─────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
│    BackendStack     │      │  OrderUploadStack  │      │ DistanceCacheStack │
│ (Web API, Lambdas,  │      │(Order API, Lambdas,│      │ (ECS Dist Cache,   │
│ S3 Web Deployment)  │      │   Upload Bucket)   │      │ Task Def, SSM)     │
└─────────────────────┘      └────────────────────┘      └────────────────────┘
                                                                    │
                                                                    ▼
                                                         ┌────────────────────┐
                                                         │OptEngineStack      │
                                                         │(ECS Solver Engine, │
                                                         │ Task Def, SSM)     │
                                                         └────────────────────┘
```

1. **Step 1**: `devproto-PersistentBackend` (must complete first to output VPC, DynamoDB tables, and S3 buckets).
2. **Step 2**: `devproto-Backend`, `devproto-OrderUpload`, `devproto-DistanceCache`, and `devproto-OptimizationEngine` can deploy in parallel or sequentially.

---

## 8. Blockers & Remediation Summary

### 1. BLOCKER: Organization SCP Deny on `ec2:DescribeAvailabilityZones`
- **Issue**: Running `cdk synth` fails because AWS Organization policy `arn:aws:organizations::216625555430:policy/o-n68egc4415/service_control_policy/p-bnh8d2ig` explicitly denies `ec2:DescribeAvailabilityZones` to `user/admin-cli`.
- **Remediation**:
  1. Grant `ec2:DescribeAvailabilityZones` in the SCP, OR
  2. In `apps_infra/src/stacks/PersistentBackendStack.ts`, explicitly provide `availabilityZones: ['ap-south-1a', 'ap-south-1b']` in `new ec2.Vpc(...)` so CDK does not attempt an account query, OR populate `cdk.context.json`.

### 2. BLOCKER: Local Docker Daemon Inactive
- **Issue**: `DistanceCacheStack` and `OptimizationEngineStack` instantiate `DockerImageAsset`. If Docker is not running locally during `cdk deploy`, image packaging fails immediately.
- **Remediation**: Start Docker Desktop/Daemon with ARM64 support prior to invoking `cdk deploy`.

### 3. WARNING: South Korea OSM Map Data in Container Build
- **Issue**: `build_opt_engine.sh` packages South Korea OpenStreetMap data. Distance cache and vehicle route solving in ECS will fail for Navi Mumbai coordinates.
- **Remediation**: Replace `south-korea-latest.osm.pbf` with Maharashtra / Western Zone OSM data (`western-zone-latest.osm.pbf`) prior to final container deployment.
