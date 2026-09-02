import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_WORKSPACE } from "@/lib/demo-data";

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
              <dd className="font-medium">Pro (demo)</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Seats</dt>
              <dd className="font-medium">1 of 1</dd>
            </div>
          </dl>
        </StaggerItem>

        <StaggerItem className="neu p-6">
          <h2 className="font-display text-lg font-bold">Active workspace</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-right font-medium">{DEMO_WORKSPACE.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Industry</dt>
              <dd className="font-medium">{DEMO_WORKSPACE.industry}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Maturity</dt>
              <dd className="font-medium">{DEMO_WORKSPACE.maturity}%</dd>
            </div>
          </dl>
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
