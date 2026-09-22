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
import { CountUp, Reveal } from "@/components/motion/primitives";
import {
  ApprovalStatus,
  ApproverSignOff,
  ArtifactComment,
  AuditLogEntry,
  CollaborationWorkspaceState,
  getCollaborationStateForWorkspace,
  loadCollaborationState,
  saveCollaborationState,
} from "@/lib/collaboration-data";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";

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
  useStageGate("collaboration");
  const [workspaceContext, setWorkspaceContext] = useState<{
    id?: string;
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        setWorkspaceContext(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const [collabState, setCollabState] = useState<CollaborationWorkspaceState>(() => loadCollaborationState(workspaceContext));

  // Sync state if active workspace context updates
  useEffect(() => {
    setCollabState(loadCollaborationState(workspaceContext));
  }, [workspaceContext?.businessName, workspaceContext?.name]);

  const [commentFilter, setCommentFilter] = useState<"all" | "open" | "resolved">("all");
  const [auditFilter, setAuditFilter] = useState<"all" | "governance" | "ai_generation" | "schema" | "collaboration">("all");

  // New Comment Form State
  const [newCommentArtifact, setNewCommentArtifact] = useState("data");
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentSeverity, setNewCommentSeverity] = useState<"feedback" | "blocking" | "approved">("feedback");

  // Reply State
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const scenarioName = workspaceContext?.businessName || workspaceContext?.name || collabState.scenarioName || "Active Workspace";

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

  const handleToggleSignOff = (role: string) => {
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
      data: "Database & APIs",
      roadmap: "Delivery Roadmap & Sprint Plan",
      roi: "Financial ROI & Readiness Engine",
      architecture: "Technical Architecture (HLD / LLD)",
      crm: "Operational Cockpit & Customizer",
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
      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Governance Context:</span>
          <span className="font-bold text-foreground">
            {scenarioName}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext?.industry || "Enterprise Workspace"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/workspace/roadmap" className="font-medium text-muted-foreground hover:text-primary transition-colors">
            Roadmap →
          </Link>
          <Link to="/workspace/export" className="font-medium text-primary hover:underline">
            Export Center →
          </Link>
        </div>
      </div>

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
                Review formal sign-offs, comment threads across all transformation artifacts, and inspect the immutable activity audit log for <strong>{scenarioName}</strong>.
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
              <p className="text-[11px] text-muted-foreground">SOC2 / Zero-Trust compliant</p>
            </div>
          </div>
        </Reveal>

        {/* Stakeholder Sign-Off Workstream */}
        <Reveal className="neu p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Cross-Functional Stakeholder Sign-Offs</h2>
              <p className="text-xs text-muted-foreground">
                All 4 lead roles must sign off before deployment to production environments.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">
              {signedCount} of {collabState.signOffs.length} Approved
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {collabState.signOffs.map((signOff) => (
              <div
                key={signOff.role}
                className={`neu-inset p-5 space-y-3 transition ${
                  signOff.signed ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {signOff.role}
                    </span>
                    <h3 className="text-sm font-bold mt-0.5">{signOff.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{signOff.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSignOff(signOff.role)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      signOff.signed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        : "neu-sm neu-press text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {signOff.signed ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Signed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="size-3.5 text-amber-500" />
                        <span>Sign Off</span>
                      </>
                    )}
                  </button>
                </div>

                {signOff.comments && (
                  <p className="text-xs text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-lg">
                    "{signOff.comments}"
                  </p>
                )}

                {signOff.signedAt && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Signed: {signOff.signedAt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* In-Context Review Comments */}
        <Reveal className="neu p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">In-Context Artifact Review Threads</h2>
              <p className="text-xs text-muted-foreground">
                Collaborative notes and feedback pinned to technical blueprints.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["all", "open", "resolved"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setCommentFilter(filter)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                    commentFilter === filter ? "bg-primary text-primary-foreground shadow-sm" : "neu-sm hover:text-primary"
                  }`}
                >
                  {filter} ({filter === "all" ? collabState.comments.length : collabState.comments.filter((c) => filter === "open" ? !c.resolved : c.resolved).length})
                </button>
              ))}
            </div>
          </div>

          {/* New Comment Creator Box */}
          <form onSubmit={handleAddComment} className="rounded-xl border border-border/40 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <MessageSquarePlus className="size-4 text-primary" />
              <span>Leave In-Context Blueprint Feedback</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Target Artifact</label>
                <select
                  value={newCommentArtifact}
                  onChange={(e) => setNewCommentArtifact(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/50 bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="data">Database & REST APIs</option>
                  <option value="roadmap">Implementation Roadmap</option>
                  <option value="roi">Financial ROI Cockpit</option>
                  <option value="architecture">Architecture (HLD / LLD)</option>
                  <option value="crm">Operational Cockpit</option>
                  <option value="process">Process Intelligence (BPMN)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Severity</label>
                <select
                  value={newCommentSeverity}
                  onChange={(e) => setNewCommentSeverity(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-border/50 bg-background p-2 text-xs outline-none focus:border-primary"
                >
                  <option value="feedback">Feedback / Suggestion</option>
                  <option value="blocking">Blocking Issue (Must Fix)</option>
                  <option value="approved">Approved & Verified</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Type in-context observation, requirement change, or feedback..."
              className="w-full rounded-lg border border-border/50 bg-background p-2.5 text-xs outline-none focus:border-primary"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="size-3" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          {/* Comment Threads List */}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`neu-inset p-4 space-y-3 transition ${
                  comment.resolved ? "opacity-75" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{comment.author.name}</span>
                    <span className="text-[10px] text-muted-foreground">({comment.author.role})</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {comment.artifactName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        comment.severity === "blocking"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : comment.severity === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {comment.severity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleResolve(comment.id)}
                      className={`text-[11px] font-semibold hover:underline ${
                        comment.resolved ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {comment.resolved ? "Re-open" : "Mark Resolved"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground leading-relaxed">{comment.content}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-primary/30 space-y-2 pt-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <span>{reply.authorName}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">({reply.authorRole})</span>
                          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{reply.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingCommentId === comment.id ? (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type reply..."
                      className="flex-1 rounded-lg border border-border/50 bg-background p-2 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReply(comment.id)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingCommentId(null)}
                      className="text-xs text-muted-foreground hover:underline px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyingCommentId(comment.id)}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Reply to thread
                  </button>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Activity Audit Log */}
        <Reveal className="neu p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Immutable Transformation Audit Trail</h2>
              <p className="text-xs text-muted-foreground">
                Tamper-evident log of all AI synthesis, governance transitions, and architecture modifications.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["all", "governance", "ai_generation", "schema", "collaboration"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAuditFilter(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    auditFilter === cat ? "bg-primary text-primary-foreground shadow-sm" : "neu-sm hover:text-primary"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border/20">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{log.actor.name}</span>
                    <span className="rounded bg-accent px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                      {log.actor.role}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{log.action}</p>
                  <p className="text-[11px] text-muted-foreground">{log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pt-1">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <StageNextButton currentStageId="collaboration" label="Proceed to Universal Export Center" />
      </div>
    </AppShell>
  );
}
