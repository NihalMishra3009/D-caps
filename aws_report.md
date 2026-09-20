# AWS Project Requirements Report
**Project:** SHIP IT — Delivery Routes Optimization for Logistics  
**Scope:** AWS Requirements Extraction (Inspection Only — No Code Modifications)  
**Extracted Date:** September 20, 2026  

---

## 1. Current AWS Architecture

The project employs a serverless and containerized hybrid microservices architecture on AWS, defined declaratively using **AWS CDK (TypeScript v2)**.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               CloudFront Distribution                  │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │   S3 Website Bucket     │
                                  └─────────────────────────┘
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                 API Gateway REST API                   │
                    │         (Cognito Authorizer / API Key Auth)            │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                 AWS Lambda Functions                   │
                    │               (Node.js 20.x / 24.x)                    │
                    └──────────────┬──────────────────────────┬──────────────┘
                                   │                          │
                                   ▼                          ▼
                    ┌─────────────────────────┐   ┌──────────────────────────┐
                    │     DynamoDB Tables     │   │      ECS Fargate         │
                    │  (7 On-Demand Tables)   │   │  (OptEngine & Cache)     │
                    └─────────────────────────┘   └──────────────────────────┘
```

- **Frontend Hosting**: React 19 single-page application built with Vite and Cloudscape Design System, deployed to S3 and served globally via CloudFront with Origin Access Control (OAC).
- **Authentication**: Amazon Cognito User Pool & User Pool Client managing identity, JWT verification, and administrative user creation.
- **REST APIs**: Two API Gateway REST APIs (`WebApi` with Cognito User Pools Authorizer and `OrderApi` with API Key auth).
- **Serverless Compute**: 14 Node.js Lambda functions handling CRUD entity operations, query execution, S3 presigned URL generation, and async ECS task invocation.
- **Data Persistence**: 7 Amazon DynamoDB tables with Global Secondary Indexes (GSIs) and On-Demand (PAY_PER_REQUEST) billing, plus 3 S3 buckets for distance cache binaries, order CSV uploads, and website assets.
- **Optimization Compute**: On-demand Amazon ECS Fargate container tasks running OptaPlanner (Java 21) and GraphHopper routing engine within private VPC subnets.
- **Configuration Bus**: AWS Systems Manager (SSM) Parameter Store to broadcast resource names, ARNs, API endpoints, and VPC/ECS references across CDK stacks.

---

## 2. AWS Services Inventory

| AWS Service | Classification | Purpose in Project |
| :--- | :--- | :--- |
| **AWS CDK (v2)** | **IMPLEMENTED** | Infrastructure as Code defining 5 modular stacks (`apps_infra`). |
| **Amazon VPC** | **IMPLEMENTED** | Isolated network with 2 AZs, Public + Private subnets, 1 NAT Gateway. |
| **Amazon DynamoDB** | **IMPLEMENTED** | Primary database (7 tables: locations, warehouses, vehicles, orders, solver jobs, delivery jobs, distance cache). |
| **Amazon S3** | **IMPLEMENTED** | Object storage (3 buckets: order uploads, distance cache matrix, web bundle). |
| **Amazon Cognito** | **IMPLEMENTED** | Identity management via User Pool, User Pool Client, and CfnUserPoolUser admin creation. |
| **Amazon CloudFront** | **IMPLEMENTED** | CDN distribution serving S3 static website with HTTPS redirection and custom error routing. |
| **Amazon API Gateway** | **IMPLEMENTED** | 2 REST APIs (`WebApi` and `OrderApi`) with Cognito authorizer, usage plans, and API keys. |
| **AWS Lambda** | **IMPLEMENTED** | Serverless handlers (Node.js 20.x) for API CRUD endpoints, S3 presigned URLs, and ECS task triggers. |
| **Amazon ECS / Fargate** | **IMPLEMENTED** | On-demand container tasks for OptaPlanner route solver and distance cache calculator (4 vCPU / 8GB RAM). |
| **Amazon ECR** | **IMPLEMENTED** | Container image asset building via CDK `ContainerImage.fromAsset`. |
| **AWS Systems Manager (SSM)** | **IMPLEMENTED** | Parameter Store keys sharing VPC, DynamoDB, S3, and ECS resource references across stacks. |
| **AWS IAM** | **IMPLEMENTED** | Execution roles, task roles, and fine-grained least-privilege inline policy statements. |
| **Amazon CloudWatch** | **IMPLEMENTED** | Logs driver (`awslogs`) for ECS container task output and Lambda execution logs. |
| **AWS Secrets Manager** | **REFERENCED** | SDK utility support in `SecretsManagerUtility.java` for optional secret retrieval. |
| **Route 53 / ACM** | **NOT USED** | Custom domain and SSL certificates are not currently defined in CDK constructs. |

---

## 3. CDK Stack Inventory

| CDK Stack | File | Purpose | AWS Resources | Depends On | Outputs / Exported SSM |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Dev-PersistentBackend` | `PersistentBackendStack.ts` | Provision retained core infrastructure | VPC (2 AZs, NAT), 7 DynamoDB tables, 2 S3 buckets, Cognito User Pool + Client, CloudFront Distribution, 12 SSM Parameters | None | `WebHostingDomain` CloudFront output, SSM Params for VPC/DDB/S3/Cognito |
| `Dev-Backend` | `BackendStack.ts` | Web API & web app bundle deployment | API Gateway (`WebApi`), Cognito Authorizer, 11 Lambda functions, 2 S3 Bucket Deployments (`WebsiteDeployment`, `AppVariablesDeployment`) | `Dev-PersistentBackend` | API Gateway REST URL exported to `appvars.js` |
| `Dev-OrderUpload` | `OrderUploadStack.ts` | Batch order CSV upload pipeline | S3 upload bucket, API Gateway (`OrderApi`), API Key, Usage Plan, 3 Lambda functions, S3 Event Notification, 2 SSM Parameters | `Dev-PersistentBackend` | `OrderUploadApiUrl`, `OrderUploadApiKey` in SSM |
| `Dev-DistanceCache` | `DistanceCacheStack.ts` | Distance matrix calculation container | ECS Cluster (`DistanceCache`), Fargate Task Definition (4 vCPU / 8GB RAM ARM64), IAM Task Role, 4 SSM Parameters | `Dev-PersistentBackend` | ECS Cluster Name, Task Def ARN, Container Name in SSM |
| `Dev-OptEngine` | `OptimizationEngineStack.ts` | OptaPlanner route optimization container | ECS Cluster (`OptEngine`), Fargate Task Definition (4 vCPU / 8GB RAM ARM64), IAM Task Role, 4 SSM Parameters | `Dev-PersistentBackend` | ECS Cluster Name, Task Def ARN, Container Name in SSM |

---

## 4. AWS Resource Inventory

| Resource Name | AWS Service | Defined Where | Purpose | Required For |
| :--- | :--- | :--- | :--- | :--- |
| `Vpc` | VPC | `PersistentBackendStack.ts` | Isolated network for ECS Fargate & Lambdas | Container execution & network isolation |
| `CustomerLocationsTable` | DynamoDB | `PersistentBackendStack.ts` | Stores hospital and medical delivery nodes | Route optimization & master data |
| `WarehousesTable` | DynamoDB | `PersistentBackendStack.ts` | Stores distribution hub depots | Route origin lookup & dispatch planning |
| `VehiclesTable` | DynamoDB | `PersistentBackendStack.ts` | Stores fleet vehicle capacities & grades | Vehicle assignment & capacity constraints |
| `OrdersTable` | DynamoDB | `PersistentBackendStack.ts` | Stores hospital delivery consignments | Solver input & batch order tracking |
| `SolverJobsTable` | DynamoDB | `PersistentBackendStack.ts` | Stores optimization solver job metadata & score | Dispatch run status tracking |
| `DeliveryJobsTable` | DynamoDB | `PersistentBackendStack.ts` | Stores calculated vehicle routes & stop sequences | Map route rendering & stop ordering |
| `DistanceCacheTable` | DynamoDB | `PersistentBackendStack.ts` | Stores distance calculation history & status | Pre-computed road distance matrix |
| `DistanceCacheBucket` | S3 | `PersistentBackendStack.ts` | Stores serialized distance cache binary/json matrix | GraphHopper speed optimization |
| `WebBucket` | S3 | `PersistentBackendStack.ts` | Stores compiled React SPA static web bundle | Web application hosting |
| `OrderUploadsBucket` | S3 | `OrderUploadStack.ts` | Holds uploaded raw order CSV files | Automated order ingestion pipeline |
| `UserPool` | Cognito | `PersistentBackendStack.ts` | User directory & authentication service | User sign-in & JWT issuance |
| `UserPoolClient` | Cognito | `PersistentBackendStack.ts` | App client interface for web frontend | Amplify Auth integration |
| `AdminUser` | Cognito | `PersistentBackendStack.ts` | Provisioned administrator account | First-time system login |
| `Distribution` | CloudFront | `PersistentBackendStack.ts` | Global CDN with HTTPS & OAC | Public web application delivery |
| `RestApi-Web` | API Gateway | `ApiWeb.ts` | REST API for web frontend CRUD & queries | Frontend-backend communication |
| `RestApi-Order` | API Gateway | `OrderUploadStack.ts` | REST API for batch order dispatch | System integration & API Key auth |
| `EcsTask` (DistanceCache) | ECS Fargate | `DistanceCacheStack.ts` | Container task calculating road distance matrix | Distance cache generation |
| `EcsTask` (OptEngine) | ECS Fargate | `OptimizationEngineStack.ts` | Container task running OptaPlanner & GraphHopper | VRPTW route optimization |

---

## 5. Frontend → AWS Requirements

```
FRONTEND (React SPA / Vite / Cloudscape)
  ↓
AUTH (AWS Amplify v6 Auth → Cognito User Pool)
  ↓
API (AWS Amplify v6 REST → API Gateway `WebApi` with JWT Authorization Header)
  ↓
AWS BACKEND (Lambda Functions → DynamoDB / S3 / ECS Fargate)
```

### Required Runtime Configuration (`public/static/appvars.js`)
Generated automatically during CDK deployment (`BackendStack.ts`):

```javascript
var appVariables = {
  REGION: "ap-south-1",
  USERPOOL_ID: "ap-south-1_xxxxxxxxx",
  USERPOOL_CLIENT_ID: "xxxxxxxxxxxxxxxx──────────",
  API_URL: "https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod/"
};
```

- **Cognito Integration**: `aws-amplify/auth` authenticates users against the User Pool and attaches the `Authorization` ID token header to API requests.
- **Fallback**: Local offline mode with fallback seed data operates automatically when AWS credentials or endpoints are absent.

---

## 6. Backend → AWS Requirements

```
BACKEND (Node.js Lambda Handlers)
  ↓
AWS SDK v3 (@aws-sdk/client-dynamodb, @aws-sdk/client-s3, @aws-sdk/client-ssm, @aws-sdk/client-ecs)
  ↓
AWS SERVICES (DynamoDB, S3, SSM Parameter Store, ECS RunTask)
```

### Lambda Dependency Matrix

| Function Name | Purpose | Target AWS Services | IAM Permissions Needed | Environment Variables |
| :--- | :--- | :--- | :--- | :--- |
| `customer-location-manager` | CRUD for delivery locations | DynamoDB (`customer-locations`) | `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Scan`, `Query` | `TABLE_NAME` |
| `warehouse-manager` | CRUD for hubs/depots | DynamoDB (`warehouses`) | `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Scan`, `Query` | `TABLE_NAME` |
| `vehicle-manager` | CRUD for fleet vehicles | DynamoDB (`vehicles`) | `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Scan`, `Query` | `TABLE_NAME` |
| `orders-query` | Query order status | DynamoDB (`orders`) | `dynamodb:GetItem`, `Scan`, `Query` | `TABLE_NAME` |
| `solver-job-query` | Query solver runs | DynamoDB (`solver-jobs`) | `dynamodb:GetItem`, `Scan`, `Query` | `TABLE_NAME` |
| `delivery-jobs-query` | Query delivery jobs | DynamoDB (`delivery-jobs`) | `dynamodb:GetItem`, `Scan`, `Query` | `TABLE_NAME` |
| `delivery-job-by-solver-job-query` | Query routes by solver ID | DynamoDB (`delivery-jobs` GSI) | `dynamodb:Query` on GSI | `TABLE_NAME`, `INDEX_NAME` |
| `distance-cache-query` | Query cache entries | DynamoDB (`distance-cache`) | `dynamodb:GetItem`, `Scan`, `Query` | `TABLE_NAME` |
| `rebuild-distance-cache` | Trigger distance cache task | SSM, ECS Fargate, EC2 Subnets | `ssm:GetParameters`, `ecs:RunTask`, `iam:PassRole`, `ec2:DescribeSubnets` | `SSM_CLUSTER`, `SSM_TASK_DEF`, `SSM_CONTAINER`, `SSM_VPC_ID` |
| `get-s3-presigned-url` (Web) | Presigned GET/PUT URLs | S3 (`distance-cache`) | `s3:GetObject`, `PutObject` | `BUCKET_NAME` |
| `get-s3-presigned-url` (Order) | Presigned upload URL | S3 (`order-uploads`) | `s3:PutObject` | `BUCKET_NAME` |
| `start-order-dispatch-task` | Trigger VRPTW solver task | SSM, ECS Fargate, EC2 Subnets | `ssm:GetParameters`, `ecs:RunTask`, `iam:PassRole`, `ec2:DescribeSubnets` | `SSM_CLUSTER`, `SSM_TASK_DEF`, `SSM_CONTAINER`, `SSM_VPC_ID` |
| `create-order-batch` | S3 trigger order ingestion | DynamoDB (`orders`), S3, Lambda | `dynamodb:BatchWriteItem`, `s3:GetObject`, `lambda:InvokeFunction` | `TABLE_NAME`, `DISPATCH_LAMBDA_ARN` |

---

## 7. Optimization Engine Requirements (OptaPlanner)

```
INPUT (DynamoDB / S3)
  ↓
OPTAPLANNER (Java 21 Corretto / OptaPlanner VRPTW Solver)
  ↓
GRAPHHOPPER (Embedded Java Road Routing Engine)
  ↓
RESULT (Route Polylines, Stop Ordering, Time Windows, Score)
  ↓
AWS PERSISTENCE (DynamoDB `solver-jobs` & `delivery-jobs`)
```

- **Execution Environment**: On-demand Amazon ECS Fargate task (`OptimizationEngineStack.ts`).
- **Invocation**: Triggered asynchronously via `ecs:RunTask` by `StartOrderDispatchTask` Lambda function.
- **Resource Allocation**:
  - **vCPU**: 4.0 vCPU (4096 Fargate units).
  - **Memory**: 8.0 GB RAM (8192 MiB).
  - **Architecture**: ARM64 / x86_64 (configurable in `fargateOptions`).
- **Input Data Sources**:
  - Reads Orders from DynamoDB (`orders`).
  - Reads Fleet Vehicles from DynamoDB (`vehicles`).
  - Reads Depots/Warehouses from DynamoDB (`warehouses`).
  - Reads Customer Locations from DynamoDB (`customer-locations`).
  - Reads Pre-computed Distance Matrix from S3 (`distance-cache`) / DynamoDB (`distance-cache`).
- **Output Storage**: Writes Solver Job status (`COMPLETED` / `FAILED`, execution time, score) to DynamoDB `solver-jobs`, and writes individual vehicle delivery routes (stop sequence, top-level `pointsEncoded`, segment-level geometry, load capacities) to DynamoDB `delivery-jobs`.
- **Command Line Parameters**: `java -jar -Dorder-date=$ORDER_DATE -Dwarehouse-code=$WAREHOUSE_CODE delivery-dispatch.jar`.

---

## 8. GraphHopper / OSM Requirements

- **Map Data Source**: OpenStreetMap (OSM) Protocolbuffer Format (`.osm.pbf`).
- **Build Packaging**: `build_opt_engine.sh` downloads `https://download.geofabrik.de/asia/south-korea-latest.osm.pbf` (or custom region file) and copies it into the Docker image build context.
- **Graph Storage**: In-memory and container filesystem storage (`/root/.graphhopper/graphhopper`).
- **Routing Profile**: Road vehicle profile (car/truck) with turn restrictions and time distance calculations.
- **AWS Infrastructure Dependencies**:
  - Requires container image to embed or mount the `.osm.pbf` file.
  - Requires at least 4GB – 8GB container RAM to build/load the graph topology into JVM heap without OutOfMemory errors.

---

## 9. API Requirements

| Method | Endpoint | Consumer | Handler / Type | Auth Type | Target AWS Service |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/web/customer-location` | Web App | `customer-location-manager` Lambda | Cognito JWT | DynamoDB `customer-locations` |
| `POST/PUT/DELETE` | `/api/web/customer-location/{id}` | Web App | `customer-location-manager` Lambda | Cognito JWT | DynamoDB `customer-locations` |
| `GET` | `/api/web/warehouse` | Web App | `warehouse-manager` Lambda | Cognito JWT | DynamoDB `warehouses` |
| `POST/PUT/DELETE` | `/api/web/warehouse/{id}` | Web App | `warehouse-manager` Lambda | Cognito JWT | DynamoDB `warehouses` |
| `GET` | `/api/web/vehicle` | Web App | `vehicle-manager` Lambda | Cognito JWT | DynamoDB `vehicles` |
| `POST/PUT/DELETE` | `/api/web/vehicle/{id}` | Web App | `vehicle-manager` Lambda | Cognito JWT | DynamoDB `vehicles` |
| `GET` | `/api/web/order` | Web App | `orders-query` Lambda | Cognito JWT | DynamoDB `orders` |
| `GET` | `/api/web/solver-job` | Web App | `solver-job-query` Lambda | Cognito JWT | DynamoDB `solver-jobs` |
| `GET` | `/api/web/delivery-job` | Web App | `delivery-jobs-query` Lambda | Cognito JWT | DynamoDB `delivery-jobs` |
| `GET` | `/api/web/delivery-solver-job/{id}` | Web App | `delivery-job-by-solver-job-query` Lambda | Cognito JWT | DynamoDB `delivery-jobs` GSI |
| `GET` | `/api/web/dist-cache` | Web App | `distance-cache-query` Lambda | Cognito JWT | DynamoDB `distance-cache` |
| `GET` | `/api/web/build-dist-cache/{code}` | Web App | `rebuild-distance-cache` Lambda | Cognito JWT | ECS Fargate `RunTask` |
| `GET` | `/api/web/presigned-url` | Web App | `get-s3-presigned-url` Lambda | Cognito JWT | S3 `distance-cache` |
| `GET` | `/upload/url` | External / Order System | `get-s3-presigned-url` Lambda | API Key | S3 `order-uploads` |
| `POST` | `/dispatch` | External / Order System | `start-order-dispatch-task` Lambda | API Key | ECS Fargate `RunTask` |

- **CORS**: Enabled for `ALL_ORIGINS` and `ALL_METHODS` on both REST APIs.

---

## 10. Cognito Requirements

- **User Pool Name**: Auto-generated by CDK under `Dev-PersistentBackend`.
- **Sign-in Attribute**: Email address (`signInAliases: { email: true }`).
- **Auto Verify**: Email.
- **Password Policy**: Minimum 8 characters, requiring uppercase, lowercase, numbers, and symbols.
- **App Client**: `UserPoolClient` supporting `USER_PASSWORD_AUTH` and `USER_SRP_AUTH`.
- **Administrative Account**: Auto-created via `CfnUserPoolUser` using `administratorEmail` configured in `default.yml`.

---

## 11. DynamoDB Requirements

| Table Logical Name | Primary Key | Sort Key | GSIs | Removal Policy |
| :--- | :--- | :--- | :--- | :--- |
| `customer-locations` | `Id` (String) | None | `idx-customer-locations-warehouse-code` (`warehouseCode`) | DESTROY |
| `warehouses` | `Id` (String) | None | `idx-warehouses-code` (`warehouseCode`) | DESTROY |
| `vehicles` | `Id` (String) | None | None | DESTROY |
| `orders` | `Id` (String) | None | `idx-orders-status` (`status`, `updatedAt`) | DESTROY |
| `solver-jobs` | `Id` (String) | None | None | DESTROY |
| `delivery-jobs` | `Id` (String) | None | `idx-delivery-job-solver-job` (`solverJobId`) | DESTROY |
| `distance-cache` | `Id` (String) | None | None | DESTROY |

- **Billing Mode**: PAY_PER_REQUEST (On-Demand).
- **Point-in-Time Recovery**: Enabled on all 7 tables.

---

## 12. S3 Requirements

| Bucket Construct | Bucket Name Pattern | Purpose | Encryption | Public Access | Auto Delete |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DistanceCacheBucket` | `<namespace>-distance-cache-<account>` | Distance matrix binary/json storage | S3-Managed | BLOCK_ALL | Yes |
| `WebBucket` | `<namespace>-web-<account>` | React SPA static web bundle hosting | S3-Managed | BLOCK_ALL | Yes |
| `OrderUploadsBucket` | `<namespace>-order-uploads-<account>` | Raw batch order CSV file drop | S3-Managed | BLOCK_ALL | Yes |

---

## 13. ECS / Fargate Requirements

```
WHAT MUST EXIST IN AWS BEFORE RUNNING:
1. VPC with Private Subnets and NAT Gateway
2. IAM Task Role with DynamoDB, S3, and SSM read/write permissions
3. ECR Image Assets for `distancecache-util` and `nextday-delivery`
4. Task Definitions registered in ECS
```

- **Launch Type**: Fargate (Serverless container compute — no EC2 instances to manage).
- **Tasks**:
  - **Distance Cache Task**: CPU 4096 (4 vCPU), Memory 8192 MiB (8 GB), ARM64 / x86_64.
  - **OptEngine Task**: CPU 4096 (4 vCPU), Memory 8192 MiB (8 GB), ARM64 / x86_64.
- **Logging**: CloudWatch Logs Driver with 1-day log retention.

---

## 14. Lambda Requirements

- **Runtime**: `NodejsFunction` targeting `node24` bundle / `Runtime.NODEJS_20_X`.
- **Memory Size**: 256 MiB default.
- **Timeout**: 10 seconds default (customizable per route).
- **Deployment Asset**: Bundled on-the-fly using `esbuild` during `cdk synth` / `cdk deploy`.

---

## 15. IAM Requirements

| Role / Principal | Used By | Required Permissions / Actions | Target Resources |
| :--- | :--- | :--- | :--- |
| `LambdaExecutionRole` | Web CRUD Lambdas | `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Scan`, `Query` | Table ARNs & Index ARNs |
| `LambdaExecutionRole` | Presigned URL Lambdas | `s3:GetObject`, `s3:PutObject` | S3 Bucket ARNs |
| `LambdaExecutionRole` | Task Trigger Lambdas | `ssm:GetParameters`, `ecs:RunTask`, `iam:PassRole`, `ec2:DescribeSubnets` | SSM Parameter ARNs, ECS Task Def ARNs, Subnets |
| `EcsTaskRole` (DistanceCache)| Fargate Container | `ssm:GetParameters`, `s3:PutObject`, `dynamodb:GetItem`, `PutItem`, `BatchWriteItem` | SSM, S3 Distance Cache Bucket, DDB Tables |
| `EcsTaskRole` (OptEngine) | Fargate Container | `ssm:GetParameters`, `s3:GetObject`, `dynamodb:GetItem`, `PutItem`, `BatchWriteItem` | SSM, S3 Distance Cache Bucket, DDB Tables |
| `CloudFrontOAC` | CloudFront Distribution | `s3:GetObject` | Web S3 Bucket ARN |
| `CDKDeployRole` | CDK CLI | `cloudformation:*`, `iam:*`, `s3:*`, `ecr:*`, `ssm:*`, `dynamodb:*`, `cognito-idp:*`, `apigateway:*`, `ecs:*` | Full deployment permissions |

---

## 16. Networking Requirements

- **Public Resources**:
  - CloudFront Distribution (Public HTTPS endpoint).
  - API Gateway REST APIs (`WebApi` & `OrderApi`).
- **Private Resources**:
  - ECS Fargate tasks running inside Private Subnets (`PRIVATE_WITH_EGRESS`).
  - Lambda functions accessing internal VPC / AWS resources.
- **Egress Connectivity**: NAT Gateway providing outbound internet access for container tasks (e.g., downloading OSM map updates if triggered).

---

## 17. Environment Variables Inventory

| Environment Variable | Configured In | Purpose | Secret? | Source |
| :--- | :--- | :--- | :---: | :--- |
| `AWS_ACCOUNT_ID` | `default.yml` / Shell | AWS Account ID for CDK synthesis | No | `apps_infra/config/default.yml` |
| `AWS_REGION` | `default.yml` / Shell | Target AWS Deployment Region | No | `apps_infra/config/default.yml` |
| `TABLE_NAME` | Lambda Environment | DynamoDB target table name | No | CDK Stack props |
| `BUCKET_NAME` | Lambda Environment | S3 target bucket name | No | CDK Stack props |
| `SSM_CLUSTER` | Lambda Environment | SSM Parameter key for ECS cluster | No | CDK Stack props |
| `SSM_CONTAINER` | Lambda Environment | SSM Parameter key for container name | No | CDK Stack props |
| `SSM_TASK_DEF` | Lambda Environment | SSM Parameter key for task definition ARN | No | CDK Stack props |
| `SSM_VPC_ID` | Lambda Environment | SSM Parameter key for VPC ID | No | CDK Stack props |
| `DISPATCH_LAMBDA_ARN` | Lambda Environment | Target Lambda function ARN for batch trigger | No | CDK Stack props |
| `LOCATION_TABLE` | ECS Task Env | DynamoDB locations table name | No | Passed via `RunTask` overrides |
| `CACHE_TABLE` | ECS Task Env | DynamoDB distance cache table name | No | Passed via `RunTask` overrides |
| `ORDER_DATE` | ECS Task Env | Target order date (`YYYYMMDD`) | No | Passed via `RunTask` overrides |
| `WAREHOUSE_CODE` | ECS Task Env | Target warehouse depot code | No | Passed via `RunTask` overrides |
| `administratorEmail` | `default.yml` / Shell | Email address for initial admin user | No | `apps_infra/config/default.yml` |

---

## 18. Secrets Inventory

- **Order API Key**: Created dynamically by API Gateway (`apigw.ApiKey`) and stored in SSM Parameter Store (`/DevProto/Api/Order/Upload/Key`).
- **Cognito Admin Password**: Automatically generated by Cognito upon user creation and dispatched via email to `administratorEmail`.
- **Secret Disclosure Status**: `NO RAW SECRETS DISCLOSED`.

---

## 19. Region Requirement

- **Configured Region**: `ap-south-1` (Asia Pacific - Mumbai).
- **Source**: `apps_infra/config/default.yml` (line 11).

---

## 20. Domain & HTTPS Requirements

- **CloudFront Domain**: Auto-generated by AWS (`*.cloudfront.net`).
- **HTTPS Enforced**: Viewer Protocol Policy set to `REDIRECT_TO_HTTPS`.
- **Custom Domain / Route 53 / ACM**: `DOMAIN NOT YET DEFINED`.

---

## 21. Deployment Dependency Order

Derived directly from `apps_infra/bin/app.ts`:

```
1. CDK Bootstrap (cdk bootstrap aws://<ACCOUNT_ID>/<REGION>)
   ↓
2. Dev-PersistentBackend (VPC, DynamoDB, S3, Cognito, CloudFront, SSM Params)
   ↓
3. Parallel Deployment of Dependent Stacks:
   ├── Dev-Backend (API Gateway WebApi, Lambdas, Web S3 Deployment)
   ├── Dev-OrderUpload (API Gateway OrderApi, Lambdas, S3 Bucket)
   ├── Dev-DistanceCache (ECS Cluster, Fargate Task Def, SSM Params)
   └── Dev-OptEngine (ECS Cluster, Fargate Task Def, SSM Params)
```

---

## 22. AWS Credentials / Permissions Requirements

To deploy the infrastructure, the AWS CLI / CDK credentials must have AdministratorAccess or policies covering:
- AWS CloudFormation
- IAM Roles, Policies & Instance Profiles
- Amazon VPC & Subnets
- Amazon DynamoDB Tables & Indexes
- Amazon S3 Buckets & Bucket Policies
- Amazon Cognito User Pools
- Amazon API Gateway REST APIs & Usage Plans
- AWS Lambda Functions & Event Source Mappings
- Amazon ECS Clusters & Task Definitions
- Amazon ECR Asset Image Uploads
- AWS Systems Manager Parameter Store
- Amazon CloudFront Distributions & OAC

---

## 23. AWS Ship-It Readiness Checklist

| Checklist Item | Classification | Current Status |
| :--- | :---: | :--- |
| **AWS Account ID** | **REQUIRED** | Set to `564159155699` in `default.yml` (Must verify target account) |
| **AWS Region** | **REQUIRED** | Configured to `ap-south-1` (Mumbai) |
| **IAM Admin Credentials** | **REQUIRED** | Required for local `cdk deploy` execution |
| **AWS CLI & CDK CLI** | **REQUIRED** | Required on deployment workstation |
| **CDK Bootstrap** | **REQUIRED** | Must run `cdk bootstrap` before initial stack deploy |
| **Docker Daemon** | **REQUIRED** | Required locally to build ECR container image assets |
| **VPC Infrastructure** | **REQUIRED** | Fully defined in `PersistentBackendStack.ts` |
| **DynamoDB Tables** | **REQUIRED** | Fully defined in `PersistentBackendStack.ts` |
| **S3 Storage Buckets** | **REQUIRED** | Fully defined in `PersistentBackendStack.ts` & `OrderUploadStack.ts` |
| **Cognito User Pool** | **REQUIRED** | Fully defined in `PersistentBackendStack.ts` |
| **API Gateway REST APIs** | **REQUIRED** | Fully defined in `BackendStack.ts` & `OrderUploadStack.ts` |
| **Lambda Compute** | **REQUIRED** | Fully defined in `apps_infra/lambda` & constructs |
| **ECS Fargate Clusters** | **REQUIRED** | Fully defined in `DistanceCacheStack.ts` & `OptimizationEngineStack.ts` |
| **Environment Variables** | **REQUIRED** | Configured in `default.yml` & stack definitions |
| **Custom Domain / ACM** | **DEFERRED** | Optional — CloudFront default URL used initially |

---

## 24. Future Code Change → AWS Impact Map

| Code Change Area | AWS Service / Stack Impacted | Action Required |
| :--- | :--- | :--- |
| **New REST API Endpoint** | `BackendStack` (`ApiWeb.ts`) + Cognito Authorizer | Add route method in `ApiWeb.ts`, re-deploy `Dev-Backend` |
| **New Lambda Function** | Lambda + IAM Roles + `apps_infra/lambda` | Create handler directory, declare `AppNodejsFunction`, re-deploy |
| **New Data Entity / Field Index** | DynamoDB + `PersistentBackendStack` | Add GSI or table in `PersistentBackendStack`, update Lambda policies |
| **New S3 Asset Bucket** | S3 + IAM Task/Lambda Roles | Declare S3 bucket in CDK stack, grant read/write permissions |
| **Solver Memory / vCPU Scaling** | `fargateOptions` in `default.yml` | Update `optEngineCpu` / `optEngineMemory`, re-deploy `Dev-OptEngine` |
| **GraphHopper Map Region Update** | `build_opt_engine.sh` + Docker context | Replace `.osm.pbf` file in build context, re-build ECR image asset |
| **Cognito User Attribute Change** | `PersistentBackendStack` (UserPool) | Update UserPool standard/custom attributes in CDK |
| **Frontend Static Asset Build Update** | `BackendStack` (`s3deploy.BucketDeployment`) | Run `pnpm build` in `apps_web`, re-deploy `Dev-Backend` |
| **Custom Domain Addition** | CloudFront + ACM + Route 53 | Add ACM Certificate, Route 53 record, update CloudFront aliases |

---

## 25. Current Unknowns

1. **Target AWS Account ID**: `default.yml` contains placeholder account ID `564159155699` which must be confirmed before deployment.
2. **Administrator Email**: `nihalmishra3009@gmail.com` is configured to receive Cognito credentials upon deployment.
3. **Production OSM Map Boundary**: Container currently defaults to South Korea / local OSM file; verify if Navi Mumbai / India OSM extract is required for production build context.

---

## 26. Current AWS Blockers

1. **AWS Account Verification**: Replace `account: '564159155699'` in `apps_infra/config/default.yml` with the actual target AWS Account ID.
2. **Docker Daemon Requirement**: Local Docker engine must be running during `cdk synth` / `cdk deploy` so CDK can package the Java Corretto container images into ECR assets.
3. **CDK Bootstrap**: `cdk bootstrap aws://<ACCOUNT_ID>/ap-south-1` must be executed once per account/region prior to initial stack deployment.
