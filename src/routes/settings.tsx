import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BizzMitra-AI" },
      { name: "description", content: "Manage your BizzMitra-AI profile, workspace defaults and export preferences." },
      { property: "og:title", content: "Settings — BizzMitra-AI" },
      { property: "og:description", content: "Profile, workspace defaults and export preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("free");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    maturity_score: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;
    async function loadSettings() {
      const [{ data: profile }, workspaceResult] = await Promise.all([
        supabase.from("profiles").select("full_name, plan").eq("id", currentUserId).single(),
        supabase
          .from("workspaces")
          .select("id, name, maturity_score")
          .eq("id", window.localStorage.getItem("bizzmitra.activeWorkspaceId") ?? "")
          .maybeSingle(),
      ]);
      setFullName(profile?.full_name ?? "");
      setPlan(profile?.plan ?? "free");
      setWorkspace(workspaceResult.data);
      setWorkspaceName(workspaceResult.data?.name ?? "");
    }
    void loadSettings();
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function renameWorkspace() {
    if (!workspace || !workspaceName.trim()) return;
    const { error } = await supabase
      .from("workspaces")
      .update({ name: workspaceName.trim() })
      .eq("id", workspace.id);
    if (error) toast.error(error.message);
    else {
      setWorkspace({ ...workspace, name: workspaceName.trim() });
      toast.success("Workspace renamed");
    }
  }

  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Settings</h1>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 lg:grid-cols-2">
        <StaggerItem className="neu p-6">
          <h2 className="font-display text-lg font-bold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">{plan}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Seats</dt>
              <dd className="font-medium">1 of 1</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-2">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              className="neu-inset min-w-0 flex-1 px-3 py-2 text-sm outline-none"
            />
            <button onClick={saveProfile} className="neu-sm neu-press px-3 py-2 text-xs font-semibold">
              Save
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6">
          <h2 className="font-display text-lg font-bold">Active workspace</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Maturity</dt>
              <dd className="font-medium">{workspace?.maturity_score ?? 0}%</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-2">
            <input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              className="neu-inset min-w-0 flex-1 px-3 py-2 text-sm outline-none"
            />
            <button onClick={renameWorkspace} className="neu-sm neu-press px-3 py-2 text-xs font-semibold">
              Rename
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Appearance & Theme</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch between Warm Graphite (light) and Ambient Ray (dark) modes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                theme === "light"
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "neu-sm neu-press text-muted-foreground hover:text-foreground",
              )}
            >
              <Sun className="size-4" /> Light (Warm Graphite)
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                theme === "dark"
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "neu-sm neu-press text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="size-4" /> Dark (Ambient Ray)
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Export defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Applied when you export any artifact from the chain.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["PDF blueprint", "Word document", "PowerPoint deck", "Mermaid source"].map((f, i) => (
              <span
                key={f}
                className={
                  i === 0
                    ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "neu-sm px-3 py-1.5 text-xs font-medium"
                }
              >
                {f}
              </span>
            ))}
          </div>
        </StaggerItem>
      </Stagger>
    </AppShell>
  );
}
