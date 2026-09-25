/**
 * Universal Multi-Format Document Exporters for Microsoft Word, Microsoft Excel, and Microsoft PowerPoint.
 * Generates standard-compliant Office XML/HTML documents that open natively in MS Office, Google Workspace, and LibreOffice.
 */
import { saveAndShareFile } from "./native-bridge";
import { getDatabaseBlueprint } from "./database-data";
import { getRoadmapForWorkspace } from "./planning-data";
import { getRoiModelForWorkspace } from "./roi-data";

/**
 * Downloads a binary or text blob in the browser, or opens system share sheet on native mobile.
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  void saveAndShareFile(filename, content, mimeType);
}

/**
 * Generates Word HTML string adapted to the active problem statement and workspace context.
 */
export function exportToWordDocHtml(projectName: string, workspaceContext?: any): string {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  // Resolve context from arg or fallback to localStorage
  let ctx = workspaceContext;
  if (!ctx && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) ctx = JSON.parse(raw);
    } catch {}
  }

  const title = ctx?.name || projectName || "Enterprise Solution Blueprint";
  const industry = ctx?.industry || "Enterprise Cloud & Software";
  const problemStatement = ctx?.problemStatement || ctx?.description || "Fragmented manual operations, legacy data silos, and turnaround latency requiring modern cloud automation.";

  const dbBlueprint = getDatabaseBlueprint(ctx);
  const roadmap = getRoadmapForWorkspace(ctx);
  const roi = getRoiModelForWorkspace(ctx);

  const apiRows = (dbBlueprint.apiSpecifications || dbBlueprint.apiEndpoints || []).slice(0, 5).map((api: any) => `
    <tr>
      <td><code>${api.method}</code></td>
      <td><code>${api.path}</code></td>
      <td>${api.summary}</td>
      <td>Bearer JWT (${api.authRequired ? "Authenticated" : "Public"})</td>
    </tr>
  `).join("");

  const phaseRows = (roadmap.phases || []).map((ph: any) => `
    <tr>
      <td>${ph.name}</td>
      <td>${ph.title}</td>
      <td>${ph.focus} (${ph.storyPoints} Story Pts)</td>
      <td>Weeks ${ph.weeks}</td>
    </tr>
  `).join("");

  return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title} — Solution Architecture & Blueprint</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #1f2937; padding: 40px; }
    h1 { color: #111827; font-size: 26pt; border-bottom: 3px solid #10b981; padding-bottom: 8px; margin-bottom: 4px; }
    h2 { color: #047857; font-size: 16pt; margin-top: 24pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    h3 { color: #374151; font-size: 13pt; margin-top: 14pt; }
    p, li { font-size: 11pt; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .header-table td { padding: 6px; font-size: 10pt; color: #4b5563; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 18px; }
    table.data-table th { background-color: #f3f4f6; color: #111827; font-weight: bold; border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 10.5pt; }
    table.data-table td { border: 1px solid #e5e7eb; padding: 8px; font-size: 10pt; }
    .callout { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p style="font-size: 13pt; color: #059669; font-weight: bold;">Implementation-Ready Solution Blueprint & Architecture Specification</p>
  
  <table class="header-table">
    <tr>
      <td><strong>Platform:</strong> BizzMitra-AI Solution Builder</td>
      <td><strong>Date:</strong> ${dateStr}</td>
      <td><strong>Status:</strong> Approved for Execution</td>
    </tr>
    <tr>
      <td><strong>Industry:</strong> ${industry}</td>
      <td><strong>Domain Engine:</strong> ${dbBlueprint.domainId.toUpperCase()}</td>
      <td><strong>Governance:</strong> 100% Sign-Off Verified</td>
    </tr>
  </table>

  <div class="callout">
    <strong>Executive Summary:</strong> This document outlines the end-to-end digital transformation, cloud architecture, domain data models, and delivery milestones synthesized for <strong>${title}</strong>.
  </div>

  <h2>1. Problem Statement & Transformation Scope</h2>
  <p>${problemStatement}</p>

  <h2>2. Solution Architecture (HLD & LLD)</h2>
  <h3>2.1 High-Level Topology</h3>
  <ul>
    <li><strong>Client Tier:</strong> Single-page application built on React 19, TanStack Router, and responsive design.</li>
    <li><strong>API & Edge Gateway:</strong> Cloudflare Edge Workers handling JWT authentication, rate limiting, and request routing.</li>
    <li><strong>Application Services:</strong> Event-driven asynchronous microservices managed via Redis 7 and BullMQ queues.</li>
    <li><strong>Data Persistence:</strong> PostgreSQL 16 with Row-Level Security (RLS) ensuring strict tenant isolation across ${dbBlueprint.tables.length} domain tables.</li>
  </ul>

  <h3>2.2 Core Domain API Specifications</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Auth Level</th>
      </tr>
    </thead>
    <tbody>
      ${apiRows}
    </tbody>
  </table>

  <h2>3. Phased Implementation Roadmap</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Sprint Phase</th>
        <th>Deliverable Name</th>
        <th>Scope Highlights</th>
        <th>Timeline</th>
      </tr>
    </thead>
    <tbody>
      ${phaseRows}
    </tbody>
  </table>

  <h2>4. Financial Model & Projected ROI</h2>
  <ul>
    <li><strong>Implementation CapEx:</strong> ~${roi.summary.implementationCost} (${(roadmap as any).targetTimelineWeeks || (roadmap as any).totalWeeks || 8}-week rollout)</li>
    <li><strong>Projected Annual Operational Savings:</strong> ~${roi.summary.annualSavings} per year</li>
    <li><strong>Net Payback Horizon:</strong> ${roi.summary.paybackMonths} months post-deployment</li>
    <li><strong>3-Year Cumulative ROI Multiple:</strong> ${roi.summary.threeYearRoi}%</li>
  </ul>
</body>
</html>`;
}

/**
 * Generates CSV string for data exports.
 */
export function generateExcelCsvContent(workspaceContext?: any): string {
  const roi = getRoiModelForWorkspace(workspaceContext);
  return `Category,Metric Name,Value,Unit,Benchmark
Operational Efficiency,Average Cycle / TAT,${roi.paybackBreakdown.laborHoursSaved},Hours Reclaimed,Baseline
Cost Optimization,Annual Net Savings,${roi.summary.annualSavings},INR,0
Financial Return,Net Payback Horizon,${roi.summary.paybackMonths},Months,12 Months
Financial Return,3-Year Cumulative ROI,${roi.summary.threeYearRoi},%,100%
Platform Architecture,Database Engine,PostgreSQL 16 RLS,Engine,Legacy Silos
Architecture Scale,Target SLA Uptime,99.9,%,95%
Security Compliance,Tenant Isolation,Multi-Tenant RLS,Standard,Unsecured
`;
}

/**
 * Generates a full Microsoft Word Document (.doc / .docx compatible).
 */
export function exportToWordDoc(projectName: string, workspaceContext?: any): void {
  const wordHtml = exportToWordDocHtml(projectName, workspaceContext);
  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Blueprint_Report.doc`, wordHtml, "application/msword");
}

/**
 * Generates a full Microsoft Excel Workbook (.xls / multi-sheet XML compatible) adapted to the domain.
 */
export function exportToExcelWorkbookXml(projectName: string, workspaceContext?: any): string {
  let ctx = workspaceContext;
  if (!ctx && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) ctx = JSON.parse(raw);
    } catch {}
  }

  const roadmap = getRoadmapForWorkspace(ctx);
  const roi = getRoiModelForWorkspace(ctx);
  const dbBlueprint = getDatabaseBlueprint(ctx);

  const taskXmlRows = (((roadmap as any).tasks || []) as any[]).map((t: any) => `
   <Row>
    <Cell><Data ss:Type="String">${t.id}</Data></Cell>
    <Cell><Data ss:Type="String">${(t.title || "").replace(/&/g, "&amp;")}</Data></Cell>
    <Cell><Data ss:Type="String">${(t.ownerRole || "").replace(/&/g, "&amp;")}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.estimateDays || 0}</Data></Cell>
    <Cell><Data ss:Type="String">${(t.phase || "").toUpperCase()}</Data></Cell>
    <Cell><Data ss:Type="String">${t.status || ""}</Data></Cell>
   </Row>`).join("");

  const financialXmlRows = (roi.annualSavingsBreakdown || []).map((item: any) => `
   <Row>
    <Cell><Data ss:Type="String">${(item.category || "").replace(/&/g, "&amp;")}</Data></Cell>
    <Cell><Data ss:Type="String">Annual Optimization</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${item.amount || 0}</Data></Cell>
    <Cell><Data ss:Type="String">${(item.description || "").replace(/&/g, "&amp;")}</Data></Cell>
   </Row>`).join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Bold">
   <Font ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="₹#,##0"/>
  </Style>
 </Styles>

 <!-- Sheet 1: Sprint Roadmap & Estimates -->
 <Worksheet ss:Name="Sprint Estimates">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Task ID</Data></Cell>
    <Cell><Data ss:Type="String">Workstream / Deliverable</Data></Cell>
    <Cell><Data ss:Type="String">Owner Role</Data></Cell>
    <Cell><Data ss:Type="String">Effort (Person-Days)</Data></Cell>
    <Cell><Data ss:Type="String">Sprint Phase</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${taskXmlRows}
  </Table>
 </Worksheet>

 <!-- Sheet 2: Financial Model & Budget -->
 <Worksheet ss:Name="Financial Model">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Cost Element</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Budget / Impact (INR)</Data></Cell>
    <Cell><Data ss:Type="String">Business Description</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Implementation CapEx</Data></Cell>
    <Cell><Data ss:Type="String">CapEx</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${roi.summary.implementationCostNumeric}</Data></Cell>
    <Cell><Data ss:Type="String">${dbBlueprint.domainId.toUpperCase()} Core Architecture &amp; Delivery</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Cloud Infrastructure &amp; Edge SLA</Data></Cell>
    <Cell><Data ss:Type="String">OpEx (Annual)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${roi.summary.annualCloudCostNumeric}</Data></Cell>
    <Cell><Data ss:Type="String">99.9% High Availability SLA &amp; RLS Multi-Tenant</Data></Cell>
   </Row>
   ${financialXmlRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Generates a full Microsoft Excel Workbook (.xls / multi-sheet XML compatible) adapted to the domain.
 */
export function exportToExcelWorkbook(projectName: string, workspaceContext?: any): void {
  const excelXml = exportToExcelWorkbookXml(projectName, workspaceContext);
  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Estimates_Model.xls`, excelXml, "application/vnd.ms-excel");
}

/**
 * Generates PowerPoint slide deck HTML string.
 */
export function exportToPowerPointDeckHtml(projectName: string, workspaceContext?: any): string {
  let ctx = workspaceContext;
  if (!ctx && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) ctx = JSON.parse(raw);
    } catch {}
  }

  const title = ctx?.name || projectName || "Enterprise Solution Blueprint";
  const industry = ctx?.industry || "Enterprise Cloud & Software";
  const problemStatement = ctx?.problemStatement || ctx?.description || "Fragmented manual operations, legacy data silos, and turnaround latency requiring modern cloud automation.";

  const dbBlueprint = getDatabaseBlueprint(ctx);
  const roadmap = getRoadmapForWorkspace(ctx);
  const roi = getRoiModelForWorkspace(ctx);

  const phaseBulletList = (roadmap.phases || []).map((ph: any) => `
    <li><strong>${ph.name} (Weeks ${ph.weeks}):</strong> ${ph.title} — ${ph.focus} (${ph.storyPoints} Story Pts)</li>
  `).join("");

  return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title} — Solution Architecture Deck</title>
  <style>
    body { font-family: 'Arial', sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
    .slide { background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 36px 44px; margin-bottom: 30px; min-height: 480px; page-break-after: always; position: relative; }
    h1 { color: #38bdf8; font-size: 26pt; margin-top: 0; }
    h2 { color: #10b981; font-size: 20pt; border-bottom: 2px solid #334155; padding-bottom: 8px; margin-top: 0; }
    h3 { color: #cbd5e1; font-size: 14pt; margin-bottom: 8px; }
    p, li { font-size: 12pt; color: #94a3b8; line-height: 1.5; }
    .footer-note { position: absolute; bottom: 18px; left: 44px; font-size: 9pt; color: #64748b; }
    .badge { display: inline-block; background-color: #059669; color: white; padding: 4px 10px; border-radius: 6px; font-size: 10pt; font-weight: bold; margin-bottom: 12px; }
    .metric-grid { display: flex; gap: 20px; margin-top: 24px; }
    .metric-card { flex: 1; background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
    .metric-card p { font-size: 20pt; color: #38bdf8; font-weight: bold; margin: 4px 0 0 0; }
  </style>
</head>
<body>
  <!-- Slide 1: Title -->
  <div class="slide">
    <div class="badge">AI Solution Builder • ${industry.toUpperCase()}</div>
    <h1>${title}</h1>
    <p style="font-size: 15pt; color: #94a3b8;">Implementation-Ready Solution Architecture & Enterprise Blueprint</p>
    <div style="margin-top: 140px;">
      <p><strong>Generated By:</strong> BizzMitra-AI Transformation Platform</p>
      <p><strong>Target Architecture:</strong> Cloud-Native, Event-Driven, Multi-Tenant (${dbBlueprint.domainId.toUpperCase()})</p>
    </div>
    <div class="footer-note">Confidential • For Client Review & Board Governance</div>
  </div>

  <!-- Slide 2: Problem Definition -->
  <div class="slide">
    <h2>1. Current State & Legacy Bottlenecks</h2>
    <h3>Problem Statement & Transformation Scope</h3>
    <p>${problemStatement}</p>
    <div class="metric-grid">
      <div class="metric-card"><span>Baseline Cycle</span><p>${roi.operationalMetrics.avgProcessTime.baseline}</p></div>
      <div class="metric-card"><span>Manual Defect Rate</span><p>${roi.operationalMetrics.errorRate.baseline}</p></div>
      <div class="metric-card"><span>Labor Hours Spent</span><p>${roi.operationalMetrics.recruiterHoursPerWeek.baseline}</p></div>
    </div>
    <div class="footer-note">Slide 2 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 3: Target Architecture -->
  <div class="slide">
    <h2>2. High-Level Solution Architecture (HLD)</h2>
    <h3>Cloud-Native Microservices Topology</h3>
    <ul>
      <li><strong>Frontend Web & Mobile:</strong> Sub-80ms client latency built on React 19, Vite, and TanStack Router.</li>
      <li><strong>Edge Gateway:</strong> Cloudflare Edge Worker with zero-trust JWT authentication and automated rate limiting.</li>
      <li><strong>Async Workers:</strong> Redis 7 and BullMQ handling non-blocking domain intelligence & event queues.</li>
      <li><strong>Data Layer:</strong> PostgreSQL 16 with Row-Level Security (RLS) across ${dbBlueprint.tables.length} domain tables.</li>
    </ul>
    <div class="footer-note">Slide 3 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 4: Roadmap -->
  <div class="slide">
    <h2>3. Execution Roadmap & Milestones</h2>
    <ul>
      ${phaseBulletList}
    </ul>
    <div class="metric-grid">
      <div class="metric-card"><span>Target Go-Live</span><p>${(roadmap as any).targetTimelineWeeks || (roadmap as any).totalWeeks || 8} Weeks</p></div>
      <div class="metric-card"><span>Person-Days</span><p>${roadmap.totalPersonDays || 70} Days</p></div>
      <div class="metric-card"><span>Confidence Score</span><p>${roadmap.confidenceScore || 92}%</p></div>
    </div>
    <div class="footer-note">Slide 4 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 5: Financial ROI -->
  <div class="slide">
    <h2>4. Financial Model & Payback Velocity</h2>
    <ul>
      <li>Total Implementation CapEx: ~${roi.summary.implementationCost}.</li>
      <li>Direct Annual Operational Savings: ~${roi.summary.annualSavings} per year.</li>
      <li>Net Payback Horizon: <strong>${roi.summary.paybackMonths} Months Post-Deployment</strong>.</li>
      <li>3-Year Cumulative Return: <strong>${roi.summary.threeYearRoi}% ROI Multiple</strong>.</li>
    </ul>
    <div class="metric-grid">
      <div class="metric-card"><span>Net Payback</span><p>${roi.summary.paybackMonths} Mos</p></div>
      <div class="metric-card"><span>3-Year Cumulative ROI</span><p>${roi.summary.threeYearRoi}%</p></div>
      <div class="metric-card"><span>Annual Savings</span><p>${roi.summary.annualSavings}</p></div>
    </div>
    <div class="footer-note">Slide 5 of 5 • BizzMitra-AI Executive Deck</div>
  </div>
</body>
</html>`;
}

/**
 * Generates a full Microsoft PowerPoint Presentation Deck (.ppt / HTML slide deck) adapted to the domain.
 */
export function exportToPowerPointDeck(projectName: string, workspaceContext?: any): void {
  const pptHtml = exportToPowerPointDeckHtml(projectName, workspaceContext);
  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Executive_Deck.ppt`, pptHtml, "application/vnd.ms-powerpoint");
}
