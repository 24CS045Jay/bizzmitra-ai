// Persistent Reactive Data Layer for Solution Portal
export interface WorkItem {
  id: string;
  title: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Intake" | "In Progress" | "Review" | "Completed";
  assignee: string;
  impactScore: number;
  slaDays: number;
  createdAt: string;
}

const STORAGE_KEY = "bizzmitra_solution_portal_v2";

const INITIAL_DATA: WorkItem[] = [
  {
    id: "WO-101",
    title: "Automated Client Onboarding & KYC Pipeline",
    category: "Digital Operations",
    priority: "Critical",
    status: "In Progress",
    assignee: "Aarav Sharma (Lead)",
    impactScore: 96,
    slaDays: 2,
    createdAt: "2026-09-24",
  },
  {
    id: "WO-102",
    title: "Multi-Tenant Document Verification Gateway",
    category: "Compliance & Governance",
    priority: "High",
    status: "Review",
    assignee: "Priya Iyer (Security)",
    impactScore: 92,
    slaDays: 1,
    createdAt: "2026-09-23",
  },
  {
    id: "WO-103",
    title: "Real-Time Telemetry & SLA Breach Predictor",
    category: "Analytics & AI",
    priority: "High",
    status: "Completed",
    assignee: "Sneha Kulkarni (ML)",
    impactScore: 98,
    slaDays: 0,
    createdAt: "2026-09-22",
  },
  {
    id: "WO-104",
    title: "Executive KPI Reporting & ROI Aggregator",
    category: "Transformation",
    priority: "Medium",
    status: "Intake",
    assignee: "Rohan Deshmukh (Product)",
    impactScore: 89,
    slaDays: 4,
    createdAt: "2026-09-25",
  },
  {
    id: "WO-105",
    title: "Automated Billing & Stakeholder Settlement Node",
    category: "Finance Integration",
    priority: "Medium",
    status: "In Progress",
    assignee: "Vikram Mehta (Architect)",
    impactScore: 94,
    slaDays: 3,
    createdAt: "2026-09-24",
  },
];

export function getStoredWorkItems(): WorkItem[] {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load items", e);
  }
  return INITIAL_DATA;
}

export function saveWorkItems(items: WorkItem[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error("Failed to save items", e);
  }
}
