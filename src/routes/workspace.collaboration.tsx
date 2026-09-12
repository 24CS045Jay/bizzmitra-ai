import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Filter,
  GitPullRequest,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  ApprovalStatus,
  ApproverSignOff,
  ArtifactComment,
  AuditLogEntry,
  CollaborationWorkspaceState,
  loadCollaborationState,
  saveCollaborationState,
} from "@/lib/collaboration-data";

export const Route = createFileRoute("/workspace/collaboration")({
  head: () => ({
    meta: [
      { title: "Governance, Approvals & Collaboration — BizzMitra-AI" },
      {
        name: "description",
        content: "Multi-stakeholder review workflows, in-context artifact comments, and immutable audit logs.",
      },
      { property: "og:title", content: "Governance, Approvals & Collaboration — BizzMitra-AI" },
      { property: "og:description", content: "Enterprise review, approval sign-offs and activity audit trail." },
    ],
  }),
  component: CollaborationPage,
});

export function CollaborationPage() {
  const [collabState, setCollabState] = useState<CollaborationWorkspaceState>(loadCollaborationState);
  const [commentFilter, setCommentFilter] = useState<"all" | "open" | "resolved">("all");
  const [auditFilter, setAuditFilter] = useState<"all" | "governance" | "ai_generation" | "schema" | "collaboration">("all");

  // New Comment Form State
  const [newCommentArtifact, setNewCommentArtifact] = useState("data");
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentSeverity, setNewCommentSeverity] = useState<"feedback" | "blocking" | "approved">("feedback");

  // Reply State
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const workspaceContext = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("bizzmitra.workspaceContext");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const scenarioName = workspaceContext?.name ?? "TalentCraft HR Consultancy";

  const handleStatusChange = (newStatus: ApprovalStatus) => {
    const updated: CollaborationWorkspaceState = {
      ...collabState,
      overallStatus: newStatus,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actor: { name: "Param Shah", type: "user", role: "Transformation Lead" },
          action: `Changed Governance Status to ${newStatus.toUpperCase()}`,
          category: "governance",
          details: `Updated workspace lifecycle state to ${newStatus}.`,
          timestamp: "Just now",
        },
        ...collabState.auditLogs,
      ],
    };
    setCollabState(updated);
    saveCollaborationState(updated);
    toast.success(`Workflow status updated to ${newStatus.toUpperCase()}`);
  };

  const handleToggleSignOff = (role: ApproverSignOff["role"]) => {
    const updatedSignOffs = collabState.signOffs.map((s) => {
      if (s.role === role) {
        const nextSigned = !s.signed;
        return {
          ...s,
          signed: nextSigned,
          signedAt: nextSigned ? "Just now" : undefined,
        };
      }
      return s;
    });

    const updated: CollaborationWorkspaceState = {
      ...collabState,
      signOffs: updatedSignOffs,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actor: { name: "Param Shah", type: "user", role: role },
          action: `Toggled Sign-Off for ${role}`,
          category: "governance",
          details: `Sign-off state updated for ${role}.`,
          timestamp: "Just now",
        },
        ...collabState.auditLogs,
      ],
    };
    setCollabState(updated);
    saveCollaborationState(updated);
    toast.success(`Updated sign-off for ${role}`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const artifactNameMap: Record<string, string> = {
      data: "Database Designer & REST APIs",
      roadmap: "AI Implementation Planning Engine",
      roi: "Financial ROI & Transformation Cockpit",
      architecture: "Architecture (HLD / LLD)",
      crm: "Workable HR CRM",
      process: "Process Intelligence (BPMN)",
    };

    const newComment: ArtifactComment = {
      id: `c-${Date.now()}`,
      artifactId: newCommentArtifact,
      artifactName: artifactNameMap[newCommentArtifact] ?? "General Blueprint",
      author: {
        name: "Param Shah",
        role: "Transformation Lead",
      },
      content: newCommentText.trim(),
      timestamp: "Just now",
      severity: newCommentSeverity,
      resolved: false,
    };

    const updated: CollaborationWorkspaceState = {
      ...collabState,
      comments: [newComment, ...collabState.comments],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actor: { name: "Param Shah", type: "user", role: "Transformation Lead" },
          action: "Posted In-Context Comment",
          category: "collaboration",
          details: `Commented on ${newComment.artifactName}: "${newCommentText.trim().substring(0, 45)}..."`,
          timestamp: "Just now",
        },
        ...collabState.auditLogs,
      ],
    };

    setCollabState(updated);
    saveCollaborationState(updated);
    setNewCommentText("");
    toast.success("Comment added to artifact review thread!");
  };

  const handleToggleResolve = (commentId: string) => {
    const updatedComments = collabState.comments.map((c) => {
      if (c.id === commentId) {
        const nextResolved = !c.resolved;
        return { ...c, resolved: nextResolved };
      }
      return c;
    });

    const updated: CollaborationWorkspaceState = {
      ...collabState,
      comments: updatedComments,
    };
    setCollabState(updated);
    saveCollaborationState(updated);
    toast.success("Comment status updated");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const updatedComments = collabState.comments.map((c) => {
      if (c.id === commentId) {
        const replies = c.replies ?? [];
        return {
          ...c,
          replies: [
            ...replies,
            {
              id: `r-${Date.now()}`,
              authorName: "Param Shah",
              authorRole: "Transformation Lead",
              content: replyText.trim(),
              timestamp: "Just now",
            },
          ],
        };
      }
      return c;
    });

    const updated: CollaborationWorkspaceState = {
      ...collabState,
      comments: updatedComments,
    };
    setCollabState(updated);
    saveCollaborationState(updated);
    setReplyingCommentId(null);
    setReplyText("");
    toast.success("Reply added to thread");
  };

  const filteredComments = useMemo(() => {
    if (commentFilter === "open") return collabState.comments.filter((c) => !c.resolved);
    if (commentFilter === "resolved") return collabState.comments.filter((c) => c.resolved);
    return collabState.comments;
  }, [commentFilter, collabState.comments]);

  const filteredAuditLogs = useMemo(() => {
    if (auditFilter === "all") return collabState.auditLogs;
    return collabState.auditLogs.filter((l) => l.category === auditFilter);
  }, [auditFilter, collabState.auditLogs]);

  const signedCount = collabState.signOffs.filter((s) => s.signed).length;
  const allSigned = signedCount === collabState.signOffs.length;

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Top Header Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Users className="size-3.5" />
                  Enterprise Collaboration & Governance Hub
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    collabState.overallStatus === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : collabState.overallStatus === "in_review"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {collabState.overallStatus.replace("_", " ")}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Governance, Review & Stakeholder Sign-Off
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Review formal sign-offs, comment threads across all 11 transformation artifacts, and inspect the immutable activity audit log for <strong>{scenarioName}</strong>.
              </p>
            </div>

            {/* Workflow Transition Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("draft")}
                className={`neu-sm neu-press px-3 py-2 text-xs font-semibold ${
                  collabState.overallStatus === "draft" ? "ring-1 ring-primary text-primary" : ""
                }`}
              >
                Mark Draft
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("in_review")}
                className={`neu-sm neu-press px-3 py-2 text-xs font-semibold ${
                  collabState.overallStatus === "in_review" ? "ring-1 ring-amber-500 text-amber-600" : ""
                }`}
              >
                Submit for Review
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("approved")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition ${
                  collabState.overallStatus === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:opacity-90"
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                Approve Blueprint
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6 sm:grid-cols-4">
            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <UserCheck className="size-3.5 text-primary" />
                Sign-Off Progress
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {signedCount} / {collabState.signOffs.length} Approvals
              </p>
              <p className="text-[11px] text-muted-foreground">
                {allSigned ? "100% Signed off" : "Pending reviews"}
              </p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <MessageSquare className="size-3.5 text-blue-500" />
                Review Comments
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {collabState.comments.length} Threads
              </p>
              <p className="text-[11px] text-muted-foreground">
                {collabState.comments.filter((c) => !c.resolved).length} Unresolved
              </p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <FileCheck2 className="size-3.5 text-emerald-500" />
                Audit Trail Entries
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {collabState.auditLogs.length} Events
              </p>
              <p className="text-[11px] text-muted-foreground">Immutable history</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-amber-500" />
                Governance Compliance
              </div>
              <p className="mt-1 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Verified
              </p>
              <p className="text-[11px] text-muted-foreground">DPDP Act aligned</p>
            </div>
          </div>
        </Reveal>

        {/* Approver Sign-Off Matrix */}
        <Reveal className="neu p-6 md:p-8 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Stakeholder Sign-Off Matrix</h2>
              <p className="text-xs text-muted-foreground">
                Cross-functional approval required before production kickoff.
              </p>
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {allSigned ? "✓ All Stakeholders Approved" : "Awaiting Pending Signatures"}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collabState.signOffs.map((signOff) => (
              <div
                key={signOff.role}
                className={`neu-inset p-4 space-y-3 flex flex-col justify-between ${
                  signOff.signed ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">{signOff.role}</span>
                    <span
                      className={`size-2 rounded-full ${
                        signOff.signed ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs font-semibold">{signOff.name}</p>
                  <p className="text-[10px] text-muted-foreground">{signOff.email}</p>

                  {signOff.comments && (
                    <p className="mt-2 text-[11px] text-muted-foreground italic leading-snug rounded bg-background/50 p-2">
                      "{signOff.comments}"
                    </p>
                  )}
                </div>

                <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {signOff.signed ? signOff.signedAt : "Pending sign-off"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleSignOff(signOff.role)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {signOff.signed ? "Revoke" : "Sign Off"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Main 2-Col Grid: In-Context Comments (Left 7 cols) & Audit Log (Right 5 cols) */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: In-Context Comments */}
          <div className="space-y-6 lg:col-span-7">
            <Reveal className="neu p-6 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="font-display text-base font-bold">Artifact Review Comments</h3>
                  <p className="text-xs text-muted-foreground">
                    Threaded feedback pinned to specific transformation deliverables.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5">
                  {(["all", "open", "resolved"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCommentFilter(tab)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                        commentFilter === tab
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "neu-sm hover:text-primary"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="rounded-xl border border-border/40 p-4 space-y-3 bg-muted/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold flex items-center gap-1 text-primary">
                    <MessageSquarePlus className="size-3.5" />
                    New Review Comment
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={newCommentArtifact}
                      onChange={(e) => setNewCommentArtifact(e.target.value)}
                      className="neu-inset px-2.5 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="data">Database & REST APIs</option>
                      <option value="roadmap">Implementation Roadmap</option>
                      <option value="roi">Financial ROI Cockpit</option>
                      <option value="architecture">Architecture (HLD/LLD)</option>
                      <option value="crm">Workable HR CRM</option>
                      <option value="process">Process Intelligence (BPMN)</option>
                    </select>

                    <select
                      value={newCommentSeverity}
                      onChange={(e) => setNewCommentSeverity(e.target.value as any)}
                      className="neu-inset px-2.5 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="feedback">Feedback</option>
                      <option value="blocking">Blocking Issue</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Type your feedback or question regarding this artifact..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="neu-inset w-full p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Send className="size-3" />
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments Thread List */}
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="neu-inset p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {comment.author.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{comment.author.name}</span>
                            <span className="text-[10px] text-muted-foreground">({comment.author.role})</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{comment.timestamp}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            comment.severity === "blocking"
                              ? "bg-red-500/10 text-red-500"
                              : comment.severity === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {comment.severity}
                        </span>
                        <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                          {comment.artifactName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="space-y-2 border-l-2 border-primary/30 pl-3 pt-1">
                        {comment.replies.map((rep) => (
                          <div key={rep.id} className="rounded bg-background/50 p-2 text-xs space-y-0.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-primary">{rep.authorName} ({rep.authorRole})</span>
                              <span className="text-muted-foreground">{rep.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Actions Footer */}
                    <div className="border-t border-border/30 pt-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleResolve(comment.id)}
                        className={`font-semibold flex items-center gap-1 text-[11px] ${
                          comment.resolved ? "text-emerald-600 hover:underline" : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <CheckCircle2 className="size-3.5" />
                        {comment.resolved ? "Resolved" : "Mark as Resolved"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id)}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        {replyingCommentId === comment.id ? "Cancel" : "Reply"}
                      </button>
                    </div>

                    {/* Reply Input Box */}
                    {replyingCommentId === comment.id && (
                      <div className="mt-2 flex gap-2 pt-2 border-t border-border/20">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="neu-inset flex-1 px-3 py-1.5 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: Activity Audit Log */}
          <div className="space-y-6 lg:col-span-5">
            <Reveal className="neu p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold">Activity Audit Log</h3>
                  <p className="text-xs text-muted-foreground">
                    Chronological immutable ledger of user & AI actions.
                  </p>
                </div>
              </div>

              {/* Audit Category Filter */}
              <div className="flex flex-wrap gap-1">
                {(["all", "governance", "ai_generation", "schema", "collaboration"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAuditFilter(cat)}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold capitalize transition ${
                      auditFilter === cat ? "bg-primary text-primary-foreground" : "neu-sm hover:text-primary"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Log Timeline */}
              <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
                {filteredAuditLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border/40 p-3 text-xs space-y-1 bg-card/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground leading-snug">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{log.details}</p>
                    <div className="flex items-center justify-between border-t border-border/20 pt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span
                          className={`size-1.5 rounded-full ${
                            log.actor.type === "ai"
                              ? "bg-primary"
                              : log.actor.type === "user"
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                          }`}
                        />
                        {log.actor.name}
                      </span>
                      <span className="capitalize text-primary/80 font-mono">{log.category.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
