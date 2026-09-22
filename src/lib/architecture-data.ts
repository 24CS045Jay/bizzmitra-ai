export interface ArchitectureComponent {
  id: string;
  name: string;
  layer: "Client & Presentation" | "API Gateway & Edge" | "Core Services" | "Async & AI Pipeline" | "Data & Cache";
  techStack: string[];
  description: string;
  securityPolicies: string[];
  scalingConsiderations: string[];
  latencyBudget: string;
  availabilitySla: string;
  dependencies: string[];
  dataIngress: string;
  dataEgress: string;
}

export interface ArchitectureBlueprint {
  domainId: string;
  domainTitle: string;
  hldDiagram: string;
  lldDiagram: string;
  topologyDiagram: string;
  securitySlaDiagram: string;
  components: ArchitectureComponent[];
  keyDecisions: {
    title: string;
    detail: string;
    badge: string;
  }[];
  summary: {
    cloudProvider: string;
    dbEngine: string;
    concurrencyTarget: string;
    primarySla: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 1: HR & RECRUITMENT (TalentCraft Default)
// ─────────────────────────────────────────────────────────────────────────────
export const HR_HLD_DIAGRAM = `graph TB
  subgraph Client_Layer["Client & Access Layer"]
    A1["Recruiter Workspace UI<br/>(React / TanStack)"]
    A2["Client Onboarding Portal<br/>(Self-Serve Shortlists)"]
    A3["Consultant Clock-In App<br/>(Smart Attendance)"]
  end

  subgraph Edge_Layer["Edge & Security Layer"]
    B1["Cloudflare CDN & WAF<br/>(DDoS Mitigation)"]
    B2["API Gateway & Auth Proxy<br/>(Kong / Fastify Rate Limiting)"]
  end

  subgraph Service_Mesh["Core Microservices Cluster (AWS ECS)"]
    C1["Core ATS & Pipeline Service<br/>(Candidate CRUD & Workflows)"]
    C2["Smart Attendance Service<br/>(Daily Punches & Timesheets)"]
    C3["Client Collaboration Service<br/>(Document Exchange & SLA)"]
    C4["Solution Studio Engine<br/>(Dynamic Schemas v1.x)"]
  end

  subgraph AI_Pipeline["Intelligence & Async Processing"]
    D1["Celery / Redis Job Queue<br/>(Asynchronous Tasks)"]
    D2["AI Resume Matcher & LLM<br/>(Claude 3.5 / pgvector)"]
  end

  subgraph Data_Layer["Data & Persistence Layer (Multi-AZ)"]
    E1[("PostgreSQL 16 Primary<br/>Relational Data & Vectors")]
    E2[("Redis 7 Cache Cluster<br/>Sessions & Live Timers")]
    E3[("Amazon S3 Bucket<br/>Resumes & NDA Docs")]
  end

  A1 --> B1
  A2 --> B1
  A3 --> B1
  B1 --> B2

  B2 --> C1
  B2 --> C2
  B2 --> C3
  B2 --> C4

  C1 --> D1
  C4 --> D1
  D1 --> D2

  C1 --> E1
  C2 --> E1
  C3 --> E1
  C4 --> E1
  D2 --> E1

  C1 --> E2
  C2 --> E2
  B2 --> E2

  C1 --> E3
  C3 --> E3

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef ai fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class A1,A2,A3 client
  class B1,B2 edge
  class C1,C2,C3,C4 service
  class D1,D2 ai
  class E1,E2,E3 data
`;

export const HR_LLD_DIAGRAM = `sequenceDiagram
  autonumber
  actor Recruiter as "Recruiter / Consultant"
  participant WebApp as "Web Client"
  participant Gateway as "API Gateway"
  participant ATSSvc as "Core ATS Service"
  participant AttSvc as "Attendance Service"
  participant Queue as "Redis Celery Queue"
  participant AIEngine as "AI Embedding Engine"
  participant DB as "PostgreSQL Database"

  Note over Recruiter,WebApp: Flow A - Attendance Verification
  Recruiter->>WebApp: Clicks Punch-In Button
  WebApp->>Gateway: POST /api/v1/attendance/punch [HMAC Token]
  Gateway->>AttSvc: Validate Consultant ID and Timestamp
  AttSvc->>DB: INSERT INTO attendance_punches
  AttSvc-->>WebApp: 201 Created [Clock Running]

  Note over Recruiter,WebApp: Flow B - Candidate Ingestion and AI Match
  Recruiter->>WebApp: Submits Candidate Profile and Custom Attributes
  WebApp->>Gateway: POST /api/v1/candidates [Validated Payload]
  Gateway->>ATSSvc: Validate Schema against Studio AST
  ATSSvc->>DB: INSERT INTO candidates and metadata
  ATSSvc->>Queue: Enqueue Resume Vectorization Job
  Queue->>AIEngine: Generate 1536-dim Embedding
  AIEngine->>DB: UPDATE candidate SET embedding
  ATSSvc-->>WebApp: 200 OK [Candidate Visible in Pipeline]
`;

export const HR_TOPOLOGY_DIAGRAM = `graph LR
  subgraph L1["1. Client Layer"]
    T_UI["Recruiter SPA"]
    T_PORTAL["Client Shortlist Portal"]
    T_PWA["Consultant Punch App"]
  end

  subgraph L2["2. Ingress & Edge"]
    T_WAF["Cloudflare WAF"]
    T_GW["Fastify API Gateway"]
    T_AUTH["Supabase Auth / JWT"]
  end

  subgraph L3["3. Microservices"]
    T_ATS["ATS Pipeline Microservice"]
    T_ATT["Attendance Punch Engine"]
    T_COL["Client Collaboration Svc"]
  end

  subgraph L4["4. Async Workers & AI"]
    T_REDIS_Q["Redis Task Broker"]
    T_WORKER["Celery Worker Fleet"]
    T_AI["Claude 3.5 & pgvector"]
  end

  subgraph L5["5. Storage Layer"]
    T_PG[("PostgreSQL 16 Cluster")]
    T_CACHE[("Redis Session Cache")]
    T_S3[("Amazon S3 Vault")]
  end

  T_UI --> T_WAF
  T_PORTAL --> T_WAF
  T_PWA --> T_WAF
  T_WAF --> T_GW
  T_GW --> T_AUTH
  T_AUTH --> T_ATS
  T_AUTH --> T_ATT
  T_AUTH --> T_COL
  T_ATS --> T_REDIS_Q
  T_REDIS_Q --> T_WORKER
  T_WORKER --> T_AI
  T_ATS --> T_PG
  T_ATT --> T_PG
  T_COL --> T_S3
  T_ATS --> T_CACHE
  T_AI --> T_PG

  classDef c1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef c2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef c3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef c4 fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef c5 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class T_UI,T_PORTAL,T_PWA c1
  class T_WAF,T_GW,T_AUTH c2
  class T_ATS,T_ATT,T_COL c3
  class T_REDIS_Q,T_WORKER,T_AI c4
  class T_PG,T_CACHE,T_S3 c5
`;

export const HR_SECURITY_SLA_DIAGRAM = `graph TB
  subgraph Public_Zone["Public Zone & CDN Edge"]
    SEC_USERS["Recruiters, Clients & Candidates"]
    SEC_CF["Cloudflare Enterprise WAF (DDoS Shield)"]
  end

  subgraph DMZ_Zone["DMZ & Ingress (Public Subnet)"]
    SEC_GW["Fastify API Gateway (TLS 1.3 / OWASP Guard)"]
    SEC_RATE["Token Bucket Rate Limiter (120 req/min)"]
  end

  subgraph Private_App_VPC["Private Application VPC (No Public IP)"]
    SEC_APP["Microservices Cluster (AWS ECS Fargate)"]
    SEC_WORK["Celery Async Fleet in Private Subnet"]
    SEC_MTLS["Internal mTLS & Service Mesh"]
  end

  subgraph Isolated_Data_VPC["Secure Persistence VPC (Multi-AZ)"]
    SEC_DB[("PostgreSQL 16 (AES-256 KMS Encryption)")]
    SEC_RLS["Row-Level Security (RLS Tenant Isolation)"]
    SEC_REDIS[("Redis In-Memory Auth Guarded")]
  end

  subgraph SLA_Guarantees["SLA & Reliability Targets"]
    SLA_1["Availability SLA: 99.95%"]
    SLA_2["P95 API Latency: < 80ms"]
    SLA_3["Recovery Point (RPO): < 1 min"]
    SLA_4["Recovery Time (RTO): < 15 min"]
  end

  SEC_USERS --> SEC_CF
  SEC_CF --> SEC_GW
  SEC_GW --> SEC_RATE
  SEC_RATE --> SEC_APP
  SEC_APP --> SEC_MTLS
  SEC_MTLS --> SEC_WORK
  SEC_APP --> SEC_RLS
  SEC_RLS --> SEC_DB
  SEC_APP --> SEC_REDIS

  classDef zone1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef zone2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef zone3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef zone4 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF
  classDef zone5 fill:#16A34A,stroke:#15803D,stroke-width:2px,color:#FFFFFF

  class SEC_USERS,SEC_CF zone1
  class SEC_GW,SEC_RATE zone2
  class SEC_APP,SEC_WORK,SEC_MTLS zone3
  class SEC_DB,SEC_RLS,SEC_REDIS zone4
  class SLA_1,SLA_2,SLA_3,SLA_4 zone5
`;

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 2: SOLAR & CLEAN ENERGY / IOT / GRID
// ─────────────────────────────────────────────────────────────────────────────
export const SOLAR_HLD_DIAGRAM = `graph TB
  subgraph Client_Layer["Field & Operations Layer"]
    S_APP["Field Technician PWA<br/>(Offline Inverter Diagnostics)"]
    S_OPS["Solar Fleet Command Center<br/>(Grid Telemetry & Alerts)"]
    S_CUST["Customer Energy App<br/>(Kilowatt Yield & Battery State)"]
  end

  subgraph Edge_Layer["IoT Edge & Ingestion Gateway"]
    S_WAF["Cloudflare WAF & Edge CDN<br/>(DDoS & Geo-Routing)"]
    S_IOT["AWS IoT Core & MQTT Broker<br/>(Mutual X.509 Device Auth)"]
    S_GW["API Gateway & Auth Proxy<br/>(Fastify / Rate Limiting)"]
  end

  subgraph Service_Mesh["Core Solar Microservices (AWS ECS)"]
    S_TEL["Inverter Telemetry Engine<br/>(1-Sec Sensor Packet Ingestion)"]
    S_GRID["Grid Sync & Net-Metering Svc<br/>(Utility Compliance Engine)"]
    S_DISP["Field Work Order Dispatcher<br/>(Technician Route Allocation)"]
    S_YIELD["Predictive Yield Analyzer<br/>(Weather & Solar Radiation Model)"]
  end

  subgraph AI_Pipeline["Real-time Intelligence & Stream"]
    S_KAFKA["Apache Kafka Event Stream<br/>(High-Throughput Sensor Bus)"]
    S_AI["Solar AI Anomaly Engine<br/>(Inverter Hotspot & Arc Faults)"]
  end

  subgraph Data_Layer["Time-Series & Relational Storage"]
    S_TIME[("TimescaleDB Hypertables<br/>Sub-Second Sensor Metrics")]
    S_PG[("PostgreSQL 16 Primary<br/>Site Assets & Work Orders")]
    S_REDIS[("Redis 7 In-Memory Cache<br/>Active Inverter Live State")]
    S_S3[("Amazon S3 Bucket<br/>Drone Thermography & Firmware")]
  end

  S_APP --> S_WAF
  S_OPS --> S_WAF
  S_CUST --> S_WAF
  S_WAF --> S_GW

  S_IOT --> S_TEL
  S_GW --> S_TEL
  S_GW --> S_GRID
  S_GW --> S_DISP
  S_GW --> S_YIELD

  S_TEL --> S_KAFKA
  S_KAFKA --> S_AI
  S_AI --> S_DISP

  S_TEL --> S_TIME
  S_GRID --> S_PG
  S_DISP --> S_PG
  S_TEL --> S_REDIS
  S_OPS --> S_S3

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef ai fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class S_APP,S_OPS,S_CUST client
  class S_WAF,S_IOT,S_GW edge
  class S_TEL,S_GRID,S_DISP,S_YIELD service
  class S_KAFKA,S_AI ai
  class S_TIME,S_PG,S_REDIS,S_S3 data
`;

export const SOLAR_LLD_DIAGRAM = `sequenceDiagram
  autonumber
  actor Tech as "Solar Field Technician"
  participant Inverter as "Solar Inverter Gateway"
  participant MQTT as "AWS IoT Core [MQTT]"
  participant TelSvc as "Inverter Telemetry Svc"
  participant Kafka as "Kafka Event Stream"
  participant AnomalyAI as "Solar AI Anomaly Engine"
  participant TimeDB as "TimescaleDB Hypertable"
  participant DispatchSvc as "Work Order Dispatcher"

  Note over Inverter,MQTT: Sensor Ingestion Burst - 10k pings/sec
  Inverter->>MQTT: PUBLISH /telemetry/inverter/payload [Voltage, Amps, Temp 72C]
  MQTT->>TelSvc: Stream payload via TLS mutual authentication
  TelSvc->>TimeDB: Bulk INSERT INTO sensor_telemetry
  TelSvc->>Kafka: Emit event InverterTelemetryReceived

  Note over Kafka,AnomalyAI: Real-Time Arc Fault and Thermal Runaway Detection
  Kafka->>AnomalyAI: Consume stream window of last 60 seconds
  AnomalyAI->>AnomalyAI: Detect thermal anomaly - Inverter Temp above 70C
  AnomalyAI->>DispatchSvc: Trigger Urgent Work Order for Overheating Inverter
  DispatchSvc->>Tech: Push Alert via Mobile PWA - Inspect Array 4
  Tech-->>DispatchSvc: 200 OK [Technician Dispatched]
`;

export const SOLAR_TOPOLOGY_DIAGRAM = `graph LR
  subgraph L1["1. Edge & Devices"]
    SOL_INV["Solar Inverter Gateways"]
    SOL_MET["Smart Bi-Directional Meters"]
    SOL_TECH["Technician Diagnostic PWA"]
  end

  subgraph L2["2. Telemetry Ingress"]
    SOL_MQTT["AWS IoT Core (MQTT Broker)"]
    SOL_WAF["Cloudflare Edge API Gateway"]
    SOL_AUTH["Mutual X.509 & IAM Auth"]
  end

  subgraph L3["3. Solar Core Services"]
    SOL_TSVC["Telemetry Ingestion Svc"]
    SOL_GSVC["Grid Synchronization Svc"]
    SOL_WSVC["Work Order & Dispatch Svc"]
  end

  subgraph L4["4. Stream Analytics & AI"]
    SOL_KAFKA["Apache Kafka Broker"]
    SOL_FLINK["Apache Flink Windowing"]
    SOL_ML["Predictive Thermal AI"]
  end

  subgraph L5["5. Persistence"]
    SOL_TIME[("TimescaleDB Hypertables")]
    SOL_PG[("PostgreSQL 16 Master")]
    SOL_RED[("Redis 7 State Cache")]
  end

  SOL_INV --> SOL_MQTT
  SOL_MET --> SOL_MQTT
  SOL_TECH --> SOL_WAF
  SOL_MQTT --> SOL_AUTH
  SOL_WAF --> SOL_AUTH
  SOL_AUTH --> SOL_TSVC
  SOL_AUTH --> SOL_GSVC
  SOL_AUTH --> SOL_WSVC
  SOL_TSVC --> SOL_KAFKA
  SOL_KAFKA --> SOL_FLINK
  SOL_FLINK --> SOL_ML
  SOL_ML --> SOL_WSVC
  SOL_TSVC --> SOL_TIME
  SOL_GSVC --> SOL_PG
  SOL_TSVC --> SOL_RED

  classDef c1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef c2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef c3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef c4 fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef c5 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class SOL_INV,SOL_MET,SOL_TECH c1
  class SOL_MQTT,SOL_WAF,SOL_AUTH c2
  class SOL_TSVC,SOL_GSVC,SOL_WSVC c3
  class SOL_KAFKA,SOL_FLINK,SOL_ML c4
  class SOL_TIME,SOL_PG,SOL_RED c5
`;

export const SOLAR_SECURITY_SLA_DIAGRAM = `graph TB
  subgraph Public_Zone["Field Hardware & Public Zone"]
    SOL_FIELD["15,000+ Inverters & Field Tech Devices"]
    SOL_CERT["Hardware Cryptographic Secure Elements"]
  end

  subgraph DMZ_Zone["DMZ Edge & IoT Ingress"]
    SOL_ING["AWS IoT Core (Mutual TLS X.509 Verification)"]
    SOL_WAF2["Cloudflare DDoS Shield (Rate Limit 50k pings/sec)"]
  end

  subgraph Private_App_VPC["Private SCADA & Application VPC"]
    SOL_ECS["Telemetry & Dispatch Microservices (AWS ECS)"]
    SOL_ISO["Zero-Trust Microsegmentation (mTLS Enforced)"]
    SOL_STREAM["Private Kafka Cluster (Subnet Isolation)"]
  end

  subgraph Isolated_Data_VPC["Isolated Time-Series Storage VPC"]
    SOL_DB1[("TimescaleDB (Multi-AZ Encrypted KMS)")]
    SOL_DB2[("PostgreSQL 16 (Automated Point-in-Time Recovery)")]
    SOL_DB3[("Redis In-Memory State Cache")]
  end

  subgraph SLA_Guarantees["Solar Operational SLA Standards"]
    SOL_SLA1["Telemetry Ingestion Uptime: 99.99%"]
    SOL_SLA2["Arc Fault Alert Latency: < 2.0s"]
    SOL_SLA3["Offline Diagnostic Sync: < 500ms"]
    SOL_SLA4["Recovery Point (RPO): Zero Data Loss"]
  end

  SOL_FIELD --> SOL_CERT
  SOL_CERT --> SOL_ING
  SOL_ING --> SOL_ECS
  SOL_WAF2 --> SOL_ECS
  SOL_ECS --> SOL_ISO
  SOL_ISO --> SOL_STREAM
  SOL_ECS --> SOL_DB1
  SOL_ECS --> SOL_DB2
  SOL_ECS --> SOL_DB3

  classDef zone1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef zone2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef zone3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef zone4 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF
  classDef zone5 fill:#16A34A,stroke:#15803D,stroke-width:2px,color:#FFFFFF

  class SOL_FIELD,SOL_CERT zone1
  class SOL_ING,SOL_WAF2 zone2
  class SOL_ECS,SOL_ISO,SOL_STREAM zone3
  class SOL_DB1,SOL_DB2,SOL_DB3 zone4
  class SOL_SLA1,SOL_SLA2,SOL_SLA3,SOL_SLA4 zone5
`;

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 3: HEALTHCARE & DIAGNOSTIC LABS / CLINICAL
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_HLD_DIAGRAM = `graph TB
  subgraph Client_Layer["Clinical & Patient Touchpoints"]
    H_DOC["Doctor & Clinician Portal<br/>(Critical Lab Review)"]
    H_PAT["Patient Health Vault App<br/>(Diagnostic PDF Downloads)"]
    H_LAB["Pathologist & Tech Workstation<br/>(Specimen Barcode Scanner)"]
  end

  subgraph Edge_Layer["HIPAA Compliant Edge & Ingress"]
    H_WAF["Cloudflare Enterprise WAF<br/>(HIPAA BAA Shield & Geo-Fence)"]
    H_GW["HL7 / FHIR v4 API Gateway<br/>(Mutual TLS & JWT Authentication)"]
  end

  subgraph Service_Mesh["Clinical Core Microservices (AWS ECS)"]
    H_LIS["LIS Specimen Tracking Engine<br/>(Chain-of-Custody & Routing)"]
    H_REP["Diagnostic Report Generator<br/>(Cryptographic Doctor Signing)"]
    H_CRIT["Critical Value Alert Engine<br/>(Sub-5s Emergency SMS/Call)"]
    H_BILL["Health Insurance & Billing Svc<br/>(CPT/ICD-10 Code Validator)"]
  end

  subgraph AI_Pipeline["Clinical AI & Validation Pipeline"]
    H_QUEUE["RabbitMQ Specimen Task Bus<br/>(Priority Clinical Queuing)"]
    H_AI["Clinical Pathology AI Engine<br/>(Reference Range Anomaly Detector)"]
  end

  subgraph Data_Layer["Encrypted PHI Persistence (HIPAA Multi-AZ)"]
    H_PG[("PostgreSQL 16 Primary<br/>Encrypted Patient Medical Records")]
    H_S3[("Amazon S3 Glacier Vault<br/>Immutable Signed Lab Reports")]
    H_REDIS[("Redis 7 Cache Cluster<br/>Active Urgent Specimen Queue")]
  end

  H_DOC --> H_WAF
  H_PAT --> H_WAF
  H_LAB --> H_WAF
  H_WAF --> H_GW

  H_GW --> H_LIS
  H_GW --> H_REP
  H_GW --> H_CRIT
  H_GW --> H_BILL

  H_LIS --> H_QUEUE
  H_QUEUE --> H_AI
  H_AI --> H_CRIT

  H_LIS --> H_PG
  H_REP --> H_S3
  H_LIS --> H_REDIS
  H_BILL --> H_PG

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef ai fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class H_DOC,H_PAT,H_LAB client
  class H_WAF,H_GW edge
  class H_LIS,H_REP,H_CRIT,H_BILL service
  class H_QUEUE,H_AI ai
  class H_PG,H_S3,H_REDIS data
`;

export const HEALTHCARE_LLD_DIAGRAM = `sequenceDiagram
  autonumber
  actor LabTech as "Pathologist / Lab Tech"
  participant Scanner as "2D Barcode Scanner"
  participant Gateway as "FHIR / HL7 API Gateway"
  participant LISSvc as "LIS Routing Service"
  participant Queue as "RabbitMQ Task Broker"
  participant PathologyAI as "Clinical Pathology AI"
  participant AlertSvc as "Critical Value Dispatcher"
  participant DB as "HIPAA PostgreSQL 16"
  actor Doctor as "Attending Physician"

  Note over LabTech,Scanner: Specimen Barcode Scan and Ingestion
  LabTech->>Scanner: Scans Blood Tube Barcode SPEC-9021
  Scanner->>Gateway: POST /fhir/v4/Observation [Hemoglobin 5.8 g/dL]
  Gateway->>LISSvc: Validate Patient Chain-of-Custody
  LISSvc->>DB: INSERT INTO specimen_tracking
  LISSvc->>Queue: Enqueue SpecimenValidationJob
  Note over Queue,PathologyAI: Emergency Critical Range Anomaly Detection
  Queue->>PathologyAI: Parse observation against demographic baseline
  PathologyAI->>PathologyAI: Detect CRITICAL LOW Hemoglobin
  PathologyAI->>AlertSvc: Trigger Tier-1 Emergency Alert
  AlertSvc->>Doctor: Automated Dispatch - Critical Lab Result
  Doctor-->>AlertSvc: Acknowledges Critical Value Receipt
  LISSvc-->>LabTech: 200 OK [Specimen Verified and Dispatched]
`;

export const HEALTHCARE_TOPOLOGY_DIAGRAM = `graph LR
  subgraph L1["1. Medical Clients"]
    MED_DOC["Clinician EMR Web"]
    MED_PAT["Patient Portal PWA"]
    MED_ANAL["Analyzer LIS Interface"]
  end

  subgraph L2["2. Zero-Trust Ingress"]
    MED_WAF["Cloudflare HIPAA Shield"]
    MED_FHIR["FHIR / HL7 v4 Gateway"]
    MED_RBAC["OAuth 2.0 PKCE Auth Guard"]
  end

  subgraph L3["3. Healthcare Services"]
    MED_LISSVC["Specimen Routing Svc"]
    MED_REPSVC["Diagnostic Report Svc"]
    MED_ALERTSVC["Critical Value Alert Svc"]
  end

  subgraph L4["4. Medical AI & Queues"]
    MED_MQ["RabbitMQ Clinical Bus"]
    MED_NLP["BioBERT Pathology AI"]
    MED_AUDIT["HIPAA Immutable Logger"]
  end

  subgraph L5["5. Secure PHI Vaults"]
    MED_PG[("PostgreSQL 16 (AES-256)")]
    MED_S3[("S3 DICOM & PDF Vault")]
    MED_RED[("Redis Session Cache")]
  end

  MED_DOC --> MED_WAF
  MED_PAT --> MED_WAF
  MED_ANAL --> MED_FHIR
  MED_WAF --> MED_FHIR
  MED_FHIR --> MED_RBAC
  MED_RBAC --> MED_LISSVC
  MED_RBAC --> MED_REPSVC
  MED_RBAC --> MED_ALERTSVC
  MED_LISSVC --> MED_MQ
  MED_MQ --> MED_NLP
  MED_NLP --> MED_ALERTSVC
  MED_LISSVC --> MED_PG
  MED_REPSVC --> MED_S3
  MED_LISSVC --> MED_RED
  MED_RBAC --> MED_AUDIT

  classDef c1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef c2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef c3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef c4 fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef c5 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class MED_DOC,MED_PAT,MED_ANAL c1
  class MED_WAF,MED_FHIR,MED_RBAC c2
  class MED_LISSVC,MED_REPSVC,MED_ALERTSVC c3
  class MED_MQ,MED_NLP,MED_AUDIT c4
  class MED_PG,MED_S3,MED_RED c5
`;

export const HEALTHCARE_SECURITY_SLA_DIAGRAM = `graph TB
  subgraph Public_Zone["Authorized Medical Personnel"]
    MED_USERS["Doctors, Nurses, Phlebotomists & Patients"]
    MED_CF["Cloudflare Enterprise (WAF & DDoS Mitigation)"]
  end

  subgraph DMZ_Zone["DMZ & Ingress Subnet"]
    MED_GATE["FHIR v4 Gateway (Mutual TLS & Token Authentication)"]
    MED_SAN["OWASP Sanitizer & Schema Guard"]
  end

  subgraph Private_App_VPC["HIPAA Isolated Application VPC"]
    MED_CLUSTER["LIS & Pathology Microservices (Private ECS)"]
    MED_ENCRYPT["TLS 1.3 Internal Service-to-Service mTLS"]
    MED_QUEUE_ZONE["RabbitMQ Clinical Message Queue"]
  end

  subgraph Isolated_Data_VPC["PHI Data Isolation Subnet (Zero Internet Routing)"]
    MED_POSTGRES[("PostgreSQL 16 (AWS KMS Key Rotation, RLS)")]
    MED_S3_VAULT[("Amazon S3 Object Lock (Immutable Lab Reports)")]
    MED_LOGS[("CloudWatch Audit Trail (7-Year Immutable Retention)")]
  end

  subgraph SLA_Guarantees["Healthcare Mission-Critical SLAs"]
    MED_SLA1["Emergency Lab Availability: 99.99%"]
    MED_SLA2["Critical Value Alert Latency: < 3.0s"]
    MED_SLA3["Disaster Recovery RTO: < 10 Minutes"]
    MED_SLA4["Patient Data Encryption: 100% In-Transit & At-Rest"]
  end

  MED_USERS --> MED_CF
  MED_CF --> MED_GATE
  MED_GATE --> MED_SAN
  MED_SAN --> MED_CLUSTER
  MED_CLUSTER --> MED_ENCRYPT
  MED_ENCRYPT --> MED_QUEUE_ZONE
  MED_CLUSTER --> MED_POSTGRES
  MED_CLUSTER --> MED_S3_VAULT
  MED_CLUSTER --> MED_LOGS

  classDef zone1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef zone2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef zone3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef zone4 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF
  classDef zone5 fill:#16A34A,stroke:#15803D,stroke-width:2px,color:#FFFFFF

  class MED_USERS,MED_CF zone1
  class MED_GATE,MED_SAN zone2
  class MED_CLUSTER,MED_ENCRYPT,MED_QUEUE_ZONE zone3
  class MED_POSTGRES,MED_S3_VAULT,MED_LOGS zone4
  class MED_SLA1,MED_SLA2,MED_SLA3,MED_SLA4 zone5
`;

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 4: LOGISTICS / SUPPLY CHAIN / FLEET DISPATCH
// ─────────────────────────────────────────────────────────────────────────────
export const LOGISTICS_HLD_DIAGRAM = `graph TB
  subgraph Client_Layer["Fleet Operators & Drivers"]
    L_DISP["Central Fleet Dispatch Console<br/>(Live Map & Manifest Tracking)"]
    L_DRIV["Driver Mobile Navigation App<br/>(Turn-by-Turn & Proof-of-Delivery)"]
    L_CUST["Customer Tracking Portal<br/>(Live ETA & Delivery Windows)"]
  end

  subgraph Edge_Layer["High-Throughput GPS Ingestion Edge"]
    L_WAF["Cloudflare Global Edge<br/>(WebSocket & DDoS Shield)"]
    L_GW["API & Telematics Gateway<br/>(Fastify / UDP GPS Demuxer)"]
  end

  subgraph Service_Mesh["Core Logistics Microservices (AWS ECS)"]
    L_TRACK["Live Vehicle Telematics Service<br/>(Coordinate Ingestion & Dead Reckoning)"]
    L_ROUTE["Route Optimization & Dispatch Engine<br/>(Multi-Stop Traveling Salesperson Solvers)"]
    L_POD["Proof of Delivery & Signature Svc<br/>(Geofenced Drop-off Validation)"]
    L_COLD["Cold Chain Sensor Monitor<br/>(Temperature & Door Sensor Alarms)"]
  end

  subgraph AI_Pipeline["Real-Time Streaming & Spatial AI"]
    L_KAFKA["Apache Kafka Event Stream<br/>(100k Geolocation Pings/Min)"]
    L_AI["Dynamic ETA & Traffic AI<br/>(Historical Speed & Weather Model)"]
  end

  subgraph Data_Layer["Spatial & Transactional Stores"]
    L_GIS[("PostgreSQL 16 with PostGIS<br/>Geospatial Geofences & Polygons")]
    L_REDIS[("Redis Cluster with GeoSpatial<br/>Live Lat/Lng Coordinates")]
    L_S3[("Amazon S3 Bucket<br/>Delivery Signature Photos & Bills")]
  end

  L_DISP --> L_WAF
  L_DRIV --> L_WAF
  L_CUST --> L_WAF
  L_WAF --> L_GW

  L_GW --> L_TRACK
  L_GW --> L_ROUTE
  L_GW --> L_POD
  L_GW --> L_COLD

  L_TRACK --> L_KAFKA
  L_KAFKA --> L_AI
  L_AI --> L_ROUTE

  L_TRACK --> L_GIS
  L_TRACK --> L_REDIS
  L_POD --> L_S3
  L_ROUTE --> L_GIS

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef ai fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class L_DISP,L_DRIV,L_CUST client
  class L_WAF,L_GW edge
  class L_TRACK,L_ROUTE,L_POD,L_COLD service
  class L_KAFKA,L_AI ai
  class L_GIS,L_REDIS,L_S3 data
`;

export const LOGISTICS_LLD_DIAGRAM = `sequenceDiagram
  autonumber
  actor Driver as "Fleet Truck Driver"
  participant MobileApp as "Driver Navigation App"
  participant Gateway as "Telematics Gateway"
  participant TrackingSvc as "Vehicle Tracking Svc"
  participant Kafka as "Apache Kafka Stream"
  participant RouteAI as "Dynamic ETA Engine"
  participant RedisGeo as "Redis GeoSpatial Index"
  participant PostGIS as "PostgreSQL 16 PostGIS"
  actor Customer as "Consignee / Customer"

  Note over Driver,MobileApp: Real-Time GPS Telemetry Ping - Every 3s
  Driver->>MobileApp: Vehicle moving along Highway Route
  MobileApp->>Gateway: POST /api/v1/telematics/ping [Coordinates and Speed]
  Gateway->>TrackingSvc: Forward raw coordinate packet
  TrackingSvc->>RedisGeo: GEOADD fleet_active_drivers
  TrackingSvc->>Kafka: Publish DriverPositionUpdated event

  Note over Kafka,RouteAI: Geofence Verification and Live ETA
  Kafka->>RouteAI: Evaluate distance to destination waypoint
  RouteAI->>PostGIS: ST_DWithin spatial geofence calculation
  RouteAI->>RouteAI: Recalculate ETA traffic adjusted
  RouteAI->>Customer: Push Webhook - Driver is 2 miles away
  Customer-->>RouteAI: 200 OK [Dock 4 Reserved]
`;

export const LOGISTICS_TOPOLOGY_DIAGRAM = `graph LR
  subgraph L1["1. Fleet Frontends"]
    LOG_DISP["Dispatch Web Console"]
    LOG_DRV["Driver Mobile App"]
    LOG_CUST["Customer Live Tracking"]
  end

  subgraph L2["2. Telematics Ingress"]
    LOG_WAF["Cloudflare Edge Ingress"]
    LOG_GW["High-Throughput Telematics Gateway"]
    LOG_AUTH["Hardware Token & OAuth Guard"]
  end

  subgraph L3["3. Logistics Microservices"]
    LOG_TRK["Live Vehicle Tracking Svc"]
    LOG_ROT["Route Optimization Svc"]
    LOG_POD["Proof-of-Delivery Svc"]
  end

  subgraph L4["4. Spatial Engine & AI"]
    LOG_KAFKA["Apache Kafka Event Bus"]
    LOG_ETA["Machine Learning ETA Estimator"]
    LOG_ALERT["Cold Chain Alert Worker"]
  end

  subgraph L5["5. Geospatial Stores"]
    LOG_GIS[("PostgreSQL 16 (PostGIS)")]
    LOG_RED[("Redis 7 Geo Cluster")]
    LOG_S3[("Amazon S3 Signature Store")]
  end

  LOG_DISP --> LOG_WAF
  LOG_DRV --> LOG_WAF
  LOG_CUST --> LOG_WAF
  LOG_WAF --> LOG_GW
  LOG_GW --> LOG_AUTH
  LOG_AUTH --> LOG_TRK
  LOG_AUTH --> LOG_ROT
  LOG_AUTH --> LOG_POD
  LOG_TRK --> LOG_KAFKA
  LOG_KAFKA --> LOG_ETA
  LOG_ETA --> LOG_ROT
  LOG_TRK --> LOG_GIS
  LOG_TRK --> LOG_RED
  LOG_POD --> LOG_S3

  classDef c1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef c2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef c3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef c4 fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF
  classDef c5 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class LOG_DISP,LOG_DRV,LOG_CUST c1
  class LOG_WAF,LOG_GW,LOG_AUTH c2
  class LOG_TRK,LOG_ROT,LOG_POD c3
  class LOG_KAFKA,LOG_ETA,LOG_ALERT c4
  class LOG_GIS,LOG_RED,LOG_S3 c5
`;

export const LOGISTICS_SECURITY_SLA_DIAGRAM = `graph TB
  subgraph Public_Zone["Field Fleets & Mobile Networks"]
    LOG_FLEET["5,000+ Vehicles with GPS Modems & Tablets"]
    LOG_EDGE["Cloudflare Edge with TCP/UDP WebSockets"]
  end

  subgraph DMZ_Zone["DMZ & Ingestion Proxy"]
    LOG_INGEST["Telematics Ingestion Cluster (Rate Limiter: 100k pings/min)"]
    LOG_TOKEN["Vehicle Device Token Authentication"]
  end

  subgraph Private_App_VPC["Private Dispatch VPC Subnet"]
    LOG_SERVICES["Fleet Microservices on AWS ECS Fargate"]
    LOG_STREAM["Apache Kafka Cluster (Multi-Broker Replica)"]
    LOG_MESH["Internal VPC Peering with Mutual TLS"]
  end

  subgraph Isolated_Data_VPC["Spatial Data VPC (Multi-AZ)"]
    LOG_POSTGIS[("PostgreSQL 16 with PostGIS (KMS Encrypted)")]
    LOG_GEO_REDIS[("Redis Enterprise (In-Memory Lat/Lng Index)")]
    LOG_BACKUP[("Continuous WAL Backups & Point-in-Time Recovery")]
  end

  subgraph SLA_Guarantees["Fleet Operations SLA Standards"]
    LOG_SLA1["GPS Ingestion Availability: 99.95%"]
    LOG_SLA2["P99 Telematics Latency: < 25ms"]
    LOG_SLA3["Live Geofence Alert Trigger: < 2.0s"]
    LOG_SLA4["Disaster Recovery RTO: < 15 Minutes"]
  end

  LOG_FLEET --> LOG_EDGE
  LOG_EDGE --> LOG_INGEST
  LOG_INGEST --> LOG_TOKEN
  LOG_TOKEN --> LOG_SERVICES
  LOG_SERVICES --> LOG_STREAM
  LOG_SERVICES --> LOG_MESH
  LOG_SERVICES --> LOG_POSTGIS
  LOG_SERVICES --> LOG_GEO_REDIS
  LOG_POSTGIS --> LOG_BACKUP

  classDef zone1 fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef zone2 fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef zone3 fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef zone4 fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF
  classDef zone5 fill:#16A34A,stroke:#15803D,stroke-width:2px,color:#FFFFFF

  class LOG_FLEET,LOG_EDGE zone1
  class LOG_INGEST,LOG_TOKEN zone2
  class LOG_SERVICES,LOG_STREAM,LOG_MESH zone3
  class LOG_POSTGIS,LOG_GEO_REDIS,LOG_BACKUP zone4
  class LOG_SLA1,LOG_SLA2,LOG_SLA3,LOG_SLA4 zone5
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT LISTS PER DOMAIN
// ─────────────────────────────────────────────────────────────────────────────
export const HR_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "web-client",
    name: "Web Application & Client Portal",
    layer: "Client & Presentation",
    techStack: ["React 18", "TanStack Router", "Tailwind CSS", "Motion"],
    description: "Responsive Single Page Application serving recruiters and corporate clients for candidate review, attendance logging, and solution studio customization.",
    securityPolicies: [
      "Strict Content-Security-Policy (CSP)",
      "PKCE OAuth 2.0 Auth Flow with HTTP-only session cookies",
      "Client-side PII masking for candidate contact records before authorization",
    ],
    scalingConsiderations: [
      "Static assets distributed via Cloudflare Edge CDN",
      "Route-based code splitting & tree-shaking (< 150KB initial bundle)",
      "Local state memoization and IndexedDB client cache",
    ],
    latencyBudget: "P95 < 200ms",
    availabilitySla: "99.95%",
    dependencies: ["api-gateway", "supabase-auth"],
    dataIngress: "User events, candidate form submissions, punch timestamps",
    dataEgress: "Rendered DOM, virtualized data grids, exported CSVs",
  },
  {
    id: "api-gateway",
    name: "API Gateway & Auth Proxy",
    layer: "API Gateway & Edge",
    techStack: ["Fastify / Node.js", "Kong Gateway", "Redis Rate Limiter"],
    description: "Centralized entry point terminating SSL, verifying JWT signatures, enforcing tenant-isolation rate limits, and routing requests to backend services.",
    securityPolicies: [
      "mTLS between gateway and internal microservices",
      "Token bucket rate limiting (120 req/min per agency tenant)",
      "OWASP Top 10 automated sanitization & schema validation via Zod",
    ],
    scalingConsiderations: [
      "Stateless containerized pods on AWS ECS Fargate",
      "Auto-scaling based on CPU (> 65%) and request queue depth",
      "Connection keep-alive and HTTP/2 multiplexing",
    ],
    latencyBudget: "P99 < 15ms overhead",
    availabilitySla: "99.99%",
    dependencies: ["ats-service", "attendance-service", "ai-engine", "auth-service"],
    dataIngress: "REST JSON payloads, JWT bearer tokens, multipart file streams",
    dataEgress: "Normalized microservice RPC calls, filtered JSON responses",
  },
  {
    id: "ats-service",
    name: "Core ATS & Candidate Pipeline Service",
    layer: "Core Services",
    techStack: ["Python FastAPI", "SQLAlchemy 2.0", "PostgreSQL 16"],
    description: "Manages candidate lifecycles, interview stages, job requisitions, rating scorecards, and client portal shortlist approvals.",
    securityPolicies: [
      "Row-Level Security (RLS) enforcing strict agency workspace boundaries",
      "AES-256 field-level encryption for candidate salary and contact PII",
      "Audit trail logging for all stage changes and candidate profile edits",
    ],
    scalingConsiderations: [
      "Read-replica routing for pipeline queries and dashboard summaries",
      "Optimistic locking for candidate stage transitions",
      "Compound b-tree indexing on (tenant_id, stage, created_at)",
    ],
    latencyBudget: "P95 < 80ms",
    availabilitySla: "99.9%",
    dependencies: ["postgres-db", "redis-cache", "async-worker"],
    dataIngress: "Candidate CRUD mutations, filter queries, stage update commands",
    dataEgress: "Structured candidate models, pagination cursors, webhook events",
  },
  {
    id: "attendance-service",
    name: "Smart Attendance & Timesheet Engine",
    layer: "Core Services",
    techStack: ["Node.js / TypeScript", "Prisma ORM", "TimescaleDB / PostgreSQL"],
    description: "Processes consultant punch timestamps, calculates active session durations, enforces break policies, and aggregates monthly billing timesheets.",
    securityPolicies: [
      "Cryptographic HMAC signing on clock-in payloads to prevent timestamp tampering",
      "Geo-fencing and client IP verification for remote consultant shifts",
      "Immutable append-only punch audit log",
    ],
    scalingConsiderations: [
      "Time-bucket hypertable partitioning by month for high-throughput punches",
      "Redis in-memory active session tracking with atomic TTL expiration",
      "Batch timesheet invoice generation running off-peak",
    ],
    latencyBudget: "P99 < 35ms",
    availabilitySla: "99.95%",
    dependencies: ["postgres-db", "redis-cache"],
    dataIngress: "Consultant punch triggers, timesheet approval requests",
    dataEgress: "Daily duration metrics, calculated work intervals, monthly reports",
  },
  {
    id: "ai-engine",
    name: "AI Solution & Resume Screening Engine",
    layer: "Async & AI Pipeline",
    techStack: ["LangChain", "Claude 3.5 Sonnet", "Celery / Redis", "pgvector"],
    description: "Performs semantic resume-to-job matching, automated candidate qualification summaries, solution synthesis, and dynamic schema regeneration.",
    securityPolicies: [
      "Zero-data retention agreements with LLM API providers",
      "Automated PII anonymization prior to prompt embedding",
      "Isolated prompt injection guards and output schema validation",
    ],
    scalingConsiderations: [
      "Asynchronous Celery task queues with priority workers for interactive calls",
      "HNSW vector indexing for sub-100ms similarity searches across 50,000+ resumes",
      "Semantic response caching for identical job framing queries in Redis",
    ],
    latencyBudget: "P90 < 2.5s (async jobs < 15s)",
    availabilitySla: "99.5%",
    dependencies: ["redis-cache", "postgres-db", "llm-provider"],
    dataIngress: "Raw resumes (PDF/DOCX), job requirements, prompt contexts",
    dataEgress: "Match score matrices, extracted candidate skills, synthesized schemas",
  },
  {
    id: "postgres-db",
    name: "PostgreSQL Primary Cluster (Multi-AZ)",
    layer: "Data & Cache",
    techStack: ["PostgreSQL 16", "pgvector", "AWS Aurora Serverless v2"],
    description: "Relational persistence store holding workspaces, candidate pipelines, job orders, attendance logs, client accounts, and vector embeddings.",
    securityPolicies: [
      "Encryption-at-rest via AWS KMS Customer Managed Keys",
      "TLS 1.3 enforced for all client and connection pooler traffic",
      "Strict network isolation inside private VPC subnets with zero public ingress",
    ],
    scalingConsiderations: [
      "Aurora Auto-Scaling Read Replicas (up to 15 nodes)",
      "PgBouncer connection pooler managing 5,000+ concurrent clients",
      "Automated continuous WAL backups with point-in-time recovery (PITR)",
    ],
    latencyBudget: "P95 query < 8ms",
    availabilitySla: "99.99%",
    dependencies: [],
    dataIngress: "Transactional SQL queries, pgvector similarity lookups, WAL stream",
    dataEgress: "Query result sets, binary logical replication streams",
  },
  {
    id: "redis-cache",
    name: "Redis Enterprise In-Memory Fabric",
    layer: "Data & Cache",
    techStack: ["Redis 7.2 Cluster", "AWS ElastiCache"],
    description: "In-memory caching for session tokens, active attendance punch clocks, rate limiter buckets, and Celery task queues.",
    securityPolicies: [
      "AUTH token requirement with TLS in-transit encryption",
      "VPC security groups restricting access to microservice subnets only",
      "No long-term sensitive credential storage",
    ],
    scalingConsiderations: [
      "3-shard cluster with multi-AZ replica failover (< 30s failover)",
      "LRU eviction policy with segregated memory namespaces",
      "Sub-millisecond read/write operations",
    ],
    latencyBudget: "P99 < 1.5ms",
    availabilitySla: "99.99%",
    dependencies: [],
    dataIngress: "Session keys, temporary punch timestamps, pub/sub events",
    dataEgress: "Cached JSON structures, rate limit counters, task payload dispatches",
  },
];

export const SOLAR_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "solar-app",
    name: "Field Technician PWA & Diagnostics",
    layer: "Client & Presentation",
    techStack: ["React 18", "PWA Offline Cache", "Web Bluetooth", "IndexedDB"],
    description: "Offline-first mobile application used by solar technicians for onsite inverter parameter tuning, firmware flashes, and instant error code diagnosis.",
    securityPolicies: [
      "Mutual TLS certificate pinning for field technician devices",
      "Local encrypted IndexedDB with AES-256 for offline inverter configs",
      "Biometric device unlocking prior to issuing inverter reboot commands",
    ],
    scalingConsiderations: [
      "Service worker background synchronization upon cellular reconnection",
      "Vectorized SVG schematics cached on device (< 10MB total footprint)",
    ],
    latencyBudget: "Offline Instant (< 5ms)",
    availabilitySla: "99.99%",
    dependencies: ["api-gateway", "iot-core"],
    dataIngress: "Bluetooth telemetry bursts, technician inspection notes",
    dataEgress: "Signed field diagnostic logs, work order completion tokens",
  },
  {
    id: "iot-core",
    name: "AWS IoT Core Telematics Gateway",
    layer: "API Gateway & Edge",
    techStack: ["AWS IoT Core", "MQTT over TLS 1.3", "X.509 Hardware Certs"],
    description: "Terminates 10,000+ continuous MQTT streams from rooftop and ground-mounted solar inverters, verifying hardware authenticity before passing to Kafka.",
    securityPolicies: [
      "Hardware-level X.509 cryptographic device certificates",
      "Strict topic namespace isolation per solar plant UUID",
      "Automated revocation of tampered or blacklisted inverter MAC addresses",
    ],
    scalingConsiderations: [
      "Auto-scaling ingestion broker supporting up to 250,000 concurrent MQTT connections",
      "Sub-millisecond QoS 1 packet acknowledgement",
    ],
    latencyBudget: "P99 < 10ms",
    availabilitySla: "99.999%",
    dependencies: ["telemetry-engine"],
    dataIngress: "Raw inverter sensor payloads (Voltage, Amperage, Frequency, Temp)",
    dataEgress: "Normalized telemetry events piped to Apache Kafka",
  },
  {
    id: "telemetry-engine",
    name: "High-Throughput Telemetry Ingestion Engine",
    layer: "Core Services",
    techStack: ["Golang", "Apache Kafka", "TimescaleDB Client"],
    description: "Lightweight Go microservice executing sub-second validation, unit conversion, and bulk batch insertion of time-series inverter metrics.",
    securityPolicies: [
      "Zero public IP ingress; located entirely inside private AWS VPC",
      "Strict data sanitization rejecting out-of-bounds voltage spikes",
    ],
    scalingConsiderations: [
      "Batched buffer flushes (500 records/batch or 100ms)",
      "Stateless horizontally autoscaled pods via Kubernetes HPA",
    ],
    latencyBudget: "P95 < 25ms",
    availabilitySla: "99.95%",
    dependencies: ["timescaledb", "kafka-bus"],
    dataIngress: "Decoded MQTT JSON packets",
    dataEgress: "Compressed time-series hypertable rows, Kafka stream messages",
  },
  {
    id: "solar-ai-engine",
    name: "Predictive Yield & Arc Fault AI Model",
    layer: "Async & AI Pipeline",
    techStack: ["Python", "PyTorch", "TimescaleDB Continuous Aggregates", "Claude 3.5"],
    description: "Evaluates multi-second inverter thermal slopes, detecting string degradations, dust accumulation, and arc faults before equipment damage occurs.",
    securityPolicies: [
      "Sandboxed ML execution container with isolated network egress",
      "Audit trail on all automated dispatch trigger decisions",
    ],
    scalingConsiderations: [
      "GPU-accelerated inference instances for real-time stream scoring",
      "Continuous aggregate rollups (1m, 5m, 1h) calculated inside database",
    ],
    latencyBudget: "P90 < 1.2s",
    availabilitySla: "99.9%",
    dependencies: ["timescaledb", "work-order-svc"],
    dataIngress: "1-minute sliding window sensor metrics and ambient solar radiation",
    dataEgress: "Degradation confidence scores, automated work order recommendations",
  },
  {
    id: "timescaledb",
    name: "TimescaleDB Time-Series Cluster",
    layer: "Data & Cache",
    techStack: ["TimescaleDB / PostgreSQL 16", "AWS EBS gp3 (IOPS Optimized)"],
    description: "Time-series database partitioned into 7-day chunk hypertables with automated 90% columnar compression for sensor history.",
    securityPolicies: [
      "Encrypted at rest with AWS KMS Customer Managed Keys",
      "Strict VPC network security group restricted to telemetry pods",
    ],
    scalingConsiderations: [
      "Columnar compression reducing disk footprint by up to 92%",
      "Multi-AZ hot standby replica with automated failover < 30s",
    ],
    latencyBudget: "P95 query < 12ms",
    availabilitySla: "99.99%",
    dependencies: [],
    dataIngress: "Continuous time-series sensor points (100,000 writes/sec)",
    dataEgress: "Downsampled hourly generation graphs, anomaly queries",
  },
];

export const HEALTHCARE_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "clinician-portal",
    name: "Doctor & Pathologist Review Workstation",
    layer: "Client & Presentation",
    techStack: ["React 18", "TanStack Table", "DICOM Web Viewer", "Tailwind CSS"],
    description: "High-density medical interface for reviewing diagnostic panels, abnormal pathology values, and digitally signing lab reports.",
    securityPolicies: [
      "Strict HIPAA compliance with automated 5-minute inactivity session lock",
      "Cryptographic PKI digital signature for diagnostic approval",
      "Zero patient PII cached in unencrypted browser storage",
    ],
    scalingConsiderations: [
      "Virtualized patient tables handling 10,000+ daily sample records smoothly",
      "Asynchronous DICOM chunk streaming",
    ],
    latencyBudget: "P95 < 150ms",
    availabilitySla: "99.99%",
    dependencies: ["fhir-gateway", "report-svc"],
    dataIngress: "Doctor signature approvals, specimen override flags",
    dataEgress: "Digitally signed diagnostic PDFs, HL7 dispatch orders",
  },
  {
    id: "fhir-gateway",
    name: "HL7 / FHIR v4 Interoperability Gateway",
    layer: "API Gateway & Edge",
    techStack: ["Fastify / Node.js", "HAPI FHIR", "Redis Token Guard"],
    description: "Standardized medical data ingress gateway facilitating secure HL7 / FHIR exchange between hospital EMRs and automated laboratory analyzers.",
    securityPolicies: [
      "Enforces SMART on FHIR OAuth 2.0 authorization scopes",
      "Mutual TLS (mTLS) with hospital EMR firewalls",
      "HIPAA Business Associate Agreement (BAA) certified data pipeline",
    ],
    scalingConsiderations: [
      "Stateless containerized pods on AWS ECS Fargate",
      "Sub-15ms schema validation against HL7 FHIR v4 R4 specifications",
    ],
    latencyBudget: "P99 < 20ms",
    availabilitySla: "99.999%",
    dependencies: ["lis-engine", "auth-service"],
    dataIngress: "HL7 v2.x feeds, FHIR Observation resources, JSON lab orders",
    dataEgress: "Validated internal microservice requests, FHIR bundle responses",
  },
  {
    id: "lis-engine",
    name: "LIS Specimen Chain-of-Custody Engine",
    layer: "Core Services",
    techStack: ["Python FastAPI", "SQLAlchemy", "PostgreSQL 16 Multi-AZ"],
    description: "Tracks physical blood and tissue specimens from phlebotomy collection through centrifuge routing, analyzer execution, and disposal.",
    securityPolicies: [
      "Immutable append-only chain-of-custody audit trail",
      "Field-level AES-256 encryption on all patient identification columns",
    ],
    scalingConsiderations: [
      "Optimistic concurrency control preventing duplicate sample processing",
      "Read replicas dedicated to clinical dashboard queries",
    ],
    latencyBudget: "P95 < 45ms",
    availabilitySla: "99.95%",
    dependencies: ["healthcare-db", "rabbit-mq"],
    dataIngress: "Barcode scanner scan events, instrument completion codes",
    dataEgress: "Chain-of-custody timestamps, analyzer queue dispatches",
  },
  {
    id: "critical-alert-svc",
    name: "Critical Value Alert & Anomaly Dispatcher",
    layer: "Async & AI Pipeline",
    techStack: ["Node.js", "RabbitMQ", "Twilio Medical SIP", "BioBERT"],
    description: "Evaluates analyzer results against physiological critical thresholds (e.g. Potassium < 2.5 or > 6.5 mmol/L) and guarantees physician notification within 30 seconds.",
    securityPolicies: [
      "Encrypted outbound telephony payload with doctor PIN verification",
      "Mandatory confirmation loop logging exact second of physician receipt",
    ],
    scalingConsiderations: [
      "High-priority dedicated worker queue with zero-latency priority bypass",
      "Automatic failover to secondary on-call phone numbers",
    ],
    latencyBudget: "End-to-End < 3.0s",
    availabilitySla: "99.999%",
    dependencies: ["rabbit-mq", "healthcare-db"],
    dataIngress: "Analyzer test values, patient demographic baselines",
    dataEgress: "Urgent SMS, automated phone call dispatch, doctor acknowledgement",
  },
  {
    id: "healthcare-db",
    name: "HIPAA Certified PostgreSQL Primary Cluster",
    layer: "Data & Cache",
    techStack: ["AWS Aurora PostgreSQL 16", "AWS KMS Customer Keys"],
    description: "High-security relational database holding electronic health records, specimen stages, diagnostic reports, and audit logs.",
    securityPolicies: [
      "Enforces Row-Level Security (RLS) ensuring strict clinic/doctor isolation",
      "Encrypted at rest with AWS KMS Customer Managed Keys",
      "7-year automated continuous backup retention meeting medical audit rules",
    ],
    scalingConsiderations: [
      "Aurora multi-master / multi-AZ failover with sub-30 second RTO",
      "PgBouncer pooler handling thousands of concurrent hospital queries",
    ],
    latencyBudget: "P95 query < 6ms",
    availabilitySla: "99.999%",
    dependencies: [],
    dataIngress: "Encrypted patient data, clinical observations, audit writes",
    dataEgress: "Patient diagnostic histories, lab result sets",
  },
];

export const LOGISTICS_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "dispatch-console",
    name: "Fleet Operations & Dispatch Console",
    layer: "Client & Presentation",
    techStack: ["React 18", "Mapbox GL", "WebSocket", "Tailwind CSS"],
    description: "Real-time dispatch dashboard rendering 5,000+ active trucks on an interactive geospatial map with live geofence alert overlays.",
    securityPolicies: [
      "Strict role-based access control (Dispatcher vs Branch Manager)",
      "Encrypted WebSocket tunnel with per-session token validation",
    ],
    scalingConsiderations: [
      "Canvas-based GPU marker clustering for 10,000+ simultaneous coordinates",
      "Viewport-based spatial bounding box subscription in Redis",
    ],
    latencyBudget: "P95 < 120ms",
    availabilitySla: "99.95%",
    dependencies: ["telematics-gw", "route-svc"],
    dataIngress: "Live GPS coordinates, driver status updates, route overrides",
    dataEgress: "Map renders, route assignment commands, emergency alerts",
  },
  {
    id: "telematics-gw",
    name: "High-Throughput Telematics Gateway",
    layer: "API Gateway & Edge",
    techStack: ["Fastify", "Node.js cluster", "Redis Ingestion Buffer"],
    description: "Terminates high-frequency GPS ping streams from onboard vehicle telematics units (OBD-II / CAN-bus modems), unpacking coordinates at 100k pings/min.",
    securityPolicies: [
      "Hardware cryptographic token validation on every 3-second ping",
      "Rate limiting to prevent telemetry DDoS from malfunctioning modems",
    ],
    scalingConsiderations: [
      "Stateless UDP/TCP demuxing on AWS Network Load Balancer",
      "Sub-5ms packet parsing before streaming into Apache Kafka",
    ],
    latencyBudget: "P99 < 15ms",
    availabilitySla: "99.99%",
    dependencies: ["tracking-svc", "kafka-bus"],
    dataIngress: "Binary and JSON GPS coordinates, engine RPM, fuel levels",
    dataEgress: "Normalized geospatial event objects emitted to Kafka",
  },
  {
    id: "tracking-svc",
    name: "Live Tracking & Geofence Service",
    layer: "Core Services",
    techStack: ["Node.js / TypeScript", "PostgreSQL PostGIS", "Redis Geo"],
    description: "Maintains active coordinates in Redis Geospatial indexes and executes PostGIS spatial queries to detect customer geofence entries/exits.",
    securityPolicies: [
      "VPC network isolation with mTLS communication to Kafka and databases",
      "Zero external access to raw driver location histories without audit logging",
    ],
    scalingConsiderations: [
      "Sub-millisecond Redis GEOADD operations for 5,000 trucks",
      "Spatial R-tree indexing on customer geofence polygons in PostgreSQL",
    ],
    latencyBudget: "P95 < 20ms",
    availabilitySla: "99.95%",
    dependencies: ["postgis-db", "redis-geo"],
    dataIngress: "Raw GPS stream from Kafka",
    dataEgress: "Geofence crossing triggers, updated live driver positions",
  },
  {
    id: "route-optimization-ai",
    name: "Dynamic Route & ETA Optimization Engine",
    layer: "Async & AI Pipeline",
    techStack: ["Python", "OR-Tools", "GraphHopper", "Celery / Redis"],
    description: "Solves Multi-Vehicle Routing Problems with Time Windows (VRPTW), dynamically updating delivery ETAs based on real-time traffic and weather.",
    securityPolicies: [
      "Zero customer PII passed to route solver engines; uses anonymized waypoint IDs",
    ],
    scalingConsiderations: [
      "Heuristic genetic algorithms providing sub-second incremental re-routes",
      "Heavy global route optimization batches scheduled during off-peak hours",
    ],
    latencyBudget: "P90 < 1.5s (Batch < 30s)",
    availabilitySla: "99.9%",
    dependencies: ["postgis-db", "redis-geo"],
    dataIngress: "Live traffic feeds, waypoint manifests, current truck coordinates",
    dataEgress: "Optimized turn-by-turn route paths, recalculated customer ETAs",
  },
  {
    id: "postgis-db",
    name: "PostgreSQL 16 Spatial Cluster (PostGIS)",
    layer: "Data & Cache",
    techStack: ["AWS Aurora PostgreSQL 16", "PostGIS Extension"],
    description: "Enterprise spatial persistence engine storing geofence boundary geometries, historical route trajectories, delivery manifests, and driver records.",
    securityPolicies: [
      "KMS encryption at rest with automated continuous point-in-time recovery",
      "Strict network security group access restricted to private VPC subnets",
    ],
    scalingConsiderations: [
      "Spatial GiST indexing on vehicle trajectories and geofence polygons",
      "Partitioning route history tables by calendar month",
    ],
    latencyBudget: "P95 query < 10ms",
    availabilitySla: "99.99%",
    dependencies: [],
    dataIngress: "Manifest inserts, geofence definitions, historical trajectory points",
    dataEgress: "Spatial intersection results, historical delivery reports",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT FACTORY: GET ARCHITECTURE FOR ANY PROBLEM INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function getArchitectureBlueprint(
  workspaceContext?: {
    businessName?: string;
    industry?: string;
    problemStatement?: string;
  } | null
): ArchitectureBlueprint {
  const name = workspaceContext?.businessName?.trim() || "TalentCraft HR Consultancy";
  const ind = workspaceContext?.industry?.toLowerCase() || "";
  const prob = workspaceContext?.problemStatement?.toLowerCase() || "";
  const combined = `${ind} ${prob} ${name.toLowerCase()}`;

  // 1. Detect Solar / Clean Tech / Energy / IoT / Grid
  if (
    combined.includes("solar") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("clean tech") ||
    combined.includes("grid") ||
    combined.includes("panel") ||
    combined.includes("battery") ||
    combined.includes("iot") ||
    combined.includes("utility") ||
    combined.includes("power")
  ) {
    return {
      domainId: "solar",
      domainTitle: `${name} — Clean Tech & IoT Cloud Architecture`,
      hldDiagram: SOLAR_HLD_DIAGRAM,
      lldDiagram: SOLAR_LLD_DIAGRAM,
      topologyDiagram: SOLAR_TOPOLOGY_DIAGRAM,
      securitySlaDiagram: SOLAR_SECURITY_SLA_DIAGRAM,
      components: SOLAR_COMPONENTS,
      keyDecisions: [
        {
          title: "Edge Inverter Telemetry Decoupling",
          detail: "IoT Core terminates MQTT connections and buffers raw sensor streams into Apache Kafka, insulating the database from 10,000+ simultaneous second-by-second inverter bursts.",
          badge: "Resilience",
        },
        {
          title: "Time-Series Hypertable Partitioning",
          detail: "TimescaleDB chunks high-frequency metrics into 7-day intervals with 92% columnar compression, keeping query latency sub-15ms across hundreds of gigabytes.",
          badge: "Performance",
        },
        {
          title: "Hardware Cryptographic Device Auth",
          detail: "Mutual X.509 device certificates ensure zero unauthorized hardware can inject fraudulent kilowatt generation or grid metering metrics.",
          badge: "Security",
        },
      ],
      summary: {
        cloudProvider: "AWS (IoT Core + ECS Fargate)",
        dbEngine: "TimescaleDB + Aurora PostgreSQL 16",
        concurrencyTarget: "100,000 sensor writes/sec",
        primarySla: "99.99% Telemetry Ingestion Uptime",
      },
    };
  }

  // 2. Detect Healthcare / Diagnostic Labs / Clinical / Pharma
  if (
    combined.includes("health") ||
    combined.includes("clinic") ||
    combined.includes("doctor") ||
    combined.includes("diagnostic") ||
    combined.includes("lab") ||
    combined.includes("patient") ||
    combined.includes("pharma") ||
    combined.includes("medical") ||
    combined.includes("specimen") ||
    combined.includes("pathology") ||
    combined.includes("hospital")
  ) {
    return {
      domainId: "healthcare",
      domainTitle: `${name} — HIPAA Certified Diagnostic Architecture`,
      hldDiagram: HEALTHCARE_HLD_DIAGRAM,
      lldDiagram: HEALTHCARE_LLD_DIAGRAM,
      topologyDiagram: HEALTHCARE_TOPOLOGY_DIAGRAM,
      securitySlaDiagram: HEALTHCARE_SECURITY_SLA_DIAGRAM,
      components: HEALTHCARE_COMPONENTS,
      keyDecisions: [
        {
          title: "Sub-3s Critical Value Emergency Pipeline",
          detail: "Abnormal blood panels trigger priority RabbitMQ workers with automated telephony dispatch to notify the attending doctor within seconds.",
          badge: "Life-Safety",
        },
        {
          title: "HIPAA Zero-Trust Data Isolation",
          detail: "Row-Level Security (RLS) and AWS KMS Customer Managed Keys guarantee strict patient record isolation across laboratory clinics.",
          badge: "Security",
        },
        {
          title: "FHIR v4 Interoperability Standard",
          detail: "Standardized HL7 FHIR v4 schema validation permits automated bidirectional synchronization between clinic EMRs and automated blood analyzers.",
          badge: "Compliance",
        },
      ],
      summary: {
        cloudProvider: "AWS (HIPAA BAA + ECS Fargate)",
        dbEngine: "PostgreSQL 16 Multi-AZ (Encrypted PHI)",
        concurrencyTarget: "25,000 lab orders/hour",
        primarySla: "99.99% Emergency Lab Result Availability",
      },
    };
  }

  // 3. Detect Logistics / Fleet / Delivery / Supply Chain
  if (
    combined.includes("logistics") ||
    combined.includes("fleet") ||
    combined.includes("delivery") ||
    combined.includes("truck") ||
    combined.includes("dispatch") ||
    combined.includes("transport") ||
    combined.includes("freight") ||
    combined.includes("cargo") ||
    combined.includes("warehouse") ||
    combined.includes("supply chain")
  ) {
    return {
      domainId: "logistics",
      domainTitle: `${name} — High-Throughput Telematics & Fleet Architecture`,
      hldDiagram: LOGISTICS_HLD_DIAGRAM,
      lldDiagram: LOGISTICS_LLD_DIAGRAM,
      topologyDiagram: LOGISTICS_TOPOLOGY_DIAGRAM,
      securitySlaDiagram: LOGISTICS_SECURITY_SLA_DIAGRAM,
      components: LOGISTICS_COMPONENTS,
      keyDecisions: [
        {
          title: "Sub-Millisecond Redis Geo Indexing",
          detail: "Live truck coordinates update Redis geospatial buckets, enabling dispatchers to render thousands of active vehicles on Mapbox without disk IOPS bottlenecks.",
          badge: "Performance",
        },
        {
          title: "Spatial PostGIS Geofence Evaluation",
          detail: "R-tree polygon indexes trigger customer delivery notifications automatically when a driver crosses a 500-meter threshold.",
          badge: "Automation",
        },
        {
          title: "Decoupled Telematics Ingestion",
          detail: "High-throughput Fastify UDP/TCP gateways buffer GPS pings into Apache Kafka to tolerate cellular dead-zone reconnection bursts.",
          badge: "Resilience",
        },
      ],
      summary: {
        cloudProvider: "AWS (ECS + Kafka Stream)",
        dbEngine: "PostgreSQL 16 PostGIS + Redis Geo",
        concurrencyTarget: "100,000 GPS coordinates/min",
        primarySla: "99.95% Fleet Dispatch Uptime",
      },
    };
  }

  // 4. Default: TalentCraft / HR Consultancy / Recruitment / Custom Business
  return {
    domainId: "hr",
    domainTitle: `${name} — Multi-Tenant Cloud Architecture`,
    hldDiagram: HR_HLD_DIAGRAM,
    lldDiagram: HR_LLD_DIAGRAM,
    topologyDiagram: HR_TOPOLOGY_DIAGRAM,
    securitySlaDiagram: HR_SECURITY_SLA_DIAGRAM,
    components: HR_COMPONENTS,
    keyDecisions: [
      {
        title: "Decoupled Webhook & Application Ingress",
        detail: "Candidate applications are acknowledged with 202 Accepted and offloaded to Celery worker queues to isolate heavy resume parsing from client response times.",
        badge: "Resilience",
      },
      {
        title: "Multi-Tenant Row-Level Security (RLS)",
        detail: "Strict workspace isolation at the database layer ensures recruiters cannot query cross-agency candidate or client compensation records.",
        badge: "Security",
      },
      {
        title: "In-Memory Attendance Clock Synchronization",
        detail: "Session punch timers write to Redis hyperlogs with atomic TTL keys to support sub-millisecond clock-ins without overwhelming disk IOPS.",
        badge: "Performance",
      },
    ],
    summary: {
      cloudProvider: "AWS (ECS Fargate + Aurora)",
      dbEngine: "PostgreSQL 16 Multi-AZ + Redis 7",
      concurrencyTarget: "5,000 concurrent active sessions",
      primarySla: "99.95% Core Service Availability",
    },
  };
}

// Backward-compatible exports
export const ARCHITECTURE_COMPONENTS = HR_COMPONENTS;
export const ENHANCED_HLD_DIAGRAM = HR_HLD_DIAGRAM;
export const ENHANCED_LLD_DIAGRAM = HR_LLD_DIAGRAM;
