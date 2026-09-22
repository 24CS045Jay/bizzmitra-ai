export type ViewportMode = "desktop" | "tablet" | "mobile";
export type ScreenConceptId = "dashboard" | "pipeline" | "insights" | "settings";

export interface ScreenConcept {
  id: ScreenConceptId;
  title: string;
  category: string;
  description: string;
  uxHighlights: string[];
  mockData: {
    headerTitle: string;
    headerSubtitle: string;
    liveBadge: string;
    actionLabel: string;
    kpis: {
      label: string;
      val: string;
      change: string;
    }[];
    visualWidgetTitle: string;
    visualWidgetSubtitle: string;
    stages: {
      stage: string;
      count: number | string;
      pct: number;
    }[];
    activityTitle: string;
    activities: {
      title: string;
      subtitle: string;
    }[];
    kanbanColumns?: {
      title: string;
      badgeColor: string;
      items: {
        name: string;
        meta: string;
        tag: string;
        urgency: string;
      }[];
    }[];
  };
}

export interface WireframeInventoryItem {
  id: string;
  name: string;
  note: string;
  screenTarget: ScreenConceptId;
}

export interface WireframeBlueprint {
  domainId: string;
  domainTitle: string;
  screenConcepts: ScreenConcept[];
  inventory: WireframeInventoryItem[];
  navFlowDiagram: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HR & RECRUITMENT BLUEPRINT (TalentCraft Default)
// ─────────────────────────────────────────────────────────────────────────────
export const HR_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "hr",
  domainTitle: "TalentCraft HR — Recruitment & Operations Suite",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Executive Operations Hub",
      category: "Primary Workspace",
      description: "High-density command center with live candidate pipeline velocity, recruiter SLA telemetry, and quick candidate intake.",
      uxHighlights: [
        "F-pattern visual hierarchy prioritizing SLA-urgency candidate cards",
        "One-click status transitions reducing recruiter admin clicks by 65%",
        "Real-time reactive telemetry without page reloads",
      ],
      mockData: {
        headerTitle: "TalentCraft Executive Command",
        headerSubtitle: "Real-time candidate telemetry & placement velocity",
        liveBadge: "● Live Syncing",
        actionLabel: "+ New Candidate",
        kpis: [
          { label: "Active Pipeline", val: "428 Candidates", change: "+14% vs last wk" },
          { label: "Interview Turnaround", val: "9.2 Days", change: "-67% faster (SLA)" },
          { label: "Placement Revenue", val: "₹18.4 Lakhs", change: "+24% MoM" },
          { label: "Recruiter Utilization", val: "94.2%", change: "8 of 8 active" },
        ],
        visualWidgetTitle: "Placement Velocity Funnel",
        visualWidgetSubtitle: "Weekly Sourcing to Offer Conversion",
        stages: [
          { stage: "Sourced & Screened", count: 428, pct: 100 },
          { stage: "Technical Evaluation", count: 184, pct: 43 },
          { stage: "Client Final Round", count: 72, pct: 17 },
          { stage: "Offer Accepted", count: 48, pct: 11 },
        ],
        activityTitle: "Live Recruiter Activity",
        activities: [
          { title: "Rahul S. placed Senior React Dev", subtitle: "₹28 LPA CTC • TechCorp Client" },
          { title: "Priya V. completed 8 screens", subtitle: "Turnaround: 18 mins avg" },
          { title: "Client AcmeCorp approved 3 profiles", subtitle: "Interview scheduled for tomorrow" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Interactive Candidate Pipeline",
      category: "Core Flow",
      description: "Multi-stage Kanban workflow with automated resume scoring, client interview scheduling, and smart punch timers.",
      uxHighlights: [
        "Color-coded SLA urgency indicators for fast candidate retention",
        "Inline quick-action modal for 1-click client interview booking",
        "Keyboard shortcut navigation (J/K navigation, 1-4 stage move)",
      ],
      mockData: {
        headerTitle: "Active Recruitment Pipeline Board",
        headerSubtitle: "Drag candidates across hiring stages with live AI matching scores",
        liveBadge: "Kanban Active",
        actionLabel: "+ Filter Roles",
        kpis: [
          { label: "In Screening", val: "142 Profiles", change: "30s AI Parser" },
          { label: "Client Review", val: "38 Shortlists", change: "Portal Shared" },
          { label: "Offer Stage", val: "16 Pending", change: "SLA: < 24h" },
          { label: "Avg CTC", val: "₹18.5 LPA", change: "Across 12 clients" },
        ],
        visualWidgetTitle: "Candidate Stage Distribution",
        visualWidgetSubtitle: "By Domain Specialty",
        stages: [
          { stage: "Full-Stack & Mobile Engineers", count: 180, pct: 60 },
          { stage: "AI / ML & Data Engineers", count: 120, pct: 40 },
          { stage: "DevOps & Cloud Architects", count: 80, pct: 27 },
          { stage: "Product Managers & Tech Leads", count: 48, pct: 16 },
        ],
        activityTitle: "Recent Profile Moves",
        activities: [
          { title: "Amit K. moved to Client Final", subtitle: "Score: 94% • Senior Golang SRE" },
          { title: "Neha R. offer letter dispatched", subtitle: "DocuSign sent • Notice: 15 days" },
        ],
        kanbanColumns: [
          {
            title: "1. Sourced & AI Parsed (42)",
            badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
            items: [
              { name: "Siddharth Rao", meta: "7 yrs • React, Next.js, TypeScript", tag: "AI Match: 96%", urgency: "New" },
              { name: "Ananya Iyer", meta: "5 yrs • Python, FastAPI, PyTorch", tag: "AI Match: 91%", urgency: "Today" },
            ],
          },
          {
            title: "2. Technical Screen (18)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "Rohan Mehra", meta: "9 yrs • AWS, Kubernetes, Terraform", tag: "Screen Passed", urgency: "24h SLA" },
              { name: "Kavita Deshmukh", meta: "4 yrs • Golang, Microservices", tag: "Score 88%", urgency: "Active" },
            ],
          },
          {
            title: "3. Client Interview (9)",
            badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
            items: [
              { name: "Aditya Verma", meta: "CTC: ₹32 LPA • Google Partner", tag: "Round 2 Final", urgency: "Tomorrow" },
            ],
          },
          {
            title: "4. Offer Extended (6)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "Meera Nair", meta: "Senior Lead Architect • ₹42 LPA", tag: "Signed & Accepted", urgency: "Joining 1st" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Placement & Sourcing Analytics",
      category: "Intelligence",
      description: "Predictive throughput forecasting, consultant billing utilization, and client SLA compliance metrics.",
      uxHighlights: [
        "Interactive time-horizon scrubber (7d, 30d, 90d, YTD)",
        "Automated anomaly detection callouts with AI placement guidance",
        "One-click report generator exportable to PDF and Excel",
      ],
      mockData: {
        headerTitle: "Agency Productivity & Financial Analytics",
        headerSubtitle: "Sourcing efficiency, candidate conversion velocity, and consultant gross margin",
        liveBadge: "Quarterly View",
        actionLabel: "Export Report (PDF)",
        kpis: [
          { label: "Gross Margin", val: "28.4%", change: "+3.2% vs target" },
          { label: "SLA Adherence", val: "98.6%", change: "Sub-2h Client Response" },
          { label: "Cost-Per-Hire", val: "₹14,200", change: "-42% via BizzMitra AI" },
          { label: "Consultant Punch Hours", val: "1,240 hrs", change: "100% Timesheet Match" },
        ],
        visualWidgetTitle: "Recruiter Placement Breakdown",
        visualWidgetSubtitle: "Top Billing Consultants This Month",
        stages: [
          { stage: "Priya V. (Tech Lead Vertical)", count: "₹6.4L", pct: 92 },
          { stage: "Rahul S. (Frontend & Mobile)", count: "₹5.8L", pct: 83 },
          { stage: "Karan M. (Data & AI Systems)", count: "₹4.2L", pct: 60 },
          { stage: "Sneha P. (Enterprise Executive)", count: "₹2.0L", pct: 28 },
        ],
        activityTitle: "Operational AI Insights",
        activities: [
          { title: "Notice Period Risk Alert", subtitle: "2 candidates have 90-day counter-offers pending" },
          { title: "High-Margin Sourcing Channel", subtitle: "Direct AI Portal sourcing delivers 4.2x ROI over job boards" },
        ],
      },
    },
    {
      id: "settings",
      title: "Enterprise Governance & Integrations",
      category: "Administration",
      description: "Multi-tenant role permissions, Razorpay billing subscriptions, and Solution Studio schema customizer.",
      uxHighlights: [
        "Zero-trust permission toggles with cryptographic audit log confirmation",
        "Live Supabase API and Redis cache latency ping monitor",
        "Automated GST invoice generation with instant download",
      ],
      mockData: {
        headerTitle: "TalentCraft Agency Workspace Settings",
        headerSubtitle: "Role-Based Access Control, API webhooks, and billing management",
        liveBadge: "Enterprise Plan",
        actionLabel: "Manage Team Access",
        kpis: [
          { label: "Active Recruiters", val: "8 Seats", change: "2 Seats Available" },
          { label: "API Webhook Health", val: "99.98%", change: "12ms avg latency" },
          { label: "Active Clients", val: "35 Companies", change: "Dedicated Portals" },
          { label: "Monthly Plan", val: "Growth Suite", change: "Next renewal in 18d" },
        ],
        visualWidgetTitle: "Security & Subnet Governance",
        visualWidgetSubtitle: "Active RLS Isolation Policies",
        stages: [
          { stage: "Multi-Tenant Row-Level Security", count: "Enforced", pct: 100 },
          { stage: "HMAC Signed Punch Clock Webhooks", count: "Active", pct: 100 },
          { stage: "Encrypted Candidate S3 Vault", count: "AES-256", pct: 100 },
          { stage: "Razorpay Payment Gateway", count: "Live", pct: 100 },
        ],
        activityTitle: "System Audit Logs",
        activities: [
          { title: "Admin updated Candidate Schema", subtitle: "Added 'Expected Bonus' custom attribute" },
          { title: "Automated Backup Completed", subtitle: "Aurora Multi-AZ snapshot verified (0.4s)" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Executive Operations Hub", note: "Primary KPI dashboard with placement velocity funnel & live recruiter feed.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Candidate Pipeline Board", note: "Multi-tier Kanban board with AI semantic matching & SLA urgency tags.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Client Collaboration Portal", note: "Self-serve corporate client portal for 1-click candidate interview approval.", screenTarget: "pipeline" },
    { id: "WF-04", name: "Smart Punch Clock PWA", note: "Mobile clock-in app with live session timers & verified timesheet export.", screenTarget: "dashboard" },
    { id: "WF-05", name: "Placement & Sourcing Analytics", note: "Cost-per-hire telemetry, recruiter billing benchmarks, and ROI charts.", screenTarget: "insights" },
    { id: "WF-06", name: "Agency Governance & Studio", note: "Custom AST schema generator, security role manager, and Razorpay billing.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Executive Hub] --> W2[Pipeline Kanban]
    W2 --> W3[Client Portal]
    W1 --> W4[Punch Clock PWA]
    W2 --> W5[Placement Analytics]
    W1 --> W6[Agency Governance]
    W3 -. Approved .-> W2`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLEAN TECH & SOLAR ENERGY BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────
export const SOLAR_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "solar",
  domainTitle: "SolarPulse — Renewable Energy & Inverter Operations",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Solar Operations & Inverter Hub",
      category: "Primary Workspace",
      description: "Real-time telemetry command center showing solar array generation, inverter efficiency, and thermal alarms.",
      uxHighlights: [
        "Color-coded thermal runaway warning system (Green/Amber/Red)",
        "Instant inverter breaker trip button with confirmation guard",
        "Sub-second MQTT sensor ingestion without client page latency",
      ],
      mockData: {
        headerTitle: "SolarPulse Plant Generation Command",
        headerSubtitle: "Live inverter telemetry, megawatt capacity & arc-fault alerts",
        liveBadge: "● 10k Pings/sec",
        actionLabel: "+ Register Inverter",
        kpis: [
          { label: "Active Generation", val: "4.82 MW", change: "+8.4% vs forecast" },
          { label: "Inverter Fleet Uptime", val: "99.98%", change: "64 of 64 Online" },
          { label: "Arc-Fault Status", val: "Zero Alarms", change: "Nominal 48V - 600V" },
          { label: "Daily Energy Yield", val: "38.4 MWh", change: "Feed-in Target Met" },
        ],
        visualWidgetTitle: "Photovoltaic String Yield Distribution",
        visualWidgetSubtitle: "Megawatt Generation by Array Quadrant",
        stages: [
          { stage: "North Array (Commercial Bifacial)", count: "1.65 MW", pct: 100 },
          { stage: "South Array (High-Efficiency Mono)", count: "1.42 MW", pct: 86 },
          { stage: "East Array (Rooftop Trackers)", count: "1.10 MW", pct: 66 },
          { stage: "Battery Storage Bank", count: "0.65 MW", pct: 39 },
        ],
        activityTitle: "Live Inverter Telemetry Feed",
        activities: [
          { title: "Inverter INV-04 operating at optimal temp", subtitle: "Temp: 52°C • Efficiency: 98.6%" },
          { title: "Array 2 smart meter sync completed", subtitle: "TimescaleDB hypertable updated" },
          { title: "Grid handshake acknowledged (PJM)", subtitle: "Frequency: 60.02 Hz • Steady" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Arc Fault & Field Service Dispatch",
      category: "Core Flow",
      description: "Interactive incident response Kanban tracking sensor alarms, technician routing, and Bluetooth diagnostics.",
      uxHighlights: [
        "Geofenced technician dispatch based on GPS distance to solar array",
        "Offline-first mobile PWA diagnostic support for remote desert arrays",
        "Automated ISO-NE compliance sign-off upon inverter repair",
      ],
      mockData: {
        headerTitle: "Inverter Work Order & Repair Kanban",
        headerSubtitle: "Triage arc-fault alarms, dispatch field technicians, and verify grid reconnection",
        liveBadge: "Dispatch Active",
        actionLabel: "+ Manual Work Order",
        kpis: [
          { label: "Open Incidents", val: "3 Alarms", change: "2 Low, 1 Medium" },
          { label: "Field Technicians", val: "6 On-Site", change: "PWA Connected" },
          { label: "Mean Time to Repair", val: "1.8 Hours", change: "-84% via BizzMitra" },
          { label: "Spares Stock", val: "94 Diodes", change: "Depot Warehouse" },
        ],
        visualWidgetTitle: "Alarm Severity Breakdown",
        visualWidgetSubtitle: "Past 30 Days Incident Types",
        stages: [
          { stage: "Bypass Diode Thermal Degradation", count: 18, pct: 60 },
          { stage: "Panel Soiling & Dust Attenuation", count: 14, pct: 46 },
          { stage: "String Voltage Inverter Drift", count: 8, pct: 26 },
          { stage: "Grid Over-Voltage Fluctuation", count: 4, pct: 13 },
        ],
        activityTitle: "Recent Technician Actions",
        activities: [
          { title: "Vikram P. arrived at Array Quadrant 4", subtitle: "Replacing Diode SKU-SOL90" },
          { title: "Bluetooth Diagnostic Pass on INV-12", subtitle: "String voltage normal: 540V" },
        ],
        kanbanColumns: [
          {
            title: "1. Sensor Anomaly Tripped (3)",
            badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
            items: [
              { name: "INV-08 Array 2 Overheat", meta: "Temp 72°C • Threshold: 70°C", tag: "AI Thermal Alert", urgency: "Critical" },
              { name: "String 4B Micro-Arc", meta: "High-frequency ripple detected", tag: "Auto-Isolated", urgency: "Urgent" },
            ],
          },
          {
            title: "2. Dispatched to Field PWA (2)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "Technician Vikram P.", meta: "En route to Substation North", tag: "ETA: 8 Mins", urgency: "In Transit" },
            ],
          },
          {
            title: "3. On-Site Bluetooth Diagnostic (1)",
            badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
            items: [
              { name: "INV-04 Component Replacement", meta: "Diode replaced • Firmware OK", tag: "Diagnostic 99%", urgency: "Testing" },
            ],
          },
          {
            title: "4. Grid Reconnected (12)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "Array 1 Full Re-energization", meta: "Generation restored: 850 kW", tag: "ISO Sign-Off", urgency: "Nominal" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Solar Yield & Degradation Telemetry",
      category: "Intelligence",
      description: "Predictive AI irradiance forecasting, panel cleaning optimization, and financial feed-in tariff yield.",
      uxHighlights: [
        "Irradiance vs actual yield overlay with machine-learning curve fit",
        "Predictive panel soiling scheduler saving thousands in water trucks",
        "Feed-in tariff revenue projection based on dynamic grid pricing",
      ],
      mockData: {
        headerTitle: "Plant Energy Yield & Carbon Offsets",
        headerSubtitle: "Historical performance ratios, cell degradation rates, and financial ROI",
        liveBadge: "Annual Forecast",
        actionLabel: "Export Generation Log",
        kpis: [
          { label: "Performance Ratio", val: "84.2%", change: "+2.1% vs Tier 1 baseline" },
          { label: "CO2 Offset", val: "420 Metric Tons", change: "Equivalent to 1,200 trees" },
          { label: "Curtailment Loss", val: "0.8%", change: "Down from 12.4% manual" },
          { label: "Tariff Revenue", val: "₹42.8 Lakhs", change: "PJM Grid Settled" },
        ],
        visualWidgetTitle: "Quarterly Generation Comparison",
        visualWidgetSubtitle: "Actual Output vs Contracted PPA Yield",
        stages: [
          { stage: "Q1 Summer Peak Generation", count: "124 MWh", pct: 100 },
          { stage: "Q2 Monsoon Irradiance Period", count: "92 MWh", pct: 74 },
          { stage: "Q3 High-Wind Clear Sky Period", count: "115 MWh", pct: 92 },
          { stage: "Q4 Winter Shading Period", count: "88 MWh", pct: 70 },
        ],
        activityTitle: "AI Operational Recommendations",
        activities: [
          { title: "Schedule Dust Cleaning for Array 3", subtitle: "Soiling index reached 6.2% • ROI: ₹14,000 extra yield" },
          { title: "Inverter Firmware Update Verified", subtitle: "Grid frequency ride-through IEEE 1547 compliant" },
        ],
      },
    },
    {
      id: "settings",
      title: "IoT Gateway & Plant Security",
      category: "Administration",
      description: "AWS IoT Core MQTT broker configurations, mutual X.509 certificates, and supervisory control safeguards.",
      uxHighlights: [
        "Cryptographic device authorization preventing rogue telemetry injection",
        "Isolated SCADA subnet controls with hardware breaker interlocks",
        "Automated TimescaleDB retention policies compressing 100M+ pings",
      ],
      mockData: {
        headerTitle: "Solar Telemetry Gateway & Plant Architecture",
        headerSubtitle: "MQTT security, Kafka streaming configuration, and grid interconnect compliance",
        liveBadge: "TLS 1.3 Active",
        actionLabel: "Rotate X.509 Keys",
        kpis: [
          { label: "Active Gateways", val: "12 Edge Nodes", change: "Raspberry Pi Industrial" },
          { label: "Message Latency", val: "42ms", change: "AWS IoT Core East" },
          { label: "Data Retention", val: "7 Years", change: "TimescaleDB Hypertable" },
          { label: "SCADA Interlock", val: "Hardware Failsafe", change: "Zero Internet Routing" },
        ],
        visualWidgetTitle: "Security Subnet Isolation",
        visualWidgetSubtitle: "Zero-Trust SCADA Segmentation",
        stages: [
          { stage: "Mutual TLS 1.3 Inverter Certificates", count: "Valid", pct: 100 },
          { stage: "Kafka Telematics Event Buffer", count: "0.2ms Lag", pct: 100 },
          { stage: "TimescaleDB Multi-AZ Compression", count: "92% Savings", pct: 100 },
          { stage: "Grid Compliance Telemetry Stream", count: "Certified", pct: 100 },
        ],
        activityTitle: "Plant Security Logs",
        activities: [
          { title: "X.509 Certificate Rotated for INV-08", subtitle: "Hardware token matched • Success" },
          { title: "Grid Frequency Surge Isolated", subtitle: "Protected plant electronics in 1.2ms" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Plant Generation Dashboard", note: "Real-time generation telemetry, active megawatts & inverter alarms.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Field Work Order Dispatch", note: "GPS geofenced technician assignment with mobile PWA diagnostic pairing.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Inverter Diagnostic Console", note: "Live Bluetooth multimeter data stream & bypass diode testing UI.", screenTarget: "pipeline" },
    { id: "WF-04", name: "Solar Yield Analytics", note: "Irradiance forecasting, cell degradation trends, and feed-in tariff ROI.", screenTarget: "insights" },
    { id: "WF-05", name: "IoT Gateway & SCADA Security", note: "AWS IoT Core MQTT policies, mutual TLS certificates & breaker status.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Plant Dashboard] --> W2[Field Work Orders]
    W2 --> W3[Diagnostic Console]
    W1 --> W4[Yield Analytics]
    W1 --> W5[IoT Security]
    W3 -. Fixed .-> W1`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEALTHCARE & CLINICAL DIAGNOSTICS BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "healthcare",
  domainTitle: "MedPulse — Clinical Diagnostics & LIS Telemetry",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Clinical Specimen & Panic Hub",
      category: "Primary Workspace",
      description: "High-acuity medical laboratory dashboard prioritizing critical panic-value callbacks and EMR specimen intake.",
      uxHighlights: [
        "Visual panic-value banner flashing red for life-threatening test ranges",
        "One-tap physician SMS & automated voice dispatch with read-receipts",
        "HIPAA-compliant chain-of-custody tracking with 2D barcode scan verification",
      ],
      mockData: {
        headerTitle: "Clinical Pathology & LIS Central Command",
        headerSubtitle: "Real-time specimen track, emergency panic values & analyzer telemetry",
        liveBadge: "● HIPAA Secure",
        actionLabel: "+ Ingest Specimen",
        kpis: [
          { label: "Specimens Today", val: "1,248 Vials", change: "+18% vs daily avg" },
          { label: "Critical Panic Values", val: "4 Active", change: "SLA: Sub-2 Mins" },
          { label: "Emergency Lab TAT", val: "22 Minutes", change: "-82% vs paper lab" },
          { label: "Specimen Accuracy", val: "99.98%", change: "Zero barcode errors" },
        ],
        visualWidgetTitle: "Specimen Processing Pipeline",
        visualWidgetSubtitle: "Laboratory Department Throughput",
        stages: [
          { stage: "Automated Hematology Track", count: "540 Vials", pct: 100 },
          { stage: "Biochemistry & Immunochemistry", count: "410 Vials", pct: 75 },
          { stage: "Molecular & PCR Diagnostics", count: "180 Tests", pct: 33 },
          { stage: "Critical Emergency Alerts", count: "18 Cases", pct: 3 },
        ],
        activityTitle: "Live Clinical Activity Feed",
        activities: [
          { title: "Critical Alert: Hemoglobin 5.4 g/dL", subtitle: "Patient: John Doe • Dr. Sharma paged" },
          { title: "Batch 42 Centrifuge Run Completed", subtitle: "All 36 specimens cleared barcode check" },
          { title: "EMR FHIR Sync Acknowledged", subtitle: "Apollo Clinic electronic chart updated" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Chain-of-Custody Specimen Track",
      category: "Core Flow",
      description: "Multi-tier specimen chain-of-custody tracking blood vials from bedside phlebotomy through pathologist sign-off.",
      uxHighlights: [
        "Thermal barcode printer integration at patient bedside",
        "Double-verification prompt for high-risk blood type matchings",
        "Digital signature stamp adhering to CLIA and CAP laboratory guidelines",
      ],
      mockData: {
        headerTitle: "Specimen Journey & Verification Board",
        headerSubtitle: "Track laboratory specimens across centrifugation, analysis, and doctor delivery",
        liveBadge: "Track Active",
        actionLabel: "+ Scan Barcode",
        kpis: [
          { label: "In Phlebotomy", val: "38 Tubes", change: "Bedside Scanned" },
          { label: "In Centrifuge", val: "24 Tubes", change: "3,000 RPM (4m left)" },
          { label: "Analyzer Ingestion", val: "62 Vials", change: "Sysmex XN-1000" },
          { label: "Doctor Paged", val: "4 Panic", change: "ACK Pending" },
        ],
        visualWidgetTitle: "Specimen Turnaround Time by Tube Type",
        visualWidgetSubtitle: "Average Laboratory Minutes",
        stages: [
          { stage: "Lavender Top (EDTA Whole Blood)", count: "14 mins", pct: 50 },
          { stage: "Gold Top (SST Serum Gel)", count: "22 mins", pct: 80 },
          { stage: "Light Blue (Sodium Citrate Coag)", count: "18 mins", pct: 65 },
          { stage: "Green Top (Lithium Heparin)", count: "12 mins", pct: 40 },
        ],
        activityTitle: "Recent Specimen Events",
        activities: [
          { title: "Specimen SPEC-9021 Verified", subtitle: "Patient ID confirmed via Bedside Wristband" },
          { title: "Critical Platelet Count Dispatched", subtitle: "Read-receipt confirmed by Dr. K. Patel" },
        ],
        kanbanColumns: [
          {
            title: "1. Bedside Ingested (28)",
            badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
            items: [
              { name: "Specimen SPEC-9021", meta: "CBC + Platelets • Bed 402", tag: "2D Barcode OK", urgency: "Stat" },
              { name: "Specimen SPEC-9022", meta: "Electrolytes Panel • Bed 214", tag: "Fasting Verified", urgency: "Routine" },
            ],
          },
          {
            title: "2. Centrifuged & Tracked (16)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "Serum Separation Run 4", meta: "Hemolysis index: 0 (Optimal)", tag: "Centrifuged", urgency: "Testing" },
            ],
          },
          {
            title: "3. Panic Alert Dispatched (3)",
            badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
            items: [
              { name: "Potassium: 6.8 mEq/L", meta: "Attending Dr. Sharma paged", tag: "Critical High", urgency: "SLA: 60s" },
            ],
          },
          {
            title: "4. Doctor Acknowledged (142)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "Troponin I Panel Finalized", meta: "Normal < 0.04 ng/mL • Signed", tag: "EMR Published", urgency: "Archived" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Diagnostic TAT & Quality Analytics",
      category: "Intelligence",
      description: "Laboratory turnaround time telemetry, delta-check anomaly detection, and doctor feedback SLA monitoring.",
      uxHighlights: [
        "Panic-value notification callback SLA compliance monitoring (< 5 mins)",
        "Delta check historical comparison highlighting acute patient drops",
        "Analyzer machine calibrator drift tracking with preventive maintenance alerts",
      ],
      mockData: {
        headerTitle: "Clinical Quality & Regulatory SLA Telemetry",
        headerSubtitle: "CAP / NABL laboratory accreditation indicators and TAT distributions",
        liveBadge: "NABL Certified",
        actionLabel: "Audit Report (PDF)",
        kpis: [
          { label: "Stat Test Compliance", val: "99.4%", change: "Sub-30m Target" },
          { label: "Delta-Check Alerts", val: "8 Flagged", change: "Historical Variance" },
          { label: "Specimen Rejection", val: "0.02%", change: "-98% vs paper slips" },
          { label: "Physician Satisfaction", val: "96.8%", change: "Based on 140 surveys" },
        ],
        visualWidgetTitle: "Departmental Workload Density",
        visualWidgetSubtitle: "Specimen Volume per Hour",
        stages: [
          { stage: "Morning Rounds (07:00 - 10:00)", count: "480 Vials", pct: 100 },
          { stage: "Emergency Walk-ins (10:00 - 14:00)", count: "320 Vials", pct: 66 },
          { stage: "Afternoon Outpatient (14:00 - 18:00)", count: "290 Vials", pct: 60 },
          { stage: "Night Emergency Shift", count: "158 Vials", pct: 33 },
        ],
        activityTitle: "Clinical Quality Alerts",
        activities: [
          { title: "Hematology Machine Calibration Passed", subtitle: "Coefficient of variation < 1.2%" },
          { title: "Delta Check: Acute Hemoglobin Drop", subtitle: "Patient drop from 12.2 to 8.4 in 24h flagged" },
        ],
      },
    },
    {
      id: "settings",
      title: "HIPAA Zero-Trust & EMR Integrations",
      category: "Administration",
      description: "FHIR / HL7 v4 endpoints, role-based pathologist credentials, and KMS encryption key rotation policies.",
      uxHighlights: [
        "End-to-end PHI data masking for non-clinical billing staff",
        "Mutual TLS certificates for bidirectional hospital EMR bridges",
        "Automated 7-year immutable CloudWatch audit log archival",
      ],
      mockData: {
        headerTitle: "Laboratory Compliance & Security Configuration",
        headerSubtitle: "HIPAA Zero-Trust network rules, EMR HL7 bridges, and audit logging",
        liveBadge: "HIPAA Strict",
        actionLabel: "Audit Key Rotation",
        kpis: [
          { label: "EMR Gateways", val: "3 Active", change: "Epic, Cerner, FHIR" },
          { label: "Audit Log Status", val: "Immutable", change: "7-Year S3 Lock" },
          { label: "Authorized Staff", val: "42 Clinicians", change: "OAuth 2.0 PKCE" },
          { label: "PHI Encryption", val: "AES-256", change: "KMS Rotated" },
        ],
        visualWidgetTitle: "Zero-Trust Subnet Security",
        visualWidgetSubtitle: "Private VPC Isolation Mesh",
        stages: [
          { stage: "Private LIS Cluster (AWS ECS)", count: "Isolated", pct: 100 },
          { stage: "Encrypted PostgreSQL 16 Store", count: "Multi-AZ", pct: 100 },
          { stage: "HL7 v4 Bidirectional Interface", count: "Live", pct: 100 },
          { stage: "CloudWatch Tamper-Proof Audit", count: "Locked", pct: 100 },
        ],
        activityTitle: "Compliance Audit Trail",
        activities: [
          { title: "Dr. K. Patel viewed Patient Record", subtitle: "Role: Attending Physician • Valid" },
          { title: "Encrypted Backup to Cold Vault S3", subtitle: "100% data integrity verified" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Clinical Panic & Specimen Hub", note: "Laboratory command center with emergency panic banners & TAT metrics.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Specimen Journey Track", note: "Bedside 2D barcode scan verification through centrifuge & analyzer.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Panic Value Callback Screen", note: "High-priority doctor alert with required 1-tap PIN acknowledgment.", screenTarget: "pipeline" },
    { id: "WF-04", name: "Laboratory Quality Analytics", note: "Stat test compliance, delta-check variance, and NABL audit charts.", screenTarget: "insights" },
    { id: "WF-05", name: "HIPAA Security & EMR Bridge", note: "FHIR v4 gateway settings, role-based credentials & immutable audit logs.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Clinical Hub] --> W2[Specimen Track]
    W2 --> W3[Panic Dispatch]
    W1 --> W4[Quality Analytics]
    W1 --> W5[HIPAA Governance]
    W3 -. Acknowledged .-> W1`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOGISTICS, FLEET & SUPPLY CHAIN BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────
export const LOGISTICS_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "logistics",
  domainTitle: "LogiTrack — Fleet Dispatch & Telematics Operations",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Fleet Telematics & Dispatch Command",
      category: "Primary Workspace",
      description: "High-density fleet telematics command center showing live vehicle locations, route ETAs, and geofence events.",
      uxHighlights: [
        "Live interactive Mapbox vector map with sub-second truck positions",
        "Automated geofence ingress notification cards when driver approaches dock",
        "Instant route deviation and speed anomaly alerts",
      ],
      mockData: {
        headerTitle: "LogiTrack Global Fleet Dispatch",
        headerSubtitle: "Live truck telematics, multi-stop delivery velocity & fuel analytics",
        liveBadge: "● 100k GPS Pings/min",
        actionLabel: "+ Dispatch Load",
        kpis: [
          { label: "Active Vehicles", val: "148 Trucks", change: "Across 6 states" },
          { label: "On-Time Delivery SLA", val: "97.8%", change: "+14.2% vs paper" },
          { label: "Deadhead Miles", val: "3.2%", change: "-82% fuel waste" },
          { label: "Daily Completed Drops", val: "682 Deliveries", change: "100% Glass Signed" },
        ],
        visualWidgetTitle: "Fleet Movement & Corridor Status",
        visualWidgetSubtitle: "Vehicles En-Route by Interstate Corridor",
        stages: [
          { stage: "Golden Quadrilateral (NH48)", count: "58 Trucks", pct: 100 },
          { stage: "Eastern Corridor (NH19)", count: "42 Trucks", pct: 72 },
          { stage: "Southern Logistics Grid (NH44)", count: "32 Trucks", pct: 55 },
          { stage: "Local Distribution Hubs", count: "16 Trucks", pct: 28 },
        ],
        activityTitle: "Live Dispatch Telematics Feed",
        activities: [
          { title: "Truck TRK-402 geofence ingress (Dock 4)", subtitle: "ETA: 4 mins • Customer notified via SMS" },
          { title: "Driver Rajesh K. uploaded signature POD", subtitle: "12 Pallets received • Zero damage" },
          { title: "Route Solver optimized Stop 8-14", subtitle: "Saved 42 mins avoiding NH48 congestion" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Live Route & Delivery Manifest Board",
      category: "Core Flow",
      description: "End-to-end delivery workflow tracking freight from warehouse staging through transit to verified proof of delivery.",
      uxHighlights: [
        "Glass touchscreen signature capture with GPS coordinate stamping",
        "Automated cold-chain temperature anomaly notifications (< 4°C alert)",
        "Driver navigation app with offline turn-by-turn routing",
      ],
      mockData: {
        headerTitle: "Delivery Manifest & Load Progression",
        headerSubtitle: "Track freight shipments across loading docks, highway transit, and customer handoffs",
        liveBadge: "Fleet Active",
        actionLabel: "+ Import Manifest",
        kpis: [
          { label: "Staged at Depot", val: "34 Shipments", change: "Loading Dock 1-6" },
          { label: "Highway Transit", val: "88 Trucks", change: "En-Route Target" },
          { label: "Arriving in 15m", val: "14 Trucks", change: "Geofence Alerted" },
          { label: "Signed PODs", val: "546 Today", change: "Auto-Invoiced" },
        ],
        visualWidgetTitle: "Shipment Delivery Volume by Freight Type",
        visualWidgetSubtitle: "Active Cargo Weight Distribution",
        stages: [
          { stage: "FMCG & Dry Goods Cargo", count: "180 Tons", pct: 100 },
          { stage: "Refrigerated Pharma (2°C - 8°C)", count: "110 Tons", pct: 61 },
          { stage: "Heavy Industrial Machinery", count: "85 Tons", pct: 47 },
          { stage: "E-Commerce Express Parcels", count: "65 Tons", pct: 36 },
        ],
        activityTitle: "Recent Route Updates",
        activities: [
          { title: "Driver Anil S. completed Drop 6 of 8", subtitle: "Signed by Reliance Retail Manager" },
          { title: "Reefer Temp Nominal: 3.8°C", subtitle: "Pharma cargo verified • Sensor OK" },
        ],
        kanbanColumns: [
          {
            title: "1. Depot Staging (22)",
            badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
            items: [
              { name: "Manifest MAN-8821", meta: "24 Pallets • Mumbai to Pune", tag: "TSP Optimized", urgency: "Staged" },
              { name: "Manifest MAN-8822", meta: "Reefer Cargo • Cold Chain", tag: "Pre-Chilled 3.5°C", urgency: "Ready" },
            ],
          },
          {
            title: "2. Highway Transit (58)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "TRK-2104 on NH48", meta: "Speed: 58 km/h • On-Time", tag: "ETA: 14:30", urgency: "Green" },
              { name: "TRK-1092 Highway Express", meta: "Traffic delay: +15 mins", tag: "Dynamic Re-Route", urgency: "Adjusted" },
            ],
          },
          {
            title: "3. Geofence Ingress (12)",
            badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
            items: [
              { name: "Consignee Tata Consumer", meta: "Truck 500m away • Dock 2", tag: "Customer Alerted", urgency: "Arriving" },
            ],
          },
          {
            title: "4. Delivered & Signed (546)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "Walmart Fulfillment Drop", meta: "Photo + Signature Stamped", tag: "Invoice Dispatched", urgency: "Settled" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Fleet Analytics & Fuel Optimization",
      category: "Intelligence",
      description: "Travelling Salesperson solver efficiency, fuel consumption telemetry, and driver safety performance scoring.",
      uxHighlights: [
        "Idle-time telemetry tracking saving hundreds of fuel liters per vehicle",
        "Geofence dwell-time analytics identifying loading dock bottlenecks",
        "Predictive maintenance engine calculating tire wear and brake pad life",
      ],
      mockData: {
        headerTitle: "Fleet Efficiency & Operational Analytics",
        headerSubtitle: "Fuel efficiency telemetry, driver safety scoring, and customer SLA compliance",
        liveBadge: "Weekly Telemetry",
        actionLabel: "Export Fuel Log",
        kpis: [
          { label: "Fleet Fuel Savings", val: "₹8.4 Lakhs", change: "Via TSP Route AI" },
          { label: "Average Dwell Time", val: "28 Mins", change: "-44% at customer docks" },
          { label: "Driver Safety Score", val: "94.8 / 100", change: "Zero harsh brakes" },
          { label: "Billing Cycle Time", val: "Real-time", change: "Instant POD Invoices" },
        ],
        visualWidgetTitle: "Fuel Consumption by Vehicle Class",
        visualWidgetSubtitle: "Liters per 100 Kilometers",
        stages: [
          { stage: "Multi-Axle Heavy Haulers (32 Ton)", count: "32 L/100km", pct: 100 },
          { stage: "Medium Duty Freight (16 Ton)", count: "22 L/100km", pct: 68 },
          { stage: "Refrigerated Reefer Fleet", count: "26 L/100km", pct: 81 },
          { stage: "Last-Mile Delivery Vans", count: "12 L/100km", pct: 37 },
        ],
        activityTitle: "AI Route Optimization Insights",
        activities: [
          { title: "Avoided Congestion on Expressway", subtitle: "AI solver dynamically routed 14 trucks via ring road" },
          { title: "Customer Dock Delay Flagged", subtitle: "Warehouse 4 dock wait exceeded 45 mins • SLA fine waived" },
        ],
      },
    },
    {
      id: "settings",
      title: "Telematics API & Driver Governance",
      category: "Administration",
      description: "Apache Kafka telematics streams, Redis Geospatial indices, and automated driver credential verification.",
      uxHighlights: [
        "High-throughput UDP / TCP gateway buffer handling 100k GPS pings/min",
        "Automated driver license and vehicle insurance expiry alerts",
        "Multi-region cloud architecture with zero single-point-of-failure",
      ],
      mockData: {
        headerTitle: "Fleet Telematics Architecture & Edge Integration",
        headerSubtitle: "Kafka streaming brokers, Redis geospatial keys, and mobile PWA management",
        liveBadge: "Kafka Stream Live",
        actionLabel: "Manage Drivers",
        kpis: [
          { label: "GPS Pings Streamed", val: "100k / min", change: "Kafka Partitioned" },
          { label: "Active Drivers", val: "162 Verified", change: "PWA Connected" },
          { label: "Geofence Polygons", val: "420 Docks", change: "PostGIS R-Tree" },
          { label: "API SLA Uptime", val: "99.99%", change: "Fastify Gateway" },
        ],
        visualWidgetTitle: "Telemetry Ingestion Subnets",
        visualWidgetSubtitle: "High-Throughput Demuxer Architecture",
        stages: [
          { stage: "Cloudflare Ingress & DDoS Guard", count: "Nominal", pct: 100 },
          { stage: "Kafka Telematics Event Broker", count: "1.2ms Buffer", pct: 100 },
          { stage: "Redis Geo Spatial In-Memory Cache", count: "Sub-ms Query", pct: 100 },
          { stage: "PostgreSQL 16 PostGIS R-Tree Store", count: "Persisted", pct: 100 },
        ],
        activityTitle: "Fleet System Logs",
        activities: [
          { title: "Driver License Verification Passed", subtitle: "Anil S. commercial heavy license validated" },
          { title: "New Geofence Added: Reliance Hub", subtitle: "500m radius polygon activated in PostGIS" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Central Dispatch Command", note: "Live Mapbox fleet tracker with vehicle telemetry & geofence alerts.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Delivery Manifest Kanban", note: "Staging, transit, dock ingress, and signed proof-of-delivery workflow.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Driver Navigation PWA", note: "Mobile turn-by-turn route solver with glass-signature & photo capture.", screenTarget: "pipeline" },
    { id: "WF-04", name: "Fleet Fuel & Route Analytics", note: "Deadhead miles, idle telemetry, and dock dwell time benchmarks.", screenTarget: "insights" },
    { id: "WF-05", name: "Telematics API & Governance", note: "Kafka streaming partition configs, Redis Geo keys & PostGIS fences.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Dispatch Command] --> W2[Manifest Kanban]
    W2 --> W3[Driver PWA]
    W1 --> W4[Fuel Analytics]
    W1 --> W5[Telematics API]
    W3 -. POD Upload .-> W1`,
};

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT FACTORY FOR ANY PROBLEM INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function getWireframeBlueprint(context?: {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
}): WireframeBlueprint {
  const combined = `${context?.industry || ""} ${context?.problemStatement || ""} ${context?.businessName || ""}`.toLowerCase();
  const name = context?.businessName?.trim() || "Enterprise";

  // 1. Clean Tech & Solar
  if (
    combined.includes("solar") ||
    combined.includes("clean tech") ||
    combined.includes("renewable") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("photovoltaic") ||
    combined.includes("grid")
  ) {
    return {
      ...SOLAR_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Clean Tech & Solar Inverter Operations`,
    };
  }

  // 2. Healthcare & Diagnostic Lab
  if (
    combined.includes("health") ||
    combined.includes("clinic") ||
    combined.includes("hospital") ||
    combined.includes("medical") ||
    combined.includes("lab") ||
    combined.includes("doctor") ||
    combined.includes("patient") ||
    combined.includes("diagnostic") ||
    combined.includes("pathology")
  ) {
    return {
      ...HEALTHCARE_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Clinical Diagnostics & LIS Telemetry`,
    };
  }

  // 3. Logistics, Fleet & Supply Chain
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
      ...LOGISTICS_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Fleet Dispatch & Telematics Operations`,
    };
  }

  // 4. Default: HR & Recruitment Services
  return {
    ...HR_WIREFRAME_BLUEPRINT,
    domainTitle: `${name} — Recruitment & Operations Suite`,
  };
}
