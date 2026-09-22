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
// 5. QUICK-COMMERCE & DARK STORE FULFILLMENT BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────
export const QUICKCOMMERCE_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "quickcommerce",
  domainTitle: "QuickCommerce — Dark Store & Instant Fulfillment Hub",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Dark Store Fulfillment & Picker Command",
      category: "Primary Workspace",
      description: "Sub-3-minute order batching, aisle path routing telemetry, picker velocity tracking, and instant stockout reordering.",
      uxHighlights: [
        "Color-coded picking countdown timer (Green <90s, Amber <150s, Red >180s)",
        "Automated aisle-sequence pathing minimizing picker footstep distance by 42%",
        "Live PostGIS geofenced delivery rider availability beacon",
      ],
      mockData: {
        headerTitle: "Dark Store Live Operations Command",
        headerSubtitle: "Real-time picking velocity, SKU fill rate & rider handoff telemetry",
        liveBadge: "● 42 Dark Stores Active",
        actionLabel: "+ Restock Aisle",
        kpis: [
          { label: "Avg Picking Time", val: "2.1 Mins", change: "Sub-3 min SLA target" },
          { label: "Active Orders", val: "148 In-Flight", change: "99.4% on-time" },
          { label: "Floor Pickers", val: "18 Active", change: "Utilization: 94%" },
          { label: "Inventory Fill Rate", val: "99.2%", change: "Zero critical stockouts" },
        ],
        visualWidgetTitle: "Fulfillment Velocity Funnel",
        visualWidgetSubtitle: "Real-Time Order Lifecycle (Last 60 Minutes)",
        stages: [
          { stage: "Order Ingestion & Routing", count: "148 Orders", pct: 100 },
          { stage: "Aisle Picking in Progress", count: "92 Orders", pct: 62 },
          { stage: "Weight & Quality Audit", count: "36 Orders", pct: 24 },
          { stage: "Bagged & Handed to Rider", count: "20 Orders", pct: 14 },
        ],
        activityTitle: "Live Dark Store Events",
        activities: [
          { title: "Picker Manoj K. completed Order #QC-8491", subtitle: "Time: 1m 38s • 7 items • Fresh Produce" },
          { title: "Rider Rajesh M. dispatched to Sector 18", subtitle: "ETA: 6.4 mins • Cold chain verified" },
          { title: "Low Stock Alert: Aisle 4B (Amul Butter 500g)", subtitle: "Buffer: 4 units left • Auto-PO issued" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Interactive Order Picking & Dispatch Kanban",
      category: "Core Flow",
      description: "Multi-stage fulfillment board with live Bluetooth barcode scanner sync, cold chain QA flags, and rider dispatch locks.",
      uxHighlights: [
        "Live SLA clock per card with vibration feedback for orders nearing 2.5 minutes",
        "Cold-chain temperature verification toggle before dispatch release",
        "Barcode scan validation preventing mispicks with 99.98% accuracy",
      ],
      mockData: {
        headerTitle: "Order Picking & Fulfillment Pipeline Board",
        headerSubtitle: "Drag orders through picking, audit, packaging, and rider handoff stages",
        liveBadge: "Auto-Dispatch ON",
        actionLabel: "+ Priority Batch",
        kpis: [
          { label: "Queued Orders", val: "34 Waiting", change: "Auto-allocated" },
          { label: "Picking Speed", val: "14s / SKU", change: "-22% vs last month" },
          { label: "Dispatched (1h)", val: "184 Orders", change: "Fleet avg: 8.2 mins" },
          { label: "Mispick Rate", val: "0.02%", change: "Barcode enforced" },
        ],
        visualWidgetTitle: "Category Picking Distribution",
        visualWidgetSubtitle: "Items Picked by Department Today",
        stages: [
          { stage: "Dairy & Fresh Produce", count: "480 items", pct: 40 },
          { stage: "Instant Snacks & Beverages", count: "360 items", pct: 30 },
          { stage: "Personal Care & Pharmacy", count: "210 items", pct: 18 },
          { stage: "Bakery & Frozen Foods", count: "150 items", pct: 12 },
        ],
        activityTitle: "Recent Fulfillment Actions",
        activities: [
          { title: "Batch #B-104 assigned to Floor Pod 2", subtitle: "8 express grocery orders bundled" },
          { title: "Quality Audit Passed for Order #QC-8488", subtitle: "Weight variance: 0.0% • 11 items" },
        ],
        kanbanColumns: [
          {
            title: "1. Order Ingestion (14)",
            badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            items: [
              { name: "Order #QC-8501", meta: "6 SKUs • Dairy, Vegetables, Bread", tag: "Express: 10m", urgency: "New (18s ago)" },
              { name: "Order #QC-8502", meta: "3 SKUs • Cold Beverages, Ice Cream", tag: "Cold Chain", urgency: "New (42s ago)" },
            ],
          },
          {
            title: "2. Active Picking (8)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "Order #QC-8497", meta: "Picker: Suresh R. • Aisle 2 & 5", tag: "Time: 1m 12s", urgency: "On Track" },
              { name: "Order #QC-8498", meta: "Picker: Deepa M. • Aisle 1 (Produce)", tag: "Time: 1m 45s", urgency: "Urgent" },
            ],
          },
          {
            title: "3. QA & Staged (6)",
            badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
            items: [
              { name: "Order #QC-8494", meta: "Staging Bay 3 • Weight: 2.4kg verified", tag: "QA Passed", urgency: "Ready" },
              { name: "Order #QC-8495", meta: "Staging Bay 1 • Cold Tote Bag #12", tag: "Frozen QA", urgency: "Ready" },
            ],
          },
          {
            title: "4. Rider Dispatched (18)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "Order #QC-8489", meta: "Rider: Amit S. • Distance: 1.8km", tag: "ETA: 4 mins", urgency: "En-Route" },
              { name: "Order #QC-8490", meta: "Rider: Vikram T. • Distance: 2.4km", tag: "ETA: 7 mins", urgency: "En-Route" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Dark Store SKU Velocity & Stockout Telemetry",
      category: "Intelligence",
      description: "Hourly picking throughput heatmaps, rider turn-time benchmarks, shrinkage alerts, and predictive stockout forecasting.",
      uxHighlights: [
        "Time-of-day picking surge forecast (Morning rush, Dinner rush)",
        "Automated vendor reorder trigger when buffer drops below 2 hours of demand",
        "One-click audit export for store managers and supply chain directors",
      ],
      mockData: {
        headerTitle: "Dark Store Operations & Velocity Analytics",
        headerSubtitle: "Turnaround velocity, SKU shelf dwell time, and delivery partner handoff SLAs",
        liveBadge: "Real-time Telemetry",
        actionLabel: "Export Performance (CSV)",
        kpis: [
          { label: "Median Pick Time", val: "1m 48s", change: "-18s vs target SLA" },
          { label: "Delivery Run SLA", val: "8.4 Mins", change: "98.8% < 10 mins" },
          { label: "Store Shrinkage", val: "0.08%", change: "Zero barcode bypass" },
          { label: "Order Fill Rate", val: "99.8%", change: "+0.4% MoM" },
        ],
        visualWidgetTitle: "Hourly Order Velocity Heatmap",
        visualWidgetSubtitle: "Orders Processed by Store Pod",
        stages: [
          { stage: "Store #04 (Indiranagar Central)", count: "482 Orders", pct: 96 },
          { stage: "Store #12 (Koramangala South)", count: "410 Orders", pct: 82 },
          { stage: "Store #09 (HSR Layout Sector 2)", count: "360 Orders", pct: 72 },
          { stage: "Store #18 (Whitefield Tech Hub)", count: "290 Orders", pct: 58 },
        ],
        activityTitle: "Predictive AI Alerts",
        activities: [
          { title: "Surge Expected at 19:30 IST", subtitle: "Dinner rush prep: Pre-batch Aisle 1 & 3 staples" },
          { title: "Cold Chain Thermal Stability 100%", subtitle: "Chiller units holding steady at 3.2°C" },
        ],
      },
    },
    {
      id: "settings",
      title: "Store Scanner & Rider Geofence Governance",
      category: "Administration",
      description: "Bluetooth scanner pairing, digital scale tare calibration, rider dispatch radius, and ERP inventory synchronization.",
      uxHighlights: [
        "Live Bluetooth scanner battery & pairing status ping",
        "Geofenced rider auto-checkin radius configuration (50m to 200m)",
        "PostgreSQL RLS tenant isolation across dark store franchises",
      ],
      mockData: {
        headerTitle: "Dark Store Hardware & System Configuration",
        headerSubtitle: "Peripheral scanners, weighing scale tare APIs, and catalog synchronization",
        liveBadge: "Store #04 Active",
        actionLabel: "Recalibrate Scales",
        kpis: [
          { label: "Paired Scanners", val: "18 Active", change: "Zero offline devices" },
          { label: "Scale Precision", val: "±1 Gram", change: "Tare calibrated" },
          { label: "Catalog Sync", val: "Sub-50ms", change: "Kafka CDC stream live" },
          { label: "Geofence Radius", val: "120 Meters", change: "PostGIS verified" },
        ],
        visualWidgetTitle: "Hardware & Peripheral Health",
        visualWidgetSubtitle: "Store Equipment Status",
        stages: [
          { stage: "Zebra Handheld Scanners (18 units)", count: "Online", pct: 100 },
          { stage: "Mettler Toledo Digital Scales", count: "Online", pct: 100 },
          { stage: "Thermal Receipt & Bag Label Printers", count: "Paper Ready", pct: 100 },
          { stage: "Cold Storage IoT Sensors", count: "3.2°C Nominal", pct: 100 },
        ],
        activityTitle: "Peripheral Audit Trail",
        activities: [
          { title: "Scanner #07 firmware updated to v2.4.1", subtitle: "Instant scan latency reduced to 18ms" },
          { title: "Store geofence polygon refreshed", subtitle: "Updated via Mapbox dark store layer" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Picker Express Command Hub", note: "Primary pick list with aisle pathing, batch counters, and urgency countdown timers.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Fulfillment Pipeline Kanban", note: "4-stage board tracking order flow from ingestion to rider bag handoff.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Barcode Scanner & Weight Audit Modal", note: "Bluetooth scale verification dialog ensuring zero incorrect SKUs.", screenTarget: "dashboard" },
    { id: "WF-04", name: "Rider Dispatch Geofence Radar", note: "Live delivery rider availability and order handoff confirmation screen.", screenTarget: "pipeline" },
    { id: "WF-05", name: "SKU Velocity & Stockout Telemetry", note: "Real-time out-of-stock prediction and hourly pick velocity benchmarks.", screenTarget: "insights" },
    { id: "WF-06", name: "Hardware & Peripheral Governance", note: "Barcode scanners, tare calibration, and Kafka catalog sync settings.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Picker Command Hub] --> W2[Fulfillment Kanban]
    W2 --> W3[Barcode & Weight Audit]
    W3 --> W4[Rider Dispatch Radar]
    W1 --> W5[SKU Velocity Analytics]
    W1 --> W6[Hardware Governance]
    W4 -. Completed Delivery .-> W1`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. FINTECH, LENDING & NEO-BANKING BLUEPRINT
// ─────────────────────────────────────────────────────────────────────────────
export const FINTECH_WIREFRAME_BLUEPRINT: WireframeBlueprint = {
  domainId: "fintech",
  domainTitle: "FinTech — Credit Underwriting & Lending Operations",
  screenConcepts: [
    {
      id: "dashboard",
      title: "Credit Underwriting & Risk Command Hub",
      category: "Primary Workspace",
      description: "Real-time loan application intake, automated bureau scoring, Account Aggregator cashflow checks, and instant disbursal velocity.",
      uxHighlights: [
        "Risk score speedometer with instant policy rule pass/fail breakdown",
        "One-click loan approval with automated Escrow ledger debit guard",
        "Sub-15 second AI underwriting telemetry without manual verification backlog",
      ],
      mockData: {
        headerTitle: "FinTech Lending & Underwriting Command",
        headerSubtitle: "Real-time loan origination, credit risk scoring & automated disbursals",
        liveBadge: "● AA Gateway Live",
        actionLabel: "+ Quick Loan Intake",
        kpis: [
          { label: "Disbursals Today", val: "₹3.84 Cr", change: "+18% vs daily run-rate" },
          { label: "AI Underwriting Time", val: "14 Secs", change: "Sub-30s auto-decision" },
          { label: "Portfolio NPA Ratio", val: "0.82%", change: "Industry top-quartile" },
          { label: "Auto-KYC Pass Rate", val: "96.4%", change: "Aadhaar + PAN e-Sign" },
        ],
        visualWidgetTitle: "Loan Origination Funnel",
        visualWidgetSubtitle: "Daily Applicant Conversion Velocity",
        stages: [
          { stage: "Applications Received", count: "1,240 Leads", pct: 100 },
          { stage: "Bureau & AA Cashflow Verified", count: "980 Applicants", pct: 79 },
          { stage: "Underwriting Policy Approved", count: "640 Loans", pct: 52 },
          { stage: "Disbursed via e-NACH / UPI", count: "510 Loans", pct: 41 },
        ],
        activityTitle: "Live Credit Events",
        activities: [
          { title: "Loan #LN-4091 approved for ₹5.0 Lakhs", subtitle: "CIBIL: 812 • MSME Working Capital • Disbursed" },
          { title: "Account Aggregator fetched 6-mo statements", subtitle: "Anumati AA • Zero bank statement tampering" },
          { title: "e-Mandate registered successfully", subtitle: "NPCI auto-debit active for 24 monthly EMIs" },
        ],
      },
    },
    {
      id: "pipeline",
      title: "Loan Origination & Underwriting Kanban",
      category: "Core Flow",
      description: "Multi-stage credit workflow board handling KYC ingestion, automated underwriting, credit committee review, and disbursal.",
      uxHighlights: [
        "Credit risk chip (AAA, AA, BBB, High Risk) with automated debt-to-income warning",
        "Inline Aadhaar XML and PAN verification preview with instant OCR match",
        "Automated e-NACH mandate verification check before disbursal release",
      ],
      mockData: {
        headerTitle: "Credit Pipeline & Underwriting Board",
        headerSubtitle: "Drag applications across KYC, bureau scoring, risk committee, and disbursal",
        liveBadge: "Underwriting Active",
        actionLabel: "+ Filter Loans",
        kpis: [
          { label: "In Underwriting", val: "42 Applications", change: "AI Score Ready" },
          { label: "Risk Committee", val: "8 High-Ticket", change: "> ₹10 Lakhs" },
          { label: "Ready to Disburse", val: "19 Approved", change: "Escrow Funded" },
          { label: "Avg Ticket Size", val: "₹3.4 Lakhs", change: "MSME Portfolio" },
        ],
        visualWidgetTitle: "Loan Category Distribution",
        visualWidgetSubtitle: "Originations by Financial Product",
        stages: [
          { stage: "Unsecured MSME Business Loans", count: "₹2.1 Cr", pct: 55 },
          { stage: "Supply Chain & Invoice Discounting", count: "₹1.1 Cr", pct: 28 },
          { stage: "Personal & Salaried Instant Credit", count: "₹45 Lakhs", pct: 12 },
          { stage: "Equipment & Machinery Financing", count: "₹19 Lakhs", pct: 5 },
        ],
        activityTitle: "Recent Underwriting Actions",
        activities: [
          { title: "App #LN-4088 passed AI Policy Rules", subtitle: "FOIR: 42% • Net Monthly Cashflow: ₹1.4L" },
          { title: "High-ticket review cleared for ₹15 Lakhs", subtitle: "Risk Officer signed off with GST collateral" },
        ],
        kanbanColumns: [
          {
            title: "1. Intake & e-KYC (18)",
            badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            items: [
              { name: "App #LN-4095 • Rajesh Enterprises", meta: "₹4.5L • MSME • Aadhaar e-KYC verified", tag: "CIBIL: 792", urgency: "New (12m)" },
              { name: "App #LN-4096 • Sharma Diagnostics", meta: "₹8.0L • Equipment loan • GST verified", tag: "CIBIL: 810", urgency: "New (24m)" },
            ],
          },
          {
            title: "2. Bureau & AA Scoring (12)",
            badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            items: [
              { name: "App #LN-4091 • Zenith Tech Solutions", meta: "₹6.0L • Bank statement cashflow checked", tag: "Risk Score: 92", urgency: "Scored" },
              { name: "App #LN-4092 • GreenLeaf Retail", meta: "₹2.5L • 12-mo bank turnover ₹48L", tag: "Risk Score: 86", urgency: "Scored" },
            ],
          },
          {
            title: "3. Credit Committee (5)",
            badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
            items: [
              { name: "App #LN-4085 • Apex Polymers Pvt Ltd", meta: "₹15.0L • Working capital • Audit verified", tag: "High Ticket", urgency: "Sign-off" },
              { name: "App #LN-4086 • Krishna Logistics", meta: "₹12.0L • Fleet expansion loan", tag: "Senior Review", urgency: "Sign-off" },
            ],
          },
          {
            title: "4. Disbursal Ready (7)",
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            items: [
              { name: "App #LN-4081 • Mohan Electricals", meta: "₹3.5L • e-NACH active • Escrow ready", tag: "e-Signed", urgency: "Disburse" },
              { name: "App #LN-4082 • Surya Medical Stores", meta: "₹2.0L • Instant UPI payout queued", tag: "e-Signed", urgency: "Disburse" },
            ],
          },
        ],
      },
    },
    {
      id: "insights",
      title: "Portfolio Yield & Delinquency Telemetry",
      category: "Intelligence",
      description: "Collection efficiency cohort analysis, 30-day DPD default early warning indicators, and net interest margin tracking.",
      uxHighlights: [
        "30-60-90 DPD delinquency bucket tracker with automated dialer triggers",
        "Predictive cashflow recovery radar powered by historical repayment trends",
        "Automated regulatory reporting export for RBI and audit compliance",
      ],
      mockData: {
        headerTitle: "Credit Risk & Portfolio Yield Analytics",
        headerSubtitle: "Collection efficiency, early delinquency warnings, and capital utilization",
        liveBadge: "Portfolio View",
        actionLabel: "Export Portfolio (Excel)",
        kpis: [
          { label: "Net Interest Margin", val: "13.8%", change: "+1.2% annualized" },
          { label: "Collection Efficiency", val: "99.1%", change: "On-time NACH clears" },
          { label: "30-DPD Delinquency", val: "0.78%", change: "Sub-1.0% risk cap" },
          { label: "Weighted Avg APR", val: "18.4%", change: "Risk-adjusted pricing" },
        ],
        visualWidgetTitle: "Repayment Bucket Distribution",
        visualWidgetSubtitle: "Portfolio Health by Delinquency Cohort",
        stages: [
          { stage: "Standard Assets (0 DPD)", count: "₹42.8 Cr", pct: 98 },
          { stage: "Early Watchlist (1–15 DPD)", count: "₹54 Lakhs", pct: 1.2 },
          { stage: "SMA-1 (16–30 DPD)", count: "₹18 Lakhs", pct: 0.5 },
          { stage: "Overdue (31+ DPD)", count: "₹12 Lakhs", pct: 0.3 },
        ],
        activityTitle: "Risk Radar Insights",
        activities: [
          { title: "Auto-debit success rate hits 99.1%", subtitle: "NACH mandate bounce rate dropped by 44%" },
          { title: "Risk tier A default probability: 0.04%", subtitle: "Account Aggregator data correlates with 99.8% recovery" },
        ],
      },
    },
    {
      id: "settings",
      title: "RBI Compliance, AA & Gateway Governance",
      category: "Administration",
      description: "Account Aggregator keys, CIBIL/Experian API credentials, Escrow account ledger limits, and RBI digital lending compliance rules.",
      uxHighlights: [
        "Cryptographically signed loan agreement audit log with SHA-256 fingerprint",
        "Multi-bureau API failover (CIBIL primary, Experian secondary)",
        "Zero-trust RBAC isolating underwriter approvals from disbursal execution",
      ],
      mockData: {
        headerTitle: "Lending Architecture & Compliance Governance",
        headerSubtitle: "Credit bureau APIs, Account Aggregator consent gateways, and Escrow limits",
        liveBadge: "RBI Compliant",
        actionLabel: "Rotate API Keys",
        kpis: [
          { label: "Bureau Latency", val: "180ms", change: "CIBIL / Experian" },
          { label: "Escrow Balance", val: "₹14.2 Cr", change: "ICICI Escrow Active" },
          { label: "Audit Trace", val: "100%", change: "SHA-256 e-Sign logs" },
          { label: "Consent Gateway", val: "Anumati AA", change: "99.9% uptime" },
        ],
        visualWidgetTitle: "Compliance & Security Matrix",
        visualWidgetSubtitle: "Active Financial Governance Policies",
        stages: [
          { stage: "RBI Digital Lending Guidelines", count: "Enforced", pct: 100 },
          { stage: "Aadhaar e-KYC Offline XML / UIDAI", count: "Active", pct: 100 },
          { stage: "Escrow Direct-to-Customer Payouts", count: "Live", pct: 100 },
          { stage: "PostgreSQL RLS Multi-Tenant Isolation", count: "Enforced", pct: 100 },
        ],
        activityTitle: "Governance Audit Trail",
        activities: [
          { title: "Underwriter policy rule updated: FOIR ceiling 50%", subtitle: "Configured by Head of Risk" },
          { title: "CIBIL API handshake verified", subtitle: "Token refreshed automatically (OAuth2)" },
        ],
      },
    },
  ],
  inventory: [
    { id: "WF-01", name: "Credit Underwriting Command Hub", note: "Real-time loan origination dashboard with bureau scoring and instant approval controls.", screenTarget: "dashboard" },
    { id: "WF-02", name: "Loan Origination Kanban", note: "4-stage workflow pipeline tracking applicants from e-KYC to automated Escrow disbursal.", screenTarget: "pipeline" },
    { id: "WF-03", name: "Account Aggregator Cashflow Modal", note: "Interactive bank statement analyzer showing monthly revenue, recurring debts, and average balances.", screenTarget: "dashboard" },
    { id: "WF-04", name: "e-Sign & Mandate Verification Dialog", note: "Aadhaar OTP e-Sign and NPCI e-Mandate auto-debit confirmation flow.", screenTarget: "pipeline" },
    { id: "WF-05", name: "Portfolio Risk & Delinquency Telemetry", note: "Cohort analysis tracking net interest margins, 30-DPD watchlist, and recovery rates.", screenTarget: "insights" },
    { id: "WF-06", name: "Lending Governance & Compliance", note: "RBI digital lending controls, bureau failover, and Escrow balance manager.", screenTarget: "settings" },
  ],
  navFlowDiagram: `flowchart LR
    W1[Underwriting Hub] --> W2[Loan Kanban]
    W2 --> W3[AA Cashflow Modal]
    W3 --> W4[e-Sign & Mandate]
    W1 --> W5[Portfolio Telemetry]
    W1 --> W6[Compliance Governance]
    W4 -. Disbursed .-> W1`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. UNIVERSAL DYNAMIC WIREFRAME SYNTHESIZER (FOR ANY ARBITRARY PROBLEM STATEMENT)
// ─────────────────────────────────────────────────────────────────────────────
export function generateUniversalWireframeBlueprint(context?: {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
}): WireframeBlueprint {
  const rawProblem = (context?.problemStatement || "").trim();
  const rawBusiness = (context?.businessName || "").trim();
  const rawIndustry = (context?.industry || "").trim();

  // Extract a meaningful business name if generic
  let businessName = rawBusiness;
  if (!businessName || businessName === "TalentCraft HR Consultancy" || businessName === "Enterprise Workspace") {
    if (rawProblem.length > 0) {
      // Pick first 2-3 words or recognizable noun
      const firstChunk = rawProblem.split(/[.,;\n]/)[0].trim();
      businessName = firstChunk.length > 28 ? `${firstChunk.slice(0, 26).trim()}…` : firstChunk;
    } else {
      businessName = "Operational System";
    }
  }

  const industry = rawIndustry || "Digital Cloud Architecture";
  const problemSnippet = rawProblem ? rawProblem.slice(0, 90) : "Operational automation and workflow intelligence";

  const lower = `${rawProblem} ${rawIndustry} ${rawBusiness}`.toLowerCase();

  // Detect domain specifics for tailored entities
  const isEdTech = lower.includes("student") || lower.includes("learn") || lower.includes("course") || lower.includes("exam") || lower.includes("school") || lower.includes("lms");
  const isLegal = lower.includes("legal") || lower.includes("law") || lower.includes("contract") || lower.includes("clause") || lower.includes("court") || lower.includes("matter");
  const isRealEstate = lower.includes("property") || lower.includes("real estate") || lower.includes("tenant") || lower.includes("rent") || lower.includes("lease") || lower.includes("listing");
  const isFood = lower.includes("food") || lower.includes("restaurant") || lower.includes("kitchen") || lower.includes("kds") || lower.includes("dining") || lower.includes("chef");
  const isManufacturing = lower.includes("manufactur") || lower.includes("factory") || lower.includes("plant") || lower.includes("machine") || lower.includes("assembly") || lower.includes("oee");
  const isSecurity = lower.includes("security") || lower.includes("threat") || lower.includes("vulnerability") || lower.includes("soc") || lower.includes("incident") || lower.includes("cve");
  const isAI = lower.includes("agent") || lower.includes("prompt") || lower.includes("llm") || lower.includes("model") || lower.includes("pipeline") || lower.includes("rag");

  // Domain-specific customization variables
  let domainTag = "Universal Enterprise Operations";
  let entityName = "Operational Record";
  let entityPlural = "Records";
  let unitMetric = "Items Processed";
  let kpi1 = { label: "Operational Throughput", val: "1,420 Items", change: "+24% automation gain" };
  let kpi2 = { label: "Turnaround SLA", val: "1.4 Mins", change: "Sub-3m target achieved" };
  let kpi3 = { label: "Process Efficiency", val: "99.4%", change: "Zero manual data loss" };
  let kpi4 = { label: "Active Nodes", val: "24 Workers", change: "100% capacity" };

  let stage1Name = "1. Intake & Ingestion";
  let stage2Name = "2. Processing & Analysis";
  let stage3Name = "3. Review & Verification";
  let stage4Name = "4. Completed & Executed";

  let kanbanCols = [
    {
      title: "1. Intake Queue (16)",
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      items: [
        { name: "Unit #OP-1021", meta: "High priority • Auto-parsed payload", tag: "Urgent", urgency: "New (2m ago)" },
        { name: "Unit #OP-1022", meta: "Standard batch • Ingested via API", tag: "Verified", urgency: "New (8m ago)" },
      ],
    },
    {
      title: "2. Active Execution (11)",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      items: [
        { name: "Unit #OP-1018", meta: "Node 4 processing • Rule-engine checks", tag: "Running", urgency: "Active" },
        { name: "Unit #OP-1019", meta: "Telemetry stream active • Zero lag", tag: "Running", urgency: "Active" },
      ],
    },
    {
      title: "3. Verification & QA (8)",
      badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      items: [
        { name: "Unit #OP-1014", meta: "Compliance threshold 100% verified", tag: "Passed", urgency: "Ready" },
        { name: "Unit #OP-1015", meta: "Operator approval signed • Ready for sync", tag: "Passed", urgency: "Ready" },
      ],
    },
    {
      title: "4. Dispatched / Done (28)",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      items: [
        { name: "Unit #OP-1008", meta: "Dispatched to downstream target", tag: "Complete", urgency: "Archived" },
        { name: "Unit #OP-1009", meta: "Audit trail persisted to PostgreSQL", tag: "Complete", urgency: "Archived" },
      ],
    },
  ];

  let funnelStages = [
    { stage: "Ingested via Stream / API", count: "1,420 Items", pct: 100 },
    { stage: "Rule-Engine Processing", count: "1,180 Items", pct: 83 },
    { stage: "Validation & Quality Checked", count: "940 Items", pct: 66 },
    { stage: "Final Execution & Delivery", count: "890 Items", pct: 62 },
  ];

  let activities = [
    { title: `Automated intake parsed 42 new ${entityPlural.toLowerCase()}`, subtitle: "Sub-50ms ingestion latency via cloud edge" },
    { title: "Anomaly detection check completed", subtitle: "Zero critical exceptions detected in last hour" },
    { title: "PostgreSQL RLS security snapshot synced", subtitle: "Multi-tenant partition audit logged" },
  ];

  // Specific domain overrides
  if (isEdTech) {
    domainTag = "EdTech & Learning Architecture";
    entityName = "Student Submission";
    entityPlural = "Submissions";
    unitMetric = "Assessments Graded";
    kpi1 = { label: "Active Learners", val: "3,840 Students", change: "+14% MoM" };
    kpi2 = { label: "Grading Turnaround", val: "45 Secs", change: "Automated AI evaluator" };
    kpi3 = { label: "Course Completion", val: "88.6%", change: "+21% vs benchmark" };
    kpi4 = { label: "Curriculum Modules", val: "48 Courses", change: "100% published" };
    stage1Name = "1. Submitted by Student";
    stage2Name = "2. AI Assessment & Scoring";
    stage3Name = "3. Educator Review";
    stage4Name = "4. Certified & Grade Issued";
    kanbanCols = [
      {
        title: "1. New Submissions (24)",
        badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        items: [
          { name: "Sub #ED-301 • Rohan Mehta", meta: "Python Advanced • Module 4 Project", tag: "Code Check", urgency: "New" },
          { name: "Sub #ED-302 • Sneha Roy", meta: "Data Structures • Algorithmic Complexity", tag: "Quiz Passed", urgency: "New" },
        ],
      },
      {
        title: "2. AI Scoring (14)",
        badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        items: [
          { name: "Sub #ED-298 • Amit Shah", meta: "Score: 94/100 • Plagiarism: 0%", tag: "Score Ready", urgency: "Active" },
          { name: "Sub #ED-299 • Pooja Nair", meta: "Score: 88/100 • Feedback generated", tag: "Score Ready", urgency: "Active" },
        ],
      },
      {
        title: "3. Educator Review (6)",
        badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        items: [
          { name: "Sub #ED-294 • Vivek Sharma", meta: "Capstone Thesis • Mentor sign-off required", tag: "High Distinction", urgency: "Sign-off" },
        ],
      },
      {
        title: "4. Grade Issued (62)",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        items: [
          { name: "Sub #ED-288 • Aditi Sen", meta: "Grade: A+ • Blockchain certificate minted", tag: "Certified", urgency: "Done" },
        ],
      },
    ];
    funnelStages = [
      { stage: "Course Enrollment & Starts", count: "3,840 Students", pct: 100 },
      { stage: "Assignments Completed", count: "2,980 Submissions", pct: 77 },
      { stage: "Passed Evaluation Criteria", count: "2,640 Students", pct: 68 },
      { stage: "Certificates Dispatched", count: "2,420 Certified", pct: 63 },
    ];
    activities = [
      { title: "Batch 4 Capstone projects evaluated", subtitle: "Median score: 91.4% • 0 rubric deviations" },
      { title: "LMS Webhook synced with Canvas & Moodle", subtitle: "2,400 grades exported seamlessly" },
    ];
  } else if (isLegal) {
    domainTag = "Legal Operations & Contract Intelligence";
    entityName = "Matter / Contract";
    entityPlural = "Contracts";
    unitMetric = "Clauses Analyzed";
    kpi1 = { label: "Active Matters", val: "340 Contracts", change: "Sub-24h turnaround" };
    kpi2 = { label: "Redline Speed", val: "8.2 Mins", change: "78% faster vs manual" };
    kpi3 = { label: "Clause Compliance", val: "99.8%", change: "Zero high-risk deviations" };
    kpi4 = { label: "Sign-Off Value", val: "₹18.2 Cr", change: "Across 42 corporate clients" };
    stage1Name = "1. Contract Intake";
    stage2Name = "2. AI Clause Risk Scoring";
    stage3Name = "3. Counsel Redline Negotiation";
    stage4Name = "4. Executed & DocuSigned";
    kanbanCols = [
      {
        title: "1. Intake & OCR (12)",
        badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        items: [
          { name: "MSA #LGL-401 • FinCorp India", meta: "Master Services Agreement • 32 pages", tag: "High Value", urgency: "New (1h)" },
          { name: "NDA #LGL-402 • Apex Cloud Ltd", meta: "Mutual Non-Disclosure Agreement", tag: "Standard", urgency: "New (2h)" },
        ],
      },
      {
        title: "2. Clause Scoring (8)",
        badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        items: [
          { name: "Vendor Agr #LGL-398", meta: "Indemnity clause flagged (Unlimited liability)", tag: "Risk: High", urgency: "Review" },
          { name: "Lease Agr #LGL-399", meta: "Lock-in period 36 months verified", tag: "Risk: Low", urgency: "Standard" },
        ],
      },
      {
        title: "3. Counsel Review (5)",
        badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        items: [
          { name: "SaaS Terms #LGL-392", meta: "Partner counsel accepted counter-clauses", tag: "Negotiated", urgency: "Sign-off" },
        ],
      },
      {
        title: "4. Executed (42)",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        items: [
          { name: "License Agr #LGL-388", meta: "DocuSign completed by both signatories", tag: "Executed", urgency: "Vaulted" },
        ],
      },
    ];
    funnelStages = [
      { stage: "Contract Ingestion & OCR", count: "340 Contracts", pct: 100 },
      { stage: "Automated Clause Extraction", count: "310 Contracts", pct: 91 },
      { stage: "Legal Counsel Approval", count: "260 Contracts", pct: 76 },
      { stage: "Executed & Stored in Vault", count: "240 Contracts", pct: 70 },
    ];
  } else if (isFood) {
    domainTag = "Cloud Kitchen & Order Orchestration";
    entityName = "Kitchen Order";
    entityPlural = "Orders";
    unitMetric = "Dishes Prepared";
    kpi1 = { label: "Active Orders", val: "84 In-Kitchen", change: "Sub-12m prep target" };
    kpi2 = { label: "Avg Prep Time", val: "8.4 Mins", change: "-2.6m vs last week" };
    kpi3 = { label: "KDS Accuracy", val: "99.7%", change: "Zero incorrect orders" };
    kpi4 = { label: "Active Stations", val: "6 Kitchen Pods", change: "100% capacity" };
    stage1Name = "1. Ingested from Swiggy/Zomato";
    stage2Name = "2. Cooking & Assembly";
    stage3Name = "3. Quality & Temperature Check";
    stage4Name = "4. Dispatched to Delivery Partner";
  } else if (isManufacturing) {
    domainTag = "Smart Factory & Industrial Telemetry";
    entityName = "Assembly Batch";
    entityPlural = "Batches";
    unitMetric = "Units Manufactured";
    kpi1 = { label: "Overall Plant OEE", val: "89.4%", change: "+4.2% vs target" };
    kpi2 = { label: "Cycle Turnaround", val: "42 Secs", change: "Optimal assembly speed" };
    kpi3 = { label: "Defect Ratio", val: "0.04%", change: "Computer vision verified" };
    kpi4 = { label: "Connected Machines", val: "32 CNC / PLC", change: "Zero downtime" };
    stage1Name = "1. Raw Material Ingestion";
    stage2Name = "2. Assembly & Fabrication";
    stage3Name = "3. Quality & Tolerance Inspection";
    stage4Name = "4. Finished & Packaged";
  } else if (isSecurity) {
    domainTag = "CyberSecurity Operations (SOC)";
    entityName = "Security Alert";
    entityPlural = "Alerts";
    unitMetric = "Events Screened";
    kpi1 = { label: "Screened Events", val: "4.8M / Day", change: "Zero false negatives" };
    kpi2 = { label: "Mean Time to Detect", val: "18 Secs", change: "Automated SIEM triage" };
    kpi3 = { label: "Incident Containment", val: "99.9%", change: "Zero data exfiltration" };
    kpi4 = { label: "Protected Endpoints", val: "1,840 Nodes", change: "Zero-trust enforced" };
    stage1Name = "1. SIEM Event Ingestion";
    stage2Name = "2. Automated Threat Triage";
    stage3Name = "3. Incident Investigation";
    stage4Name = "4. Remediated & Policy Locked";
  } else if (isAI) {
    domainTag = "AI Agent Platform & Orchestration";
    entityName = "Agent Execution";
    entityPlural = "Executions";
    unitMetric = "Tokens Processed";
    kpi1 = { label: "Agent Inferences", val: "148k / Day", change: "+38% throughput" };
    kpi2 = { label: "Median Latency", val: "140ms", change: "Groq / Streaming LLM" };
    kpi3 = { label: "Task Success Rate", val: "97.4%", change: "Self-correcting loops" };
    kpi4 = { label: "Active Pipelines", val: "16 Orchestrators", change: "Zero queue backlog" };
    stage1Name = "1. Prompt & Task Ingestion";
    stage2Name = "2. Multi-Agent Reasoning & Tool Call";
    stage3Name = "3. Guardrail & Hallucination Check";
    stage4Name = "4. Final Output & Artifact Persisted";
  }

  return {
    domainId: `custom-${businessName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}`,
    domainTitle: `${businessName} — ${domainTag}`,
    screenConcepts: [
      {
        id: "dashboard",
        title: `${businessName} Central Operations Command`,
        category: "Primary Workspace",
        description: `High-density real-time command center tailored to ${industry}. Eliminates manual delays by tracking ${entityPlural.toLowerCase()}, operational velocity, and immediate action items.`,
        uxHighlights: [
          `F-pattern visual hierarchy prioritizing SLA-urgency ${entityName.toLowerCase()} alerts`,
          "One-click action triggers reducing manual operator clicks by over 60%",
          "Sub-second reactive telemetry without full page refreshes",
        ],
        mockData: {
          headerTitle: `${businessName} Executive Command Hub`,
          headerSubtitle: `Live ${entityPlural.toLowerCase()} telemetry, processing velocity & operational health for ${industry}`,
          liveBadge: "● Live Streaming",
          actionLabel: `+ New ${entityName}`,
          kpis: [kpi1, kpi2, kpi3, kpi4],
          visualWidgetTitle: "Operational Processing Funnel",
          visualWidgetSubtitle: `End-to-End ${entityName} Lifecycle Throughput`,
          stages: funnelStages,
          activityTitle: "Live Operations Feed",
          activities: activities,
        },
      },
      {
        id: "pipeline",
        title: `Interactive ${entityName} Execution Pipeline`,
        category: "Core Flow",
        description: `Multi-stage Kanban workflow engineered specifically for ${businessName}. Automates state transitions, eliminates handoff lag, and enforces strict validation at each stage.`,
        uxHighlights: [
          "Color-coded urgency indicators for fast triage and SLA preservation",
          `Inline quick-action modal for 1-click status transitions of ${entityPlural.toLowerCase()}`,
          "Instant keyboard navigation and live search filtering across all stages",
        ],
        mockData: {
          headerTitle: `${entityName} Workflow Pipeline Board`,
          headerSubtitle: `Drag and track ${entityPlural.toLowerCase()} across automated processing stages with real-time validation`,
          liveBadge: "Workflow Active",
          actionLabel: "+ Filter Items",
          kpis: [
            { label: "Queued Items", val: "38 Waiting", change: "Auto-allocated" },
            { label: "Processing Speed", val: "Sub-2 Mins", change: "99.2% on-time" },
            { label: "Passed Review", val: "140 Today", change: "Zero defect rate" },
            { label: "Active Operators", val: "12 Seats", change: "100% capacity" },
          ],
          visualWidgetTitle: `${entityName} Stage Distribution`,
          visualWidgetSubtitle: "Items by Operational Stage",
          stages: [
            { stage: stage1Name, count: "48 Items", pct: 40 },
            { stage: stage2Name, count: "36 Items", pct: 30 },
            { stage: stage3Name, count: "22 Items", pct: 18 },
            { stage: stage4Name, count: "14 Items", pct: 12 },
          ],
          activityTitle: "Recent Pipeline Movements",
          activities: [
            { title: `${entityName} #1024 moved to ${stage3Name}`, subtitle: "Validation passed with 100% compliance" },
            { title: `Batch execution completed for 8 ${entityPlural.toLowerCase()}`, subtitle: "Dispatched without manual intervention" },
          ],
          kanbanColumns: kanbanCols,
        },
      },
      {
        id: "insights",
        title: `${businessName} Velocity & Quality Telemetry`,
        category: "Intelligence",
        description: `Predictive throughput analytics, SLA adherence telemetry, and automated bottleneck detection tailored to ${industry}.`,
        uxHighlights: [
          "Interactive time-horizon scrubber (7d, 30d, 90d, YTD)",
          "Automated anomaly detection callouts with AI operational guidance",
          "One-click report generator exportable to PDF, Excel, and Word",
        ],
        mockData: {
          headerTitle: `${businessName} Performance & Telemetry Radar`,
          headerSubtitle: `Throughput velocity, SLA compliance metrics, and automated bottleneck detection for ${industry}`,
          liveBadge: "Telemetry Live",
          actionLabel: "Export Report (PDF)",
          kpis: [
            { label: "SLA Adherence", val: "99.4%", change: "+4.2% vs target" },
            { label: "Mean Processing Time", val: "1.8 Mins", change: "-62% faster via AI" },
            { label: "Cost-Per-Unit", val: "₹12.40", change: "-48% operational savings" },
            { label: "Error Elimination", val: "99.98%", change: "Zero manual data loss" },
          ],
          visualWidgetTitle: "Operational Volume Breakdown",
          visualWidgetSubtitle: "Weekly Throughput by Category",
          stages: [
            { stage: "Automated Ingestion Flow", count: "1,240 Units", pct: 92 },
            { stage: "Validation & Rule Processing", count: "1,080 Units", pct: 80 },
            { stage: "Review & Quality Verification", count: "890 Units", pct: 66 },
            { stage: "Direct Execution & Delivery", count: "780 Units", pct: 58 },
          ],
          activityTitle: "Operational AI Insights",
          activities: [
            { title: "Throughput Optimization Confirmed", subtitle: `System processes ${entityPlural.toLowerCase()} 3.8x faster than manual spreadsheets` },
            { title: "Bottleneck Mitigated in Stage 2", subtitle: "Automated rule validation eliminated 4.5 hours of operator wait time" },
          ],
        },
      },
      {
        id: "settings",
        title: "Enterprise Governance, API & Integration Hub",
        category: "Administration",
        description: `Multi-tenant security policies, PostgreSQL schema configuration, external API webhooks, and Solution Studio parameters for ${businessName}.`,
        uxHighlights: [
          "PostgreSQL Row-Level Security (RLS) tenant isolation policies",
          "Live Supabase API and Redis cache latency ping monitor",
          "Automated audit logging with cryptographic verification",
        ],
        mockData: {
          headerTitle: `${businessName} Governance & Security Hub`,
          headerSubtitle: `Role-Based Access Control, API webhooks, and database isolation policies for ${industry}`,
          liveBadge: "Enterprise Plan",
          actionLabel: "Manage Permissions",
          kpis: [
            { label: "Active Roles", val: "6 RBAC Tiers", change: "Admin, Operator, Auditor" },
            { label: "API Webhook Health", val: "99.99%", change: "14ms avg response" },
            { label: "Database Isolation", val: "PostgreSQL RLS", change: "Multi-tenant secured" },
            { label: "Audit Trace", val: "100%", change: "Immutable log trail" },
          ],
          visualWidgetTitle: "Security & Subnet Governance",
          visualWidgetSubtitle: "Active Enterprise Policies",
          stages: [
            { stage: "Multi-Tenant Row-Level Security (RLS)", count: "Enforced", pct: 100 },
            { stage: "HMAC Signed Webhook Endpoints", count: "Active", pct: 100 },
            { stage: "AES-256 Cloud Data Encryption", count: "Enforced", pct: 100 },
            { stage: "Automated Daily Disaster Recovery", count: "Verified", pct: 100 },
          ],
          activityTitle: "System Audit Logs",
          activities: [
            { title: `Admin calibrated ${entityName} Schema`, subtitle: "Added custom validation rule and status enum" },
            { title: "Database backup verified successfully", subtitle: "Aurora Multi-AZ snapshot completed (0.3s)" },
          ],
        },
      },
    ],
    inventory: [
      { id: "WF-01", name: `${businessName} Operations Command Hub`, note: `Primary KPI telemetry dashboard with processing funnel and live ${entityPlural.toLowerCase()} feed.`, screenTarget: "dashboard" },
      { id: "WF-02", name: `${entityName} Execution Pipeline Board`, note: "Multi-tier Kanban workflow with automated validation checks and SLA status tags.", screenTarget: "pipeline" },
      { id: "WF-03", name: `${entityName} Detail & Audit Modal`, note: `Deep-dive modal displaying full payload attributes, audit trails, and 1-click status transitions.`, screenTarget: "pipeline" },
      { id: "WF-04", name: "Quick Intake & Processing Form", note: `Fast entry interface with real-time validation and automated duplicate checking.`, screenTarget: "dashboard" },
      { id: "WF-05", name: `${businessName} Velocity & SLA Analytics`, note: "Turnaround telemetry, resource utilization benchmarks, and operational ROI charts.", screenTarget: "insights" },
      { id: "WF-06", name: "Enterprise Governance & Security Hub", note: "Role-Based Access Control, API webhooks, and PostgreSQL RLS security management.", screenTarget: "settings" },
    ],
    navFlowDiagram: `flowchart LR
    W1[Operations Command Hub] --> W2[Execution Pipeline Board]
    W2 --> W3[Entity Detail Modal]
    W1 --> W4[Quick Intake Form]
    W2 --> W5[Velocity & SLA Analytics]
    W1 --> W6[Enterprise Governance Hub]
    W3 -. Approved .-> W2`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT FACTORY FOR ANY PROBLEM INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function getWireframeBlueprint(context?: {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
}): WireframeBlueprint {
  const problem = (context?.problemStatement || "").toLowerCase();
  const industry = (context?.industry || "").toLowerCase();
  const business = (context?.businessName || "").toLowerCase();
  const combined = `${industry} ${problem} ${business}`.trim();
  const name = context?.businessName?.trim() || "Enterprise Workspace";

  // 1. Quick-Commerce, Dark Stores & Rapid Grocery Delivery
  if (
    combined.includes("quick commerce") ||
    combined.includes("dark store") ||
    combined.includes("picker") ||
    combined.includes("zepto") ||
    combined.includes("blinkit") ||
    combined.includes("instamart") ||
    combined.includes("10-minute") ||
    combined.includes("10 minute") ||
    combined.includes("grocery delivery") ||
    combined.includes("order pick") ||
    combined.includes("sku dispatch") ||
    combined.includes("aisle") ||
    combined.includes("micro-fulfillment")
  ) {
    return {
      ...QUICKCOMMERCE_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Quick-Commerce & Dark Store Operations`,
    };
  }

  // 2. FinTech, Lending, Neo-Banking & Payments
  if (
    combined.includes("fintech") ||
    combined.includes("lending") ||
    combined.includes("loan") ||
    combined.includes("credit") ||
    combined.includes("underwriting") ||
    combined.includes("kyc") ||
    combined.includes("disbursal") ||
    combined.includes("nbfc") ||
    combined.includes("banking") ||
    combined.includes("account aggregator") ||
    combined.includes("cibil") ||
    combined.includes("micro-loan") ||
    combined.includes("micro-lending")
  ) {
    return {
      ...FINTECH_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — FinTech Underwriting & Credit Operations`,
    };
  }

  // 3. Clean Tech & Solar
  if (
    combined.includes("solar") ||
    combined.includes("clean tech") ||
    combined.includes("renewable") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("photovoltaic") ||
    combined.includes("grid") ||
    combined.includes("megawatt")
  ) {
    return {
      ...SOLAR_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Clean Tech & Solar Inverter Operations`,
    };
  }

  // 4. Healthcare & Diagnostic Lab
  if (
    combined.includes("health") ||
    combined.includes("clinic") ||
    combined.includes("hospital") ||
    combined.includes("medical") ||
    combined.includes("lab") ||
    combined.includes("doctor") ||
    combined.includes("patient") ||
    combined.includes("diagnostic") ||
    combined.includes("pathology") ||
    combined.includes("lis")
  ) {
    return {
      ...HEALTHCARE_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Clinical Diagnostics & LIS Telemetry`,
    };
  }

  // 5. Logistics, Fleet & Supply Chain
  if (
    combined.includes("logistics") ||
    combined.includes("fleet") ||
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

  // 6. HR, Recruitment & Staffing (ONLY when explicitly HR or TalentCraft)
  if (
    combined.includes("talentcraft") ||
    combined.includes("recruitment") ||
    combined.includes("staffing agency") ||
    combined.includes("recruiter") ||
    combined.includes("headhunting") ||
    (combined.includes("candidate") && combined.includes("hire"))
  ) {
    return {
      ...HR_WIREFRAME_BLUEPRINT,
      domainTitle: `${name} — Recruitment & Operations Suite`,
    };
  }

  // 7. UNIVERSAL PROBLEM INTAKE: Synthesize dynamically for whatever problem statement was given!
  return generateUniversalWireframeBlueprint(context);
}

