import React, { useState } from "react";
import {
  FileCode,
  FolderTree,
  Copy,
  Check,
  Download,
  FileJson,
  FileType,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VirtualCodeExplorerProps {
  files: Record<string, string>;
  projectName?: string;
  onDownloadZip?: () => void;
}

export function VirtualCodeExplorer({
  files,
  projectName = "bizzmitra-app",
  onDownloadZip,
}: VirtualCodeExplorerProps) {
  const filePaths = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState<string>(
    filePaths.includes("src/App.tsx") ? "src/App.tsx" : filePaths[0] || "package.json"
  );
  const [copied, setCopied] = useState(false);

  const activeContent = files[selectedFile] || "";
  const lineCount = activeContent.split("\n").length;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    toast.success(`Copied ${selectedFile} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".json")) return <FileJson className="size-3.5 text-amber-400" />;
    if (path.endsWith(".tsx") || path.endsWith(".ts"))
      return <FileCode className="size-3.5 text-indigo-400" />;
    if (path.endsWith(".html")) return <FileType className="size-3.5 text-rose-400" />;
    if (path.endsWith(".css")) return <FileType className="size-3.5 text-cyan-400" />;
    if (path.endsWith(".md")) return <FileCode className="size-3.5 text-emerald-400" />;
    return <FileCode className="size-3.5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col md:flex-row h-full rounded-2xl border border-border/80 bg-slate-950 overflow-hidden shadow-2xl text-slate-200">
      {/* File Tree Left Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/60 bg-slate-900/60 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-2 py-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
              <FolderTree className="size-3.5 text-indigo-400" />
              <span>Project Files</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {filePaths.length} files
            </span>
          </div>

          <div className="space-y-0.5 overflow-y-auto max-h-[350px] md:max-h-[520px]">
            {filePaths.map((path) => (
              <button
                key={path}
                onClick={() => setSelectedFile(path)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition text-left cursor-pointer",
                  selectedFile === path
                    ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(path)}
                  <span className="truncate">{path}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {onDownloadZip && (
          <div className="pt-3 border-t border-border/50 mt-2">
            <button
              onClick={onDownloadZip}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 px-3 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Download className="size-3.5" />
              Download .ZIP
            </button>
          </div>
        )}
      </div>

      {/* Code Viewer Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Editor Tab Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon(selectedFile)}
            <span className="text-xs font-mono font-bold text-white truncate">{selectedFile}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ({lineCount} lines)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              <span>{copied ? "Copied!" : "Copy File"}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/80">
          <pre className="whitespace-pre">
            <code>
              {activeContent.split("\n").map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
