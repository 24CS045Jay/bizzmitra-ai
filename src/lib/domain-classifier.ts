/**
 * Centralized Enterprise Domain Classifier
 * Prevents naive substring collisions (e.g. "available" containing "lab")
 * and provides robust priority classification across all transformation artifacts.
 */

export type DomainCategory =
  | "project_management"
  | "healthcare"
  | "logistics"
  | "solar"
  | "quick_commerce"
  | "fintech"
  | "hr"
  | "ecommerce"
  | "general";

/**
 * Detects Project Management, Task Tracking, Leave Management, and "TaskFlow" domains.
 * Prioritized first to ensure PM / Task / PTO problem statements are never hijacked by other domains.
 */
export function isProjectManagementDomain(text: string): boolean {
  const p = (text || "").toLowerCase();
  return (
    p.includes("taskflow") ||
    p.includes("project manager") ||
    p.includes("task deadline") ||
    p.includes("employee leave") ||
    p.includes("team leave") ||
    p.includes("leave management") ||
    p.includes("assignment block") ||
    p.includes("leave-aware") ||
    (p.includes("task") && (p.includes("leave") || p.includes("deadline") || p.includes("kanban") || p.includes("assignee") || p.includes("project"))) ||
    (/\b(kanban|sprint|scrum|milestone|gantt|backlog)\b/i.test(p) && /\b(task|project|deadline)\b/i.test(p))
  );
}

/**
 * Detects Healthcare, Clinical Diagnostics, Pathology, LIMS, and Patient domains.
 * STRICTLY uses word boundaries and excludes substrings in words like "available", "availability", or "collaborate".
 */
export function isHealthcareDomain(text: string): boolean {
  const p = (text || "").toLowerCase();

  // If this is clearly project management, do not treat as healthcare
  if (isProjectManagementDomain(text)) {
    return false;
  }

  if (
    p.includes("health") ||
    p.includes("clinic") ||
    p.includes("patient") ||
    p.includes("phlebotomy") ||
    p.includes("pathology") ||
    p.includes("diagnostic") ||
    p.includes("hospital") ||
    p.includes("biopsy") ||
    p.includes("lims") ||
    p.includes("fhir") ||
    p.includes("hl7") ||
    p.includes("specimen") ||
    p.includes("blood test") ||
    p.includes("urine test") ||
    p.includes("medical")
  ) {
    return true;
  }

  // Standalone lab/laboratory, explicitly excluding words like available, availability, collaborate
  if (/\b(labs?|laboratory|laboratories)\b/i.test(p) && !/\b(available|availability|collaborat)\b/i.test(p)) {
    return true;
  }

  return false;
}

/**
 * Detects Solar Power, CleanTech, SCADA, and Inverter domains.
 */
export function isSolarDomain(text: string): boolean {
  const p = (text || "").toLowerCase();
  return (
    p.includes("solar") ||
    p.includes("clean tech") ||
    p.includes("cleantech") ||
    p.includes("photovoltaic") ||
    p.includes("inverter") ||
    p.includes("scada") ||
    p.includes("curtailment") ||
    p.includes("sunpower") ||
    p.includes("solarix") ||
    (p.includes("renewable") && p.includes("energy"))
  );
}

/**
 * Detects Logistics, Cold-Chain, Fleet, Cargo, and Telematics domains.
 */
export function isLogisticsDomain(text: string): boolean {
  const p = (text || "").toLowerCase();
  return (
    p.includes("logistics") ||
    p.includes("fleet") ||
    p.includes("truck") ||
    p.includes("dispatch") ||
    p.includes("freight") ||
    p.includes("cargo") ||
    p.includes("cold-chain") ||
    p.includes("cold chain") ||
    p.includes("aerocold") ||
    p.includes("telematics") ||
    p.includes("geofence") ||
    p.includes("supply chain")
  );
}

/**
 * Detects FinTech, Lending, Underwriting, and NBFC domains.
 */
export function isFintechDomain(text: string): boolean {
  const p = (text || "").toLowerCase();
  return (
    p.includes("fintech") ||
    p.includes("lending") ||
    p.includes("loan") ||
    p.includes("underwriting") ||
    p.includes("kyc") ||
    p.includes("nbfc") ||
    p.includes("cibil") ||
    p.includes("credit score")
  );
}

/**
 * Detects HR Consultancy, Staffing, and Talent Recruitment domains.
 */
export function isHRDomain(text: string): boolean {
  const p = (text || "").toLowerCase();
  // If it's TaskFlow / project management, do not route to HR staffing agency
  if (isProjectManagementDomain(text)) {
    return false;
  }
  return (
    p.includes("talentcraft") ||
    p.includes("recruitment") ||
    p.includes("recruiter") ||
    p.includes("staffing") ||
    p.includes("candidate") ||
    p.includes("hr consultancy") ||
    p.includes("headhunting") ||
    p.includes("applicant tracking")
  );
}
