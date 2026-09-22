/**
 * Universal Multi-Format Document Exporters for Microsoft Word, Microsoft Excel, and Microsoft PowerPoint.
 * Generates standard-compliant Office XML/HTML documents that open natively in MS Office, Google Workspace, and LibreOffice.
 */
import { saveAndShareFile } from "./native-bridge";

/**
 * Downloads a binary or text blob in the browser, or opens system share sheet on native mobile.
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  void saveAndShareFile(filename, content, mimeType);
}

/**
 * Generates Word HTML string.
 */
export function exportToWordDocHtml(projectName: string): string {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${projectName} — Solution Architecture & Blueprint</title>
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
  <h1>${projectName}</h1>
  <p style="font-size: 13pt; color: #059669; font-weight: bold;">Implementation-Ready Solution Blueprint & Architecture Specification</p>
  
  <table class="header-table">
    <tr>
      <td><strong>Platform:</strong> BizzMitra-AI Solution Builder</td>
      <td><strong>Date:</strong> ${dateStr}</td>
      <td><strong>Status:</strong> Approved for Execution</td>
    </tr>
  </table>

  <div class="callout">
    <strong>Executive Summary:</strong> This document outlines the end-to-end digital transformation, cloud architecture, data models, and delivery milestones synthesized by the AI Solution Builder.
  </div>

  <h2>1. Problem Statement & Transformation Scope</h2>
  <p>The client currently relies on manual spreadsheet-driven workflows and fragmented legacy communications, creating significant operational turnaround lag (28 days average cycle) and candidate leakage (28% drop-off). The objective is to replace these isolated silos with an intelligent, cloud-native automated platform.</p>

  <h2>2. Solution Architecture (HLD & LLD)</h2>
  <h3>2.1 High-Level Topology</h3>
  <ul>
    <li><strong>Client Tier:</strong> Single-page application built on React 19, TanStack Router, and Tailwind CSS v4.</li>
    <li><strong>API & Edge Gateway:</strong> Cloudflare Edge Workers handling JWT authentication, rate limiting, and request routing.</li>
    <li><strong>Application Services:</strong> Event-driven asynchronous microservices managed via Redis 7 and BullMQ queues.</li>
    <li><strong>Data Persistence:</strong> PostgreSQL 16 with Row-Level Security (RLS) ensuring strict tenant isolation.</li>
  </ul>

  <h3>2.2 Core API Specifications</h3>
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
      <tr>
        <td><code>POST</code></td>
        <td><code>/api/v1/candidates/ingest</code></td>
        <td>Parses resume document and extracts profile metadata</td>
        <td>Bearer JWT (Editor+)</td>
      </tr>
      <tr>
        <td><code>GET</code></td>
        <td><code>/api/v1/pipeline/stages</code></td>
        <td>Returns real-time Kanban stage telemetry</td>
        <td>Bearer JWT (Viewer+)</td>
      </tr>
      <tr>
        <td><code>POST</code></td>
        <td><code>/api/v1/interviews/schedule</code></td>
        <td>Triggers automated candidate calendar invitations</td>
        <td>Bearer JWT (Editor+)</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Phased Implementation Roadmap</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Sprint</th>
        <th>Deliverable Name</th>
        <th>Scope Highlights</th>
        <th>Timeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Sprint 1-2</td>
        <td>Foundation & Data Ingestion</td>
        <td>PostgreSQL 16 RLS schema, Supabase Auth setup, document parser</td>
        <td>Weeks 1 - 2</td>
      </tr>
      <tr>
        <td>Sprint 3-4</td>
        <td>Workflow Automation</td>
        <td>BullMQ async workers, AI resume extractor, candidate stage triggers</td>
        <td>Weeks 3 - 4</td>
      </tr>
      <tr>
        <td>Sprint 5-6</td>
        <td>Executive Analytics & Launch</td>
        <td>Real-time telemetry, Razorpay billing, and end-to-end UAT</td>
        <td>Weeks 5 - 6</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Financial Model & Projected ROI</h2>
  <ul>
    <li><strong>Implementation CapEx:</strong> ~₹18.5 Lakhs (6-week agile rollout)</li>
    <li><strong>Projected Annual Labor Savings:</strong> ~₹68,400+ per recruiter annually</li>
    <li><strong>Net Payback Horizon:</strong> 4.2 months post deployment</li>
    <li><strong>3-Year Cumulative ROI:</strong> 340% multiple</li>
  </ul>
</body>
</html>`;
}

/**
 * Generates CSV string for data exports.
 */
export function generateExcelCsvContent(): string {
  return `Category,Metric Name,Value,Unit,Benchmark
Operational Efficiency,Average Hiring Cycle Time,9,Days,28 Days
Cost Optimization,Recruiter Labor Reclaimed,3240,Hours / Year,0
Financial Return,Net Payback Horizon,2.4,Months,12 Months
Quality & Accuracy,Candidate Drop-Off Rate,6,%,28%
Platform Architecture,Database Engine,PostgreSQL 16,Engine,Excel Sheets
Architecture Scale,Target SLA Uptime,99.9,%,95%
Security Compliance,Tenant Isolation,RLS Multi-Tenant,Standard,Unsecured
`;
}

/**
 * Generates a full Microsoft Word Document (.doc / .docx compatible).
 */
export function exportToWordDoc(projectName: string): void {
  const wordHtml = exportToWordDocHtml(projectName);
  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Blueprint_Report.doc`, wordHtml, "application/msword");
}


/**
 * Generates a full Microsoft Excel Workbook (.xls / multi-sheet XML compatible).
 */
export function exportToExcelWorkbook(projectName: string): void {
  const excelXml = `<?xml version="1.0"?>
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
   <Row>
    <Cell><Data ss:Type="String">TSK-101</Data></Cell>
    <Cell><Data ss:Type="String">PostgreSQL Multi-Tenant Schema & RLS Setup</Data></Cell>
    <Cell><Data ss:Type="String">Lead Database Architect</Data></Cell>
    <Cell><Data ss:Type="Number">6</Data></Cell>
    <Cell><Data ss:Type="String">Sprint 1</Data></Cell>
    <Cell><Data ss:Type="String">Ready</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">TSK-102</Data></Cell>
    <Cell><Data ss:Type="String">Edge Worker API Gateway & JWT Authentication</Data></Cell>
    <Cell><Data ss:Type="String">Backend Engineer</Data></Cell>
    <Cell><Data ss:Type="Number">5</Data></Cell>
    <Cell><Data ss:Type="String">Sprint 1</Data></Cell>
    <Cell><Data ss:Type="String">Ready</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">TSK-103</Data></Cell>
    <Cell><Data ss:Type="String">Redis BullMQ Async Background Worker Pipeline</Data></Cell>
    <Cell><Data ss:Type="String">DevOps / Cloud Specialist</Data></Cell>
    <Cell><Data ss:Type="Number">8</Data></Cell>
    <Cell><Data ss:Type="String">Sprint 2</Data></Cell>
    <Cell><Data ss:Type="String">Planned</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">TSK-104</Data></Cell>
    <Cell><Data ss:Type="String">React 19 Interactive Kanban & Analytics UI</Data></Cell>
    <Cell><Data ss:Type="String">Frontend Lead</Data></Cell>
    <Cell><Data ss:Type="Number">9</Data></Cell>
    <Cell><Data ss:Type="String">Sprint 2</Data></Cell>
    <Cell><Data ss:Type="String">Planned</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">TSK-105</Data></Cell>
    <Cell><Data ss:Type="String">Razorpay INR Real-time Checkout Integration</Data></Cell>
    <Cell><Data ss:Type="String">Fullstack Engineer</Data></Cell>
    <Cell><Data ss:Type="Number">4</Data></Cell>
    <Cell><Data ss:Type="String">Sprint 3</Data></Cell>
    <Cell><Data ss:Type="String">Planned</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- Sheet 2: Financial Model & Budget -->
 <Worksheet ss:Name="Financial Model">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Cost Element</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Budget (INR)</Data></Cell>
    <Cell><Data ss:Type="String">Expected Annual Benefit</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Software Engineering & Architecture</Data></Cell>
    <Cell><Data ss:Type="String">CapEx</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1250000</Data></Cell>
    <Cell><Data ss:Type="String">Core Automation Engine</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Cloud Infrastructure & Edge Hosting</Data></Cell>
    <Cell><Data ss:Type="String">OpEx (Annual)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">180000</Data></Cell>
    <Cell><Data ss:Type="String">99.9% High Availability SLA</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Recruiter Time Waste Deflected</Data></Cell>
    <Cell><Data ss:Type="String">ROI Benefit</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">684000</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Candidate Leakage Prevented</Data></Cell>
    <Cell><Data ss:Type="String">ROI Benefit</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">450000</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Estimates_Model.xls`, excelXml, "application/vnd.ms-excel");
}

/**
 * Generates a full Microsoft PowerPoint Presentation Deck (.ppt / HTML slide deck).
 */
export function exportToPowerPointDeck(projectName: string): void {
  const pptHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${projectName} — Solution Architecture Deck</title>
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
    <div class="badge">AI Solution Builder • Digital Transformation</div>
    <h1>${projectName}</h1>
    <p style="font-size: 15pt; color: #94a3b8;">Implementation-Ready Solution Architecture & Enterprise Blueprint</p>
    <div style="margin-top: 140px;">
      <p><strong>Generated By:</strong> BizzMitra-AI Transformation Platform</p>
      <p><strong>Target Architecture:</strong> Cloud-Native, Event-Driven, Multi-Tenant</p>
    </div>
    <div class="footer-note">Confidential • For Client Review & Board Governance</div>
  </div>

  <!-- Slide 2: Problem Definition -->
  <div class="slide">
    <h2>1. Current State & Legacy Bottlenecks</h2>
    <h3>As-Is Manual Operations</h3>
    <ul>
      <li>High turn-around time (28 days average cycle) due to spreadsheet data fragmentation.</li>
      <li>28% candidate drop-off rate caused by uncoordinated interview scheduling.</li>
      <li>Lack of real-time telemetry across recruiters and client hiring leads.</li>
    </ul>
    <div class="metric-grid">
      <div class="metric-card"><span>Current TAT</span><p>28 Days</p></div>
      <div class="metric-card"><span>Candidate Drop-off</span><p>28%</p></div>
      <div class="metric-card"><span>Manual Overhead</span><p>65%</p></div>
    </div>
    <div class="footer-note">Slide 2 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 3: Target Architecture -->
  <div class="slide">
    <h2>2. High-Level Solution Architecture (HLD)</h2>
    <h3>Cloud-Native Microservices Topology</h3>
    <ul>
      <li><strong>Frontend Web & Mobile:</strong> Sub-80ms client latency built on React 19 and TanStack Router.</li>
      <li><strong>Edge Gateway:</strong> Cloudflare Worker with zero-trust JWT authentication and automated rate limiting.</li>
      <li><strong>Async AI Workers:</strong> Redis 7 and BullMQ handling non-blocking resume intelligence.</li>
      <li><strong>Data Layer:</strong> PostgreSQL 16 with Row-Level Security (RLS) enforcing strict tenant boundaries.</li>
    </ul>
    <div class="footer-note">Slide 3 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 4: Roadmap -->
  <div class="slide">
    <h2>3. Execution Roadmap & Milestones</h2>
    <ul>
      <li><strong>Phase 1 (Weeks 1-2):</strong> Database Schema, Row-Level Security, Core Auth & Workspace Initialization.</li>
      <li><strong>Phase 2 (Weeks 3-4):</strong> Event-driven asynchronous worker queue and automated resume parsing engine.</li>
      <li><strong>Phase 3 (Weeks 5-6):</strong> Executive analytics dashboard, Razorpay payment gateway, and pilot release.</li>
    </ul>
    <div class="metric-grid">
      <div class="metric-card"><span>Target Go-Live</span><p>6 Weeks</p></div>
      <div class="metric-card"><span>Sprint Velocity</span><p>32 Pts/Sprint</p></div>
      <div class="metric-card"><span>Total Effort</span><p>42 Person-Days</p></div>
    </div>
    <div class="footer-note">Slide 4 of 5 • BizzMitra-AI Executive Deck</div>
  </div>

  <!-- Slide 5: Financial ROI -->
  <div class="slide">
    <h2>4. Financial Model & Payback Velocity</h2>
    <ul>
      <li>Total Implementation CapEx: ~₹18.5 Lakhs.</li>
      <li>Direct Labor Waste Deflected: ~₹68,400+ per recruiter per year.</li>
      <li>Candidate Leakage Recaptured: ~₹4.5 Lakhs in otherwise lost consultancy placement fees.</li>
      <li>Net Payback Horizon: <strong>4.2 Months Post-Deployment</strong> (340% 3-Year ROI).</li>
    </ul>
    <div class="metric-grid">
      <div class="metric-card"><span>Net Payback</span><p>4.2 Mos</p></div>
      <div class="metric-card"><span>3-Year Cumulative ROI</span><p>340%</p></div>
      <div class="metric-card"><span>First-Year Savings</span><p>₹11.3 Lakhs</p></div>
    </div>
    <div class="footer-note">Slide 5 of 5 • BizzMitra-AI Executive Deck</div>
  </div>
</body>
</html>`;

  triggerFileDownload(`${projectName.replace(/\s+/g, "_")}_Executive_Deck.ppt`, pptHtml, "application/vnd.ms-powerpoint");
}
