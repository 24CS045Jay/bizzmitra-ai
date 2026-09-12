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

export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "web-client",
    name: "Web Application & Client Portal",
    layer: "Client & Presentation",
    techStack: ["React 18", "TanStack Router", "Tailwind CSS / Neumorphic Tokens", "Motion"],
    description: "Responsive Single Page Application serving both internal recruiters and external corporate clients for candidate review, attendance logging, and solution studio customization.",
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
    description: "Centralized entry point terminating SSL, verifying JWT signatures, enforcing tenant-isolation rate limits, and routing requests to appropriate backend services.",
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
    techStack: ["Python Fastify/FastAPI", "SQLAlchemy 2.0", "PostgreSQL 16"],
    description: "Manages candidate lifecycles, interview stages, job order requisitions, rating scorecards, and client portal shortlist approvals.",
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
    description: "Processes consultant punch-in/out timestamps, calculates active session durations, enforces break policies, and aggregates monthly billing timesheets.",
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
    techStack: ["LangChain", "OpenAI / Claude 3.5 Sonnet", "Celery / Redis", "pgvector"],
    description: "Performs semantic resume-to-job matching, automated candidate qualification summaries, solution architecture synthesis, and dynamic schema regeneration.",
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

export const ENHANCED_HLD_DIAGRAM = `graph TB
  subgraph Client_Layer["Client & Access Layer"]
    A1["Recruiter Workspace UI<br/>(React / TanStack)"]
    A2["Client Onboarding Portal<br/>(Self-Serve Shortlists)"]
    A3["Consultant Clock-In Web App<br/>(Smart Attendance)"]
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

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF;
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF;
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF;
  classDef ai fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFFFFF;
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF;

  class A1,A2,A3 client;
  class B1,B2 edge;
  class C1,C2,C3,C4 service;
  class D1,D2 ai;
  class E1,E2,E3 data;
`;

export const ENHANCED_LLD_DIAGRAM = `sequenceDiagram
  autonumber
  actor Recruiter as Recruiter / Consultant
  participant WebApp as Web Client (React)
  participant Gateway as API Gateway (Fastify)
  participant ATSSvc as Core ATS Service
  participant AttSvc as Attendance Service
  participant Queue as Redis Celery Queue
  participant AIEngine as AI Embedding Engine
  participant DB as PostgreSQL 16 (RDS)

  Note over Recruiter,WebApp: Flow A: Punch-In & Attendance Verification
  Recruiter->>WebApp: Clicks "Punch In"
  WebApp->>Gateway: POST /api/v1/attendance/punch (HMAC Token)
  Gateway->>AttSvc: Validate Consultant ID & Timestamp
  AttSvc->>DB: INSERT INTO attendance_punches (status=Active)
  AttSvc-->>WebApp: 201 Created (Clock running: 00:00:00)

  Note over Recruiter,WebApp: Flow B: Dynamic Schema & AI Candidate Ingestion
  Recruiter->>WebApp: Adds Candidate + Custom Attributes (Notice Period, CTC)
  WebApp->>Gateway: POST /api/v1/candidates (Payload with customValues)
  Gateway->>ATSSvc: Validate Schema against Studio v1.1 AST
  ATSSvc->>DB: INSERT INTO candidates & candidate_metadata
  ATSSvc->>Queue: Enqueue Resume Vectorization (candidate_id)
  Queue->>AIEngine: Generate 1536-dim Embedding
  AIEngine->>DB: UPDATE candidate SET embedding = vector_data
  ATSSvc-->>WebApp: 200 OK (Candidate visible in pipeline with custom badges)
`;
