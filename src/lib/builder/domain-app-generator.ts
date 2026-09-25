/**
 * BizzMitra AI — Dynamic Domain Software Architecture Engine
 * Transforms any workspace problem statement, industry, and AI discovery blueprint
 * into a fully tailored, domain-specific production web application model.
 */

export interface DomainKpi {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface DomainFunnelStage {
  stage: string;
  count: number | string;
  pct: number;
}

export interface DomainActivity {
  title: string;
  subtitle: string;
  timeAgo: string;
}

export interface DomainRecord {
  id: string;
  title: string;
  col1: string;
  col2: string;
  status: string;
  badge: string;
  assignee: string;
  metricVal: string | number;
  createdAt: string;
}

export interface DomainDemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  badge: string;
  avatar: string;
  department: string;
  permissions: string[];
}

export interface DomainArchitectureItem {
  id: string;
  name: string;
  type: "Database Table" | "Edge Function" | "Realtime Stream" | "API Gateway";
  description: string;
  tech: string;
  status: "Active" | "Synced" | "Healthy";
  schema?: string;
}

export interface DomainRoadmapSprint {
  id: string;
  phase: string;
  title: string;
  duration: string;
  status: "Completed" | "In Progress" | "Upcoming";
  progress: number;
  tasks: { id: string; title: string; done: boolean; assignee: string }[];
}

export interface DomainAppModel {
  domainKey: string;
  domainName: string;
  appTitle: string;
  entityName: string;
  entityPlural: string;
  tagline: string;
  problemStatement: string;
  kpis: DomainKpi[];
  funnelStages: DomainFunnelStage[];
  activities: DomainActivity[];
  columns: {
    idLabel: string;
    col1Label: string;
    col2Label: string;
    statusLabel: string;
    assigneeLabel: string;
    metricLabel: string;
  };
  statuses: string[];
  initialRecords: DomainRecord[];
  modules: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  demoUsers: DomainDemoUser[];
  architecture: DomainArchitectureItem[];
  roadmap: DomainRoadmapSprint[];
}

export interface WorkspaceContextInput {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
  description?: string;
  solutionTitle?: string;
  goals?: string;
  constraints?: string;
  [key: string]: any;
}

/**
 * Resolves a complete, authentic domain model based on the user's workspace context and problem statement.
 */
function resolveRawDomainAppModel(context: WorkspaceContextInput = {}): any {
  const problem = (context.problemStatement || context.description || "").trim();
  const businessName = (context.businessName || context.name || "Enterprise Workspace").trim();
  const industry = (context.industry || "Enterprise Software").trim();
  const solutionTitle = context.solutionTitle || context.name;

  const combined = `${industry} ${problem} ${businessName}`.toLowerCase();

  // 1. QUICK-COMMERCE / DARK STORE / 10-MINUTE GROCERY
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
    combined.includes("mispick") ||
    combined.includes("sku dispatch") ||
    combined.includes("aisle")
  ) {
    return {
      domainKey: "quickcommerce",
      domainName: "Quick-Commerce & Dark Store Operations",
      appTitle: solutionTitle || `${businessName} — 10-Min Dark Store Fulfillment Engine`,
      entityName: "Pick Order",
      entityPlural: "Orders",
      tagline: "Sub-3 minute order picking, bay barcode scanning, and instant rider handoff.",
      problemStatement: problem || "Dark store pickers face intense pressure to pick orders within 3 minutes, causing high mispick rates and inventory discrepancies.",
      kpis: [
        { label: "3-Min Pick SLA Adherence", value: "98.6%", change: "+5.4% vs target", trend: "up" },
        { label: "Avg Pick-to-Bag Time", value: "2.4 Mins", change: "-42s faster", trend: "up" },
        { label: "Mispick Error Rate", value: "0.02%", change: "Barcode verified", trend: "up" },
        { label: "Active Dark Store Bays", value: "14 Stations", change: "100% operational", trend: "neutral" },
      ],
      funnelStages: [
        { stage: "Order Ingested & Route-Batched", count: 840, pct: 100 },
        { stage: "Picker Assigned & Bay Scan", count: 680, pct: 81 },
        { stage: "Picked & QC Barcode Verified", count: 590, pct: 70 },
        { stage: "Bags Sealed & Rider Dispatched", count: 540, pct: 64 },
      ],
      activities: [
        { title: "Vikram P. completed Order #QC-8921", subtitle: "Aisle 3 · 3 SKUs in 1.8 mins (Record SLA)", timeAgo: "2 mins ago" },
        { title: "Bay 4 QC verified Order #QC-8922", subtitle: "Zero mispick · Ready for Delivery Bagging", timeAgo: "5 mins ago" },
        { title: "Delivery Rider Rahul assigned", subtitle: "OTP verified at Dispatch Bay #2", timeAgo: "8 mins ago" },
      ],
      columns: {
        idLabel: "Order Barcode",
        col1Label: "Shelf / Aisle Bay",
        col2Label: "SKU & Item Details",
        statusLabel: "Fulfillment Stage",
        assigneeLabel: "Assigned Picker",
        metricLabel: "Pick SLA Timer",
      },
      statuses: ["Queued", "Picking", "QC Staged", "Dispatched"],
      initialRecords: [
        {
          id: "QC-8921",
          title: "Organic Milk, Whole Wheat Bread, Bananas (1 Dozen)",
          col1: "Aisle 3 · Shelf B2",
          col2: "3 SKUs · Chilled Pack",
          status: "Picking",
          badge: "Urgent 2m SLA",
          assignee: "Vikram Patel",
          metricVal: "1.8m",
          createdAt: "Today, 18:02",
        },
        {
          id: "QC-8922",
          title: "Cold Brew Coffee x2, Protein Energy Bars x4",
          col1: "Aisle 1 · Shelf A4",
          col2: "2 SKUs · Dry Goods",
          status: "QC Staged",
          badge: "Ready for Bagging",
          assignee: "Sunita Rao",
          metricVal: "2.1m",
          createdAt: "Today, 17:58",
        },
        {
          id: "QC-8923",
          title: "Fresh Hass Avocados (2pc), Greek Yogurt (400g)",
          col1: "Aisle 4 · Shelf C1",
          col2: "2 SKUs · Fresh Produce",
          status: "Dispatched",
          badge: "Rider En Route",
          assignee: "Arun Verma",
          metricVal: "2.9m",
          createdAt: "Today, 17:52",
        },
        {
          id: "QC-8924",
          title: "Baby Diapers (L), Soft Wet Wipes Twin Pack",
          col1: "Aisle 2 · Shelf D3",
          col2: "2 SKUs · Essentials",
          status: "Queued",
          badge: "Auto-Allocated",
          assignee: "Karan Joshi",
          metricVal: "0.5m",
          createdAt: "Today, 18:04",
        },
      ],
      modules: [
        { id: "overview", title: "Store Command Hub", description: "Real-time pick velocity, bay utilization, and SLA compliance", icon: "Building2" },
        { id: "portal", title: "Live Order Picking Queue", description: "Aisle scan matrix, picker routing, and packaging checks", icon: "Layout" },
        { id: "analytics", title: "Dark Store Telemetry", description: "Sub-3m pick rate adherence, error rate diagnostics", icon: "BarChart3" },
      ],
    };
  }

  // 2. FINTECH / DIGITAL LENDING / CREDIT UNDERWRITING / MICRO-LOANS
  if (
    combined.includes("fintech") ||
    combined.includes("lending") ||
    combined.includes("loan") ||
    combined.includes("credit") ||
    combined.includes("underwriting") ||
    combined.includes("kyc") ||
    combined.includes("disbursal") ||
    combined.includes("nbfc") ||
    combined.includes("bureau") ||
    combined.includes("cibil")
  ) {
    return {
      domainKey: "fintech",
      domainName: "FinTech & Automated Credit Underwriting",
      appTitle: solutionTitle || `${businessName} — Credit Underwriting & Disbursal Engine`,
      entityName: "Loan Application",
      entityPlural: "Applications",
      tagline: "Automated KYC verification, CIBIL bureau scoring, and sub-60 second loan underwriting.",
      problemStatement: problem || "Manual credit verification creates 48-hour disbursal backlogs and high applicant drop-off in small business lending.",
      kpis: [
        { label: "Underwriting TAT Velocity", value: "42 Secs", change: "-98% vs 48h backlog", trend: "up" },
        { label: "Bureau Verification Pass", value: "94.2%", change: "Aadhaar/PAN automated", trend: "up" },
        { label: "Total Disbursal Volume", value: "₹48.6 Lakhs", change: "+28% MoM growth", trend: "up" },
        { label: "Default Risk Index", value: "0.8%", change: "Low NPA risk tier", trend: "up" },
      ],
      funnelStages: [
        { stage: "Digital KYC & Aadhaar OTP", count: "1,240 Applicants", pct: 100 },
        { stage: "CIBIL Bureau & Bank Parsing", count: "1,080 Verified", pct: 87 },
        { stage: "Rule Engine Risk Underwriting", count: "890 Approved", pct: 71 },
        { stage: "Instant UPI/NEFT Disbursal", count: "820 Disbursed", pct: 66 },
      ],
      activities: [
        { title: "Underwritten Loan #LN-5041 (₹1.5 Lakhs)", subtitle: "Aadhaar verified · CIBIL 780 · Approved in 38s", timeAgo: "3 mins ago" },
        { title: "Disbursal batch completed via Bank Gateway", subtitle: "₹4.8 Lakhs credited to 4 approved borrowers", timeAgo: "12 mins ago" },
        { title: "Fraud risk filter blocked anomalous GST filing", subtitle: "Auto-rejected application #LN-5039", timeAgo: "22 mins ago" },
      ],
      columns: {
        idLabel: "Loan Application ID",
        col1Label: "Requested Loan Amount",
        col2Label: "CIBIL Tier & Score",
        statusLabel: "Underwriting Stage",
        assigneeLabel: "Risk Engine / Officer",
        metricLabel: "Disbursal SLA",
      },
      statuses: ["KYC Intake", "Bureau Scoring", "Approved", "Disbursed"],
      initialRecords: [
        {
          id: "LN-5041",
          title: "Working Capital Credit for Kirana Store Expansion",
          col1: "₹1,50,000",
          col2: "CIBIL 780 · Prime Tier",
          status: "Approved",
          badge: "Pre-Approved",
          assignee: "Automated Risk Engine",
          metricVal: "15m SLA",
          createdAt: "Today, 17:45",
        },
        {
          id: "LN-5042",
          title: "Inventory Purchase Micro-Loan for Festive Restock",
          col1: "₹75,000",
          col2: "CIBIL 725 · Standard Tier",
          status: "Disbursed",
          badge: "UPI/NEFT Cleared",
          assignee: "Pooja Mehta",
          metricVal: "8m SLA",
          createdAt: "Today, 17:30",
        },
        {
          id: "LN-5043",
          title: "Point-of-Sale Billing Terminal & Hardware Loan",
          col1: "₹2,20,000",
          col2: "CIBIL 690 · Tier 2 Verification",
          status: "Bureau Scoring",
          badge: "Bank Statement Scan",
          assignee: "Amit Singhania",
          metricVal: "35m SLA",
          createdAt: "Today, 17:55",
        },
        {
          id: "LN-5044",
          title: "Supplier Invoice Discounting & Payables Bridge",
          col1: "₹3,00,000",
          col2: "CIBIL 810 · Super Prime",
          status: "KYC Intake",
          badge: "DigiLocker Verified",
          assignee: "Automated Risk Engine",
          metricVal: "5m SLA",
          createdAt: "Today, 18:02",
        },
      ],
      modules: [
        { id: "overview", title: "Underwriting Dashboard", description: "Real-time loan volume, default telemetry, and underwriting speed", icon: "Building2" },
        { id: "portal", title: "Loan Processing Registry", description: "Applicant bureau scores, KYC validation, and disbursal approvals", icon: "Layout" },
        { id: "analytics", title: "Portfolio Health & Risk", description: "Default risk metrics, interest yield, and TAT efficiency", icon: "BarChart3" },
      ],
    };
  }

  // 3. CLEANTECH / SOLAR INVERTER / RENEWABLE ENERGY / GRID TELEMETRY
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
      domainKey: "solar",
      domainName: "CleanTech & Solar Inverter Operations",
      appTitle: solutionTitle || `${businessName} — Solar Inverter & Grid Telemetry Command`,
      entityName: "Inverter Array",
      entityPlural: "Inverters",
      tagline: "Continuous string telemetry, automated arc-fault detection, and rapid field technician dispatch.",
      problemStatement: problem || "Solar inverter telemetry, arc-fault sensor tracking, and technician dispatch for commercial solar power arrays across utility grids.",
      kpis: [
        { label: "Total Solar Output", value: "4.82 MW", change: "+12% peak irradiance", trend: "up" },
        { label: "Performance Ratio (PR)", value: "99.1%", change: "Optimal generation", trend: "up" },
        { label: "Active Inverter Alarms", value: "1 Warning", change: "Arc sensor triggered", trend: "down" },
        { label: "Field Techs Dispatched", value: "3 Active", change: "SLA < 45 mins", trend: "neutral" },
      ],
      funnelStages: [
        { stage: "Photovoltaic Power Capture", count: "5.2 MW Peak", pct: 100 },
        { stage: "Inverter DC-to-AC Inversion", count: "4.82 MW Active", pct: 92 },
        { stage: "Substation Transformer Step-Up", count: "4.76 MW Grid", pct: 90 },
        { stage: "Utility Feed & Revenue Metering", count: "100% Exported", pct: 88 },
      ],
      activities: [
        { title: "Inverter #INV-A01 reached peak output (21.0 kW)", subtitle: "Ambient temp 32°C · Efficiency 99.4%", timeAgo: "4 mins ago" },
        { title: "Arc-fault sensor triggered on Inverter #INV-B04", subtitle: "Automated disconnect executed in 14ms · Tech dispatched", timeAgo: "15 mins ago" },
        { title: "Grid Sync verified for Substation Array Zone 4", subtitle: "Power factor 0.99 optimal", timeAgo: "30 mins ago" },
      ],
      columns: {
        idLabel: "Inverter Unit ID",
        col1Label: "String Voltage & Current",
        col2Label: "Output Power (kW)",
        statusLabel: "Grid Telemetry Status",
        assigneeLabel: "Field Lead / SCADA",
        metricLabel: "Uptime Health",
      },
      statuses: ["Normal Generation", "Telemetry Ping", "Warning / Fault", "Tech Dispatched"],
      initialRecords: [
        {
          id: "INV-A01",
          title: "Zone 1 Rooftop Commercial Array String",
          col1: "750V · 28A",
          col2: "21.0 kW Output",
          status: "Normal Generation",
          badge: "Optimal 99.4% PR",
          assignee: "SCADA Grid Monitor",
          metricVal: "100%",
          createdAt: "Today, 17:50",
        },
        {
          id: "INV-A02",
          title: "Zone 2 Ground Mounted Single-Axis Tracking Array",
          col1: "720V · 24A",
          col2: "17.3 kW Output",
          status: "Normal Generation",
          badge: "Optimal 98.8% PR",
          assignee: "SCADA Grid Monitor",
          metricVal: "99.8%",
          createdAt: "Today, 17:52",
        },
        {
          id: "INV-B04",
          title: "Zone 3 East Wing Commercial Inverter String",
          col1: "610V · 14A (Fluctuating)",
          col2: "8.5 kW (Drop Detected)",
          status: "Warning / Fault",
          badge: "Arc-Fault Sensor Flag",
          assignee: "Tech Harish Rawat",
          metricVal: "82%",
          createdAt: "Today, 18:01",
        },
        {
          id: "INV-C09",
          title: "Zone 4 Substation Tie-In Inverter System",
          col1: "760V · 29A",
          col2: "22.0 kW Output",
          status: "Telemetry Ping",
          badge: "Heartbeat Verified",
          assignee: "SCADA Grid Monitor",
          metricVal: "100%",
          createdAt: "Today, 18:03",
        },
      ],
      modules: [
        { id: "overview", title: "Solar Generation Radar", description: "Real-time megawatt output, irradiance, and performance ratio", icon: "Building2" },
        { id: "portal", title: "Inverter Telemetry Matrix", description: "String voltage, temperature sensors, and fault diagnostics", icon: "Layout" },
        { id: "analytics", title: "Grid Export Analytics", description: "Historical power yield, CO2 offset, and revenue telemetry", icon: "BarChart3" },
      ],
    };
  }

  // 4. HEALTHCARE / CLINICAL DIAGNOSTICS / PATHOLOGY LAB / LIS
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
      domainKey: "healthcare",
      domainName: "Clinical Diagnostics & LIS Telemetry",
      appTitle: solutionTitle || `${businessName} — Clinical Diagnostics & LIS Telemetry`,
      entityName: "Diagnostic Specimen",
      entityPlural: "Specimens",
      tagline: "Automated sample tube barcoding, bidirectional analyzer telemetry, and rapid report sign-off.",
      problemStatement: problem || "Diagnostic pathology laboratory with automated sample barcoding, LIS analyzer bidirectional telemetry, and rapid doctor report delivery.",
      kpis: [
        { label: "Report Turnaround TAT", value: "1.4 Hours", change: "-68% faster vs 4h SLA", trend: "up" },
        { label: "Analyzer Test Velocity", value: "340 Tests/Hr", change: "Sysmex & Roche connected", trend: "up" },
        { label: "Delta Check Verification", value: "99.9%", change: "Zero sample mismatch", trend: "up" },
        { label: "Critical Panic Alerts", value: "2 Flagged", change: "Immediate doctor notify", trend: "down" },
      ],
      funnelStages: [
        { stage: "Phlebotomy Intake & Barcode", count: "480 Tubes", pct: 100 },
        { stage: "Automated Centrifuge & Sorter", count: "420 Processed", pct: 87 },
        { stage: "Analyzer Bi-directional Test", count: "390 Tested", pct: 81 },
        { stage: "Doctor Sign-Off & Report PDF", count: "360 Delivered", pct: 75 },
      ],
      activities: [
        { title: "Specimen #SPEC-9401 (CBC Panel) completed", subtitle: "Sysmex XN-1000 · Delta check passed · Signed by Dr. Sen", timeAgo: "3 mins ago" },
        { title: "Cobas c311 flagged high glucose on #SPEC-9402", subtitle: "Critical value panic alert sent to consulting physician", timeAgo: "11 mins ago" },
        { title: "Batch of 24 Thyroid profiles dispatched via WhatsApp", subtitle: "Encrypted PDF delivered to patient portals", timeAgo: "25 mins ago" },
      ],
      columns: {
        idLabel: "Specimen Barcode",
        col1Label: "Test Investigation Panel",
        col2Label: "Analyzer Instrument ID",
        statusLabel: "Laboratory Stage",
        assigneeLabel: "Pathologist Lead",
        metricLabel: "Report TAT SLA",
      },
      statuses: ["Sample Intake", "In Analyzer", "Pathologist Review", "Report Delivered"],
      initialRecords: [
        {
          id: "SPEC-9401",
          title: "Complete Hemogram (CBC) with Automated Differential",
          col1: "Hematology Panel",
          col2: "Sysmex XN-1000",
          status: "In Analyzer",
          badge: "Delta Check OK",
          assignee: "Dr. Ananya Sen",
          metricVal: "45m TAT",
          createdAt: "Today, 17:50",
        },
        {
          id: "SPEC-9402",
          title: "Comprehensive Lipid Profile & Liver Function (LFT)",
          col1: "Biochemistry Panel",
          col2: "Cobas c311 Analyzer",
          status: "Pathologist Review",
          badge: "Borderline SGPT",
          assignee: "Dr. Rajesh Nair",
          metricVal: "1.2h TAT",
          createdAt: "Today, 17:35",
        },
        {
          id: "SPEC-9403",
          title: "HbA1c Glycated Hemoglobin & Plasma Fasting Sugar",
          col1: "Diabetes Screening",
          col2: "Bio-Rad D-10 HPLC",
          status: "Report Delivered",
          badge: "WhatsApp/PDF Sent",
          assignee: "Dr. Ananya Sen",
          metricVal: "1.5h TAT",
          createdAt: "Today, 17:20",
        },
        {
          id: "SPEC-9404",
          title: "Total Thyroid Profile (T3, T4, Ultrasensitive TSH)",
          col1: "Immunology Panel",
          col2: "Architect i1000SR",
          status: "Sample Intake",
          badge: "Barcoded & Staged",
          assignee: "Lab Lead S. Pillai",
          metricVal: "30m TAT",
          createdAt: "Today, 18:02",
        },
      ],
      modules: [
        { id: "overview", title: "Laboratory Control Center", description: "Real-time sample throughput, panic alert notifications, and turnaround SLA", icon: "Building2" },
        { id: "portal", title: "Diagnostic Specimen Registry", description: "Live analyzer queues, abnormal flag triage, and pathologist sign-off", icon: "Layout" },
        { id: "analytics", title: "Quality & TAT Analytics", description: "Equipment calibration telemetry, delta check audits, and volume statistics", icon: "BarChart3" },
      ],
    };
  }

  // 5. LOGISTICS / FREIGHT / FLEET DISPATCH / SUPPLY CHAIN
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
      domainKey: "logistics",
      domainName: "Fleet Dispatch & Telematics Control",
      appTitle: solutionTitle || `${businessName} — Fleet Dispatch & Telematics Hub`,
      entityName: "Consignment Shipment",
      entityPlural: "Shipments",
      tagline: "Consignment routing, GPS vehicle telemetry, and automated electronic Proof-of-Delivery.",
      problemStatement: problem || "Fleet logistics tracking, dispatch route optimization, and electronic proof of delivery verification across transport corridors.",
      kpis: [
        { label: "On-Time Dispatch Rate", value: "98.9%", change: "+6.1% vs last month", trend: "up" },
        { label: "Fleet Vehicle Utilization", value: "92.4%", change: "42 of 45 en route", trend: "up" },
        { label: "Average Delivery TAT", value: "3.2 Hours", change: "Dynamic route optimal", trend: "up" },
        { label: "Electronic POD Verification", value: "100%", change: "OTP & Geotagged", trend: "neutral" },
      ],
      funnelStages: [
        { stage: "Consignment Manifest Booking", count: "320 Shipments", pct: 100 },
        { stage: "Vehicle Load & Weighbridge", count: "290 Dispatched", pct: 90 },
        { stage: "Corridor GPS Telematics En Route", count: "260 In Transit", pct: 81 },
        { stage: "Last-Mile POD OTP Verified", count: "240 Delivered", pct: 75 },
      ],
      activities: [
        { title: "Waybill #WB-7721 entered Mumbai-Pune Expressway", subtitle: "MH-12-RN-4021 · Speed 62 km/h · ETA 19:30", timeAgo: "5 mins ago" },
        { title: "Chilled Pharma consignment #WB-7722 delivered", subtitle: "Geotagged OTP confirmation verified at Gurgaon Lab", timeAgo: "14 mins ago" },
        { title: "Dynamic route re-routed Truck #KA-01-3390", subtitle: "Avoided 45 min traffic delay near Hebbal Flyover", timeAgo: "28 mins ago" },
      ],
      columns: {
        idLabel: "Waybill Tracking ID",
        col1Label: "Origin → Destination Hub",
        col2Label: "Fleet Vehicle & Speed",
        statusLabel: "Transit Status",
        assigneeLabel: "Assigned Driver",
        metricLabel: "ETA Turnaround",
      },
      statuses: ["Manifest Created", "In Transit", "Out for Delivery", "Delivered & POD Verified"],
      initialRecords: [
        {
          id: "WB-7721",
          title: "Precision Industrial CNC Spare Parts Consignment (480 kg)",
          col1: "Mumbai Hub → Pune Central",
          col2: "MH-12-RN-4021 · 62 km/h",
          status: "In Transit",
          badge: "On Schedule",
          assignee: "Driver Ramesh Kumar",
          metricVal: "1.5h ETA",
          createdAt: "Today, 17:40",
        },
        {
          id: "WB-7722",
          title: "Cold-Chain Temperature Controlled Insulin Diagnostic Kits",
          col1: "Delhi Airport → Gurgaon Lab",
          col2: "DL-1A-EE-9012 · 45 km/h",
          status: "Out for Delivery",
          badge: "4°C Chilled OK",
          assignee: "Driver Suresh Yadav",
          metricVal: "25m ETA",
          createdAt: "Today, 17:15",
        },
        {
          id: "WB-7723",
          title: "Enterprise Server Hardware & Rack Mount Switches",
          col1: "Bengaluru East → Whitefield Tech Park",
          col2: "KA-01-MJ-3390 · Geotagged",
          status: "Delivered & POD Verified",
          badge: "OTP Confirmed",
          assignee: "Driver Mohan Gowda",
          metricVal: "Completed",
          createdAt: "Today, 16:50",
        },
        {
          id: "WB-7724",
          title: "FMCG Bulk Palletized Retail Stock (1.2 Metric Tons)",
          col1: "Hyderabad Depot → Secunderabad Hub",
          col2: "TS-09-UB-1102 · Staged",
          status: "Manifest Created",
          badge: "Geo-Fenced Route",
          assignee: "Dispatch Lead Naresh",
          metricVal: "4.0h ETA",
          createdAt: "Today, 18:01",
        },
      ],
      modules: [
        { id: "overview", title: "Fleet Command Center", description: "Real-time fleet telematics, corridor velocity, and active manifests", icon: "Building2" },
        { id: "portal", title: "Waybill & Shipment Registry", description: "Live GPS positions, transit waybills, and electronic POD audit trail", icon: "Layout" },
        { id: "analytics", title: "Logistics Analytics", description: "Turnaround benchmarks, fuel consumption, and on-time performance", icon: "BarChart3" },
      ],
    };
  }

  // 6. HR / RECRUITMENT / TALENT PIPELINE (TalentCraft)
  if (
    combined.includes("talentcraft") ||
    combined.includes("recruitment") ||
    combined.includes("staffing agency") ||
    combined.includes("recruiter") ||
    combined.includes("headhunting") ||
    (combined.includes("candidate") && combined.includes("hire"))
  ) {
    return {
      domainKey: "hr",
      domainName: "Recruitment & Talent Operations Suite",
      appTitle: solutionTitle || `${businessName} — Recruitment & Candidate Operations Hub`,
      entityName: "Candidate Profile",
      entityPlural: "Candidates",
      tagline: "Pipeline velocity tracking, interview round scheduling, and automated offer compliance.",
      problemStatement: problem || "Candidate tracking across multiple recruitment tiers suffers from manual Excel coordination, leading to interview turnaround lag.",
      kpis: [
        { label: "Active Sourced Pipeline", value: "428 Candidates", change: "+14% vs last week", trend: "up" },
        { label: "Interview Round Turnaround", value: "9.2 Days", change: "-67% faster (SLA)", trend: "up" },
        { label: "Client Placement Revenue", value: "₹18.4 Lakhs", change: "+24% MoM growth", trend: "up" },
        { label: "Recruiter Utilization Rate", value: "94.2%", change: "8 of 8 recruiters active", trend: "neutral" },
      ],
      funnelStages: [
        { stage: "Sourced & AI Screened", count: "428 Profiles", pct: 100 },
        { stage: "Technical Evaluation Round", count: "184 Qualified", pct: 43 },
        { stage: "Client Final Interview", count: "72 Finalists", pct: 17 },
        { stage: "Offer Accepted & Placed", count: "48 Hired", pct: 11 },
      ],
      activities: [
        { title: "Rahul S. placed Senior React Engineer", subtitle: "₹28 LPA CTC · TechCorp Client · 12-day turnaround", timeAgo: "10 mins ago" },
        { title: "Priya V. completed 8 technical screens", subtitle: "Average interview feedback score: 9.2/10", timeAgo: "24 mins ago" },
        { title: "AcmeCorp approved 3 finalist profiles", subtitle: "Interviews scheduled for tomorrow 11:00 AM", timeAgo: "45 mins ago" },
      ],
      columns: {
        idLabel: "Candidate ID",
        col1Label: "Target Role & Domain",
        col2Label: "Expected CTC & Client",
        statusLabel: "Interview Pipeline Round",
        assigneeLabel: "Assigned Recruiter",
        metricLabel: "Notice Period / SLA",
      },
      statuses: ["Sourced", "Technical Round", "Client Final", "Offer Accepted"],
      initialRecords: [
        {
          id: "TC-1041",
          title: "Senior Fullstack TypeScript Engineer (7 yrs experience)",
          col1: "Lead React & Node.js",
          col2: "₹32 LPA · TechFin Client",
          status: "Client Final",
          badge: "Tech Score: 9.4",
          assignee: "Aarav Sharma",
          metricVal: "15 Days Notice",
          createdAt: "Today, 17:30",
        },
        {
          id: "TC-1042",
          title: "DevOps & Cloud Infrastructure Specialist (AWS / K8s)",
          col1: "Kubernetes & Terraform",
          col2: "₹28 LPA · SaaS Global",
          status: "Technical Round",
          badge: "System Design Slot",
          assignee: "Priya Iyer",
          metricVal: "30 Days Notice",
          createdAt: "Today, 17:15",
        },
        {
          id: "TC-1043",
          title: "Enterprise B2B Sales & GTM Revenue Director",
          col1: "B2B SaaS Enterprise",
          col2: "₹45 LPA · CloudScale Client",
          status: "Offer Accepted",
          badge: "BGV Cleared",
          assignee: "Sneha Kulkarni",
          metricVal: "Immediate Joiner",
          createdAt: "Today, 16:45",
        },
        {
          id: "TC-1044",
          title: "Product Manager — AI Automated Workflows",
          col1: "LLM Products & Systems",
          col2: "₹38 LPA · NextGen Labs",
          status: "Sourced",
          badge: "Resume 98% Match",
          assignee: "Rohan Deshmukh",
          metricVal: "45 Days Notice",
          createdAt: "Today, 18:01",
        },
      ],
      modules: [
        { id: "overview", title: "Recruitment Command Hub", description: "Pipeline velocity, recruiter bandwidth, and client placement revenue", icon: "Building2" },
        { id: "portal", title: "Candidate Pipeline Registry", description: "Candidate stages, interview scorecards, and client approvals", icon: "Layout" },
        { id: "analytics", title: "SLA & Hiring Analytics", description: "Time-to-hire turnaround, sourcing channel yields, and placement ROI", icon: "BarChart3" },
      ],
    };
  }

  // 7. UNIVERSAL DYNAMIC DOMAIN SYNTHESIZER
  // For ANY arbitrary business statement (Agriculture, EdTech, Real Estate, Legal, Gaming, Hospitality, etc.)
  const words = problem.split(/\s+/).filter((w) => w.length > 4);
  const keyword1 = words[0] || "Operational";
  const keyword2 = words[1] || "Process";

  const entityTitle = `${keyword1.charAt(0).toUpperCase() + keyword1.slice(1)} Record`;
  const cleanTitle = solutionTitle || `${businessName} Digital Operations Command`;

  return {
    domainKey: "custom",
    domainName: `${industry} Operations Platform`,
    appTitle: cleanTitle,
    entityName: entityTitle,
    entityPlural: `${entityTitle}s`,
    tagline: `Automated ${industry.toLowerCase()} workflow orchestration, compliance enforcement, and real-time SLA tracking.`,
    problemStatement: problem || "Automated end-to-end digital operations, compliance verification, and execution intelligence.",
    kpis: [
      { label: "Automated Throughput", value: "98.4%", change: "+12.4% vs manual", trend: "up" },
      { label: "Cycle Turnaround TAT", value: "1.8 Mins", change: "-62% faster via AI", trend: "up" },
      { label: "Execution Accuracy", value: "99.98%", change: "Zero manual data loss", trend: "up" },
      { label: "Active Operational Nodes", value: "12 Stations", change: "100% capacity", trend: "neutral" },
    ],
    funnelStages: [
      { stage: "Ingestion & Validation", count: "1,240 Units", pct: 100 },
      { stage: "Rule Processing & Routing", count: "1,080 Processed", pct: 87 },
      { stage: "Quality & Verification", count: "890 Verified", pct: 71 },
      { stage: "Final Execution & Delivery", count: "780 Completed", pct: 62 },
    ],
    activities: [
      { title: `Automated processing completed for ${entityTitle} #01`, subtitle: `Validated according to ${industry} regulatory standards`, timeAgo: "5 mins ago" },
      { title: "Real-time database synchronization confirmed", subtitle: "Supabase PostgreSQL 16 edge connection active", timeAgo: "18 mins ago" },
      { title: "Anomaly check verified 0 SLA breaches", subtitle: "All active workstreams executing within target thresholds", timeAgo: "30 mins ago" },
    ],
    columns: {
      idLabel: "Record Identifier",
      col1Label: "Operational Category",
      col2Label: "Parameters & Scope",
      statusLabel: "Execution Stage",
      assigneeLabel: "Assigned Lead",
      metricLabel: "SLA Turnaround",
    },
    statuses: ["Intake", "In Progress", "Review", "Completed"],
    initialRecords: [
      {
        id: "REC-101",
        title: `Primary ${keyword1} Execution Workflow`,
        col1: `${industry} Core`,
        col2: "Automated Compliance Gate",
        status: "In Progress",
        badge: "High Priority",
        assignee: "Operations Lead",
        metricVal: "2.0h SLA",
        createdAt: "Today, 17:40",
      },
      {
        id: "REC-102",
        title: `Secondary ${keyword2} Verification Node`,
        col1: "Data Governance",
        col2: "Multi-Tenant Schema Verified",
        status: "Review",
        badge: "Audit Ready",
        assignee: "Security Specialist",
        metricVal: "1.0h SLA",
        createdAt: "Today, 17:25",
      },
      {
        id: "REC-103",
        title: `Telemetry Telematics & Performance Sync`,
        col1: "Real-Time Telemetry",
        col2: "Sub-Second Edge Verification",
        status: "Completed",
        badge: "Verified 100%",
        assignee: "Systems Engineer",
        metricVal: "Completed",
        createdAt: "Today, 16:55",
      },
      {
        id: "REC-104",
        title: `Executive Governance & Audit Ledger`,
        col1: "Enterprise Ledger",
        col2: "Cryptographic Trace Enabled",
        status: "Intake",
        badge: "Queued",
        assignee: "Compliance Officer",
        metricVal: "4.0h SLA",
        createdAt: "Today, 18:02",
      },
    ],
    modules: [
      { id: "overview", title: "Operations Hub", description: `High-density real-time command center for ${industry}`, icon: "Building2" },
      { id: "portal", title: "Operational Execution Registry", description: "Live entity lifecycle tracking, validation, and workflow state transitions", icon: "Layout" },
      { id: "analytics", title: "Performance Telemetry", description: "SLA compliance, throughput metrics, and bottleneck diagnostics", icon: "BarChart3" },
    ],
  };
}

export function enrichDomainAppModel(raw: any, context: WorkspaceContextInput = {}): DomainAppModel {
  const dKey = raw.domainKey || "custom";
  const bName = context.businessName || context.name || raw.appTitle?.split("—")?.[0]?.trim() || "Enterprise";
  const entitySingular = raw.entityName || "Record";
  const entityPlural = raw.entityPlural || `${entitySingular}s`;

  // 1. Ensure all 6 comprehensive platform modules
  const modules = [
    {
      id: "overview",
      title: "Operations Command Center",
      description: `High-density operational telemetry, throughput pipelines, and real-time alerts for ${raw.domainName}.`,
      icon: "Building2",
    },
    {
      id: "portal",
      title: `${entityPlural} Workflow Registry`,
      description: `Live CRUD registry, state pipeline transitions, barcode verifications, and audit logging.`,
      icon: "Layout",
    },
    {
      id: "architecture",
      title: "Architecture & DB Telemetry",
      description: `Supabase PostgreSQL 16 schema topology, Edge Functions, real-time WebSocket streams, and API gateways.`,
      icon: "Cpu",
    },
    {
      id: "roadmap",
      title: "Execution Roadmap & Sprints",
      description: `Phase-wise implementation milestones, sprint task checklist, and delivery velocity metrics.`,
      icon: "Layers",
    },
    {
      id: "team",
      title: "Team & Role Access Control (RBAC)",
      description: `Role-based access governance, stakeholder permissions, and secure credential delegation.`,
      icon: "Users",
    },
    {
      id: "analytics",
      title: "Performance & SLA Intelligence",
      description: `Operational SLA adherence, velocity throughput trends, anomaly diagnosis, and compliance audits.`,
      icon: "BarChart3",
    },
  ];

  // 2. Specialized Demo Users per domain with realistic roles & credentials
  let demoUsers: DomainDemoUser[] = [];
  if (dKey === "quickcommerce") {
    demoUsers = [
      {
        id: "usr-qc-1",
        name: "Aarav Kapoor",
        email: "manager@quickcart.com",
        password: "admin123",
        role: "Dark Store Operations Manager",
        badge: "Admin & Dispatch Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
        department: "Fulfillment Operations",
        permissions: ["All Operations", "Inventory Override", "SLA Waiver", "User Administration"],
      },
      {
        id: "usr-qc-2",
        name: "Priya Desai",
        email: "picker.lead@quickcart.com",
        password: "picker123",
        role: "Aisle Batch Picking Captain",
        badge: "Picking Lead",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60",
        department: "Dark Store Staging",
        permissions: ["Order Picking", "Bay Barcode Scan", "SKU Mispick Flag"],
      },
      {
        id: "usr-qc-3",
        name: "Manish Joshi",
        email: "qc.lead@quickcart.com",
        password: "qc123",
        role: "Dispatch Bay Quality Inspector",
        badge: "QC & Packing",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
        department: "Quality Assurance",
        permissions: ["Bag QC Seal", "Barcode Verification", "Weight Verification"],
      },
      {
        id: "usr-qc-4",
        name: "Devendra Roy",
        email: "rider.dev@quickcart.com",
        password: "rider123",
        role: "Express Delivery Partner Lead",
        badge: "10-Min Rider Fleet",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
        department: "Last-Mile Delivery",
        permissions: ["Trip Acceptance", "Customer OTP Delivery", "Live GPS Telemetry"],
      },
    ];
  } else if (dKey === "fintech") {
    demoUsers = [
      {
        id: "usr-ft-1",
        name: "Neha Chawla",
        email: "vp.risk@finpulse.io",
        password: "admin123",
        role: "VP Credit Risk & Compliance",
        badge: "Disbursal Authority",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
        department: "Credit Committee",
        permissions: ["All Approvals", "Risk Limit Override", "Disbursal Sign-Off", "User Administration"],
      },
      {
        id: "usr-ft-2",
        name: "Aditya Saxena",
        email: "underwriter@finpulse.io",
        password: "analyst123",
        role: "Senior Underwriting Analyst",
        badge: "Credit Underwriter",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60",
        department: "Underwriting",
        permissions: ["Bureau Assessment", "Cashflow Modeling", "Sanction Proposal"],
      },
      {
        id: "usr-ft-3",
        name: "Farhan Merchant",
        email: "kyc.lead@finpulse.io",
        password: "kyc123",
        role: "Digital Identity & KYC Officer",
        badge: "KYC & AML Lead",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60",
        department: "Compliance & Fraud",
        permissions: ["Aadhaar e-KYC Verification", "Video KYC Audit", "AML Clearance"],
      },
      {
        id: "usr-ft-4",
        name: "Pooja Sundaram",
        email: "collections@finpulse.io",
        password: "recovery123",
        role: "Automated NACH & Repayment Lead",
        badge: "Treasury Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
        department: "Treasury & Collections",
        permissions: ["E-Mandate Ledger", "Disbursal Release", "Repayment Reconciliation"],
      },
    ];
  } else if (dKey === "solar") {
    demoUsers = [
      {
        id: "usr-sl-1",
        name: "Ramesh V. Patel",
        email: "ops.lead@solargrid.in",
        password: "admin123",
        role: "Chief Grid Operations Engineer",
        badge: "Grid Sync Lead",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60",
        department: "Grid Operations",
        permissions: ["All Commissioning", "Grid Tie Authorization", "System Shutdown", "User Administration"],
      },
      {
        id: "usr-sl-2",
        name: "Deepak Kulkarni",
        email: "scada.tech@solargrid.in",
        password: "scada123",
        role: "SCADA & Inverter Telemetry Specialist",
        badge: "Inverter Lead",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60",
        department: "IoT Engineering",
        permissions: ["String Inverter Telemetry", "Arc-Fault Diagnosis", "Firmware Push"],
      },
      {
        id: "usr-sl-3",
        name: "Sneha Iyer",
        email: "auditor@solargrid.in",
        password: "field123",
        role: "Field Rooftop & PV Auditor",
        badge: "Site Survey Lead",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
        department: "Field Survey",
        permissions: ["Drone Thermography", "Shadow Analysis CAD", "Structural Audit"],
      },
      {
        id: "usr-sl-4",
        name: "Rohit Namboodiri",
        email: "discom.liaison@solargrid.in",
        password: "permit123",
        role: "DISCOM Regulatory & Net-Meter Liaison",
        badge: "Permit Specialist",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
        department: "Regulatory Compliance",
        permissions: ["DISCOM NOC Filing", "Net-Meter Commissioning", "CEIG Inspection"],
      },
    ];
  } else if (dKey === "healthcare") {
    demoUsers = [
      {
        id: "usr-hc-1",
        name: "Dr. Ananya Sen",
        email: "dr.sen@medipulse.org",
        password: "admin123",
        role: "Chief Pathologist & Medical Director",
        badge: "Full Approval Authority",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=60",
        department: "Laboratory Medicine",
        permissions: ["All Sign-Offs", "Abnormal Panic Alert Triage", "Clinical Validation", "User Administration"],
      },
      {
        id: "usr-hc-2",
        name: "Vikram P. Sharma",
        email: "tech.vikram@medipulse.org",
        password: "tech123",
        role: "Senior Analyzer Technologist",
        badge: "Delta Check Specialist",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=60",
        department: "Biochemistry & Hematology",
        permissions: ["Bi-directional Analyzer Runs", "Specimen Rerun", "Quality Calibration"],
      },
      {
        id: "usr-hc-3",
        name: "Rahul Verma",
        email: "phleb.rahul@medipulse.org",
        password: "field123",
        role: "Field Phlebotomy Lead",
        badge: "Sample Intake Lead",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=60",
        department: "Home Collection Logistics",
        permissions: ["Barcode Vial Scan", "Cold-Chain GPS Dispatch", "Patient Identity Verification"],
      },
      {
        id: "usr-hc-4",
        name: "Meera Nambiar",
        email: "quality.meera@medipulse.org",
        password: "audit123",
        role: "NABL & ABDM Quality Compliance Lead",
        badge: "EHR & ABDM Lead",
        avatar: "https://images.unsplash.com/photo-1594824813590-482260ff0d48?w=100&auto=format&fit=crop&q=60",
        department: "Quality & Regulatory",
        permissions: ["ABDM Health Locker Sync", "NABL Audit Trails", "WhatsApp PDF Encryption"],
      },
    ];
  } else if (dKey === "logistics") {
    demoUsers = [
      {
        id: "usr-lg-1",
        name: "Rajesh Singhania",
        email: "director@fleetops.com",
        password: "admin123",
        role: "Operations Director & Fleet Commander",
        badge: "Full Fleet Authority",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
        department: "Executive Logistics",
        permissions: ["All Fleet Control", "Manifest Sign-Off", "Carrier Contract Approval", "User Administration"],
      },
      {
        id: "usr-lg-2",
        name: "Tariq Khan",
        email: "dispatch.tariq@fleetops.com",
        password: "dispatch123",
        role: "Route Optimization Controller",
        badge: "Dispatch Tower Lead",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
        department: "Control Tower",
        permissions: ["Dynamic Route Allocation", "Vehicle Scheduling", "Toll & Fuel Authorization"],
      },
      {
        id: "usr-lg-3",
        name: "Sunita Rao",
        email: "dock.sunita@fleetops.com",
        password: "dock123",
        role: "Cross-Dock Hub Supervisor",
        badge: "Cross-Dock Specialist",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
        department: "Hub & Warehouse",
        permissions: ["Inbound Scan Verification", "Pallet Triage", "Reefer Temperature Logs"],
      },
      {
        id: "usr-lg-4",
        name: "Gurdeep Singh",
        email: "driver.lead@fleetops.com",
        password: "driver123",
        role: "Long-Haul Fleet Captain",
        badge: "e-POD Captain",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60",
        department: "Interstate Freight",
        permissions: ["Trip Check-in", "Electronic Proof of Delivery", "Fuel Telematics Sync"],
      },
    ];
  } else if (dKey === "hr") {
    demoUsers = [
      {
        id: "usr-hr-1",
        name: "Sarah Jenkins",
        email: "director@talentcraft.co",
        password: "admin123",
        role: "Managing Director & Executive Search Lead",
        badge: "Placement Authority",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
        department: "Executive Search",
        permissions: ["All Client Accounts", "Extend Official Offers", "Fee Approvals", "User Administration"],
      },
      {
        id: "usr-hr-2",
        name: "Rohan Mathur",
        email: "senior.recruiter@talentcraft.co",
        password: "recruiter123",
        role: "Principal Technical Recruiter",
        badge: "Interview Lead",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60",
        department: "Talent Acquisition",
        permissions: ["Candidate Shortlisting", "Technical Interview Schedule", "Feedback Scoring"],
      },
      {
        id: "usr-hr-3",
        name: "Kavita Rao",
        email: "sourcer@talentcraft.co",
        password: "sourcer123",
        role: "Talent Sourcing Specialist",
        badge: "Vector Search Lead",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60",
        department: "Sourcing & Research",
        permissions: ["Resume Vector Search", "Candidate Ingestion", "Outreach Tracking"],
      },
      {
        id: "usr-hr-4",
        name: "Amit Shah",
        email: "client.partner@talentcraft.co",
        password: "partner123",
        role: "Corporate HR Account Manager",
        badge: "Client Success",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60",
        department: "Client Relations",
        permissions: ["Client Candidate Review", "Background Check Trigger", "Offer Negotiation"],
      },
    ];
  } else {
    // Universal Custom Domain Demo Users (Tailored to custom business & industry)
    const indClean = (raw.domainName || "Operations").replace(/Operations.*|Platform.*/, "").trim();
    demoUsers = [
      {
        id: "usr-cm-1",
        name: "Vikram Malhotra",
        email: `lead@${bName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com`,
        password: "admin123",
        role: `Chief ${indClean} Operations Officer`,
        badge: "Executive Admin",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
        department: "Executive Management",
        permissions: ["All System Access", "Workflow Override", "Compliance Approval", "User Administration"],
      },
      {
        id: "usr-cm-2",
        name: "Ananya Iyer",
        email: `ops@${bName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com`,
        password: "ops123",
        role: `Lead ${entitySingular} Workflow Specialist`,
        badge: "Operations Lead",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
        department: "Core Operations",
        permissions: [`Manage ${entityPlural}`, "Status Transition", "Verification Clearance"],
      },
      {
        id: "usr-cm-3",
        name: "Karan Patel",
        email: `field@${bName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com`,
        password: "field123",
        role: `Senior Field & Telemetry Inspector`,
        badge: "Field Execution",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
        department: "Field Execution",
        permissions: ["Field Ingestion", "Telemetry Check", "Mobile Check-in"],
      },
      {
        id: "usr-cm-4",
        name: "Sunita Nambiar",
        email: `audit@${bName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com`,
        password: "audit123",
        role: `Regulatory & SLA Audit Director`,
        badge: "Quality Auditor",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
        department: "Audit & Risk",
        permissions: ["Audit Log Inspection", "SLA Adherence Review", "Export Data"],
      },
    ];
  }

  // 3. Architecture Services tailored to domain
  const architecture: DomainArchitectureItem[] = [
    {
      id: "arch-1",
      name: `public.${dKey}_records`,
      type: "Database Table",
      description: `Primary Supabase PostgreSQL 16 relational data store with automated Row-Level Security (RLS).`,
      tech: "PostgreSQL 16 · Supabase",
      status: "Active",
      schema: `id TEXT PRIMARY KEY, title TEXT, col1_data TEXT, col2_data TEXT, status TEXT, badge TEXT, assignee TEXT, metric_value TEXT, created_at TIMESTAMPTZ`,
    },
    {
      id: "arch-2",
      name: `${dKey}_telemetry_stream`,
      type: "Realtime Stream",
      description: `Sub-second bi-directional WebSocket telemetry stream for instant multi-user state synchronization.`,
      tech: "WebSocket · Supabase Realtime",
      status: "Synced",
      schema: `channel('${dKey}:telemetry').on('postgres_changes', { event: '*', schema: 'public' })`,
    },
    {
      id: "arch-3",
      name: `${dKey}_workflow_engine`,
      type: "Edge Function",
      description: `Deno Edge Function enforcing automated business validation rules, SLA timers, and compliance audits.`,
      tech: "Deno · Edge Functions",
      status: "Healthy",
      schema: `POST /functions/v1/${dKey}-process { recordId, action, payload }`,
    },
    {
      id: "arch-4",
      name: `${dKey}_integration_gateway`,
      type: "API Gateway",
      description: `Secured REST & GraphQL gateway interfacing enterprise ERPs, legacy tools, and customer dispatch endpoints.`,
      tech: "PostgREST · HTTPS TLS 1.3",
      status: "Active",
      schema: `GET|POST /rest/v1/${dKey}_records (Authorized via JWT Bearer)`,
    },
  ];

  // 4. Execution Roadmap Sprints
  const roadmap: DomainRoadmapSprint[] = [
    {
      id: "sprint-1",
      phase: "Phase 1: Foundation & Data Ingestion",
      title: "Core Ingestion & Real-Time Pipeline Setup",
      duration: "Weeks 1 - 3",
      status: "Completed",
      progress: 100,
      tasks: [
        { id: "t1-1", title: `Initialize PostgreSQL 16 schema for ${entityPlural}`, done: true, assignee: demoUsers[0]?.name || "Lead Engineer" },
        { id: "t1-2", title: `Configure automated input ingestion for ${raw.domainName}`, done: true, assignee: demoUsers[1]?.name || "Tech Lead" },
        { id: "t1-3", title: "Enable cryptographic audit trail & RLS authorization", done: true, assignee: demoUsers[0]?.name || "Security Lead" },
        { id: "t1-4", title: "Deploy mobile responsive responsive layout across all viewports", done: true, assignee: demoUsers[2]?.name || "Frontend Lead" },
      ],
    },
    {
      id: "sprint-2",
      phase: "Phase 2: Workflow Automation & Telemetry",
      title: "Automated Rules & Live Telematics Synchronization",
      duration: "Weeks 4 - 6",
      status: "In Progress",
      progress: 75,
      tasks: [
        { id: "t2-1", title: `Deploy Edge Function validation engine for ${entitySingular} triage`, done: true, assignee: demoUsers[1]?.name || "Backend Lead" },
        { id: "t2-2", title: "Connect bi-directional WebSocket telemetry stream", done: true, assignee: demoUsers[1]?.name || "Fullstack Engineer" },
        { id: "t2-3", title: "Integrate role-based approval gates and audit logs", done: true, assignee: demoUsers[3]?.name || "Compliance Lead" },
        { id: "t2-4", title: "Implement instant CSV reporting and analytics dashboard", done: false, assignee: demoUsers[2]?.name || "Analytics Specialist" },
      ],
    },
    {
      id: "sprint-3",
      phase: "Phase 3: AI Intelligence & Ecosystem Scaling",
      title: "Predictive SLA Optimization & Enterprise Scaling",
      duration: "Weeks 7 - 10",
      status: "Upcoming",
      progress: 25,
      tasks: [
        { id: "t3-1", title: "Train predictive SLA breach alert model on historical throughput", done: false, assignee: demoUsers[0]?.name || "AI Lead" },
        { id: "t3-2", title: "Connect external legacy ERP and billing gateways", done: false, assignee: demoUsers[1]?.name || "Integration Engineer" },
        { id: "t3-3", title: "Conduct full ISO / regulatory compliance security audit", done: false, assignee: demoUsers[3]?.name || "Security Auditor" },
      ],
    },
  ];

  return {
    ...raw,
    modules,
    demoUsers,
    architecture,
    roadmap,
  };
}

export function resolveDomainAppModel(context: WorkspaceContextInput = {}): DomainAppModel {
  const raw = resolveRawDomainAppModel(context);
  return enrichDomainAppModel(raw, context);
}
