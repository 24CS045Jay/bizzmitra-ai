import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { InteractiveAppSandbox } from "@/components/builder/InteractiveAppSandbox";
import { loadUiCustomization, AppUiCustomization } from "@/lib/builder/ui-customization-store";
import { WorkspaceContextInput, resolveDomainAppModel } from "@/lib/builder/domain-app-generator";

export const Route = createFileRoute("/preview/solution")({
  head: () => ({
    meta: [
      {
        title: "Live Solution Web Application | Powered by BizzMitra AI",
      },
    ],
  }),
  component: StandaloneSolutionPage,
});

function StandaloneSolutionPage() {
  const [context, setContext] = useState<WorkspaceContextInput>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to load workspace context", e);
    }
    return {};
  });

  const [customization, setCustomization] = useState<AppUiCustomization>(() => {
    try {
      return loadUiCustomization();
    } catch (e) {
      return {} as any;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) setContext(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const domain = resolveDomainAppModel(context);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <InteractiveAppSandbox
        appTitle={customization?.appTitle || domain.appTitle}
        customization={customization}
        context={context}
        hideTopBar={true}
        isStandalone={true}
      />
    </div>
  );
}
