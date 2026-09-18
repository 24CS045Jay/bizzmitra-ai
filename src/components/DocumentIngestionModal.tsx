import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { parseBusinessDocument, ParsedDocumentContext } from "@/lib/document-parser";

interface DocumentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyContext: (context: ParsedDocumentContext) => void;
}

export function DocumentIngestionModal({
  isOpen,
  onClose,
  onApplyContext,
}: DocumentIngestionModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedDocumentContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleFile(file: File) {
    setIsProcessing(true);
    setProcessingStage("Scanning binary stream & extracting textual tokens...");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStage("Parsing business domain, SOP/BRD structure & objectives...");
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStage("Synthesizing architecture scope and technology recommendations...");
      const result = await parseBusinessDocument(file);
      await new Promise((r) => setTimeout(r, 500));
      setParsedData(result);
      toast.success(`Successfully parsed "${file.name}"!`);
    } catch (err: any) {
      toast.error(`Failed to parse file: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleApply() {
    if (!parsedData) return;
    onApplyContext(parsedData);
    toast.success("Document context successfully applied to Blueprint Studio!");
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Business Document Ingestion
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload SOPs, BRDs, PDFs, Word documents or PPTs to extract business context automatically.
              </p>
            </div>
          </div>

          {/* Supported Format Pills */}
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-medium text-muted-foreground">
            {["SOP (.pdf/.docx)", "BRD (.pdf/.docx)", "PowerPoint (.pptx)", "Text / Markdown", "Excel / CSV"].map(
              (pill) => (
                <span
                  key={pill}
                  className="rounded-md border border-border/60 bg-surface/80 px-2 py-0.5"
                >
                  {pill}
                </span>
              ),
            )}
          </div>

          {/* Drag & Drop Zone */}
          {!parsedData && !isProcessing && (
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    void handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                <FileText className="size-6" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Click to browse or drag & drop your business document
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supported: PDF, Word (.docx), PowerPoint (.pptx), Markdown, CSV, TXT (up to 25MB)
              </p>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-8 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-foreground">Analyzing Document Content</p>
              <p className="text-xs text-primary font-mono animate-pulse">{processingStage}</p>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedData && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Successfully Extracted: {parsedData.fileName} ({parsedData.fileSizeFormatted})
                    </span>
                  </div>
                  <button
                    onClick={() => setParsedData(null)}
                    className="text-xs underline text-muted-foreground hover:text-foreground"
                  >
                    Upload another
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Inferred Title: </span>
                    <span className="text-muted-foreground">{parsedData.inferredTitle}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Identified Context: </span>
                    <span className="text-muted-foreground">{parsedData.businessContext}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Extracted Bottlenecks: </span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-muted-foreground">
                      {parsedData.currentBottlenecks.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Suggested Tech Stack: </span>
                    <span className="text-muted-foreground font-mono">
                      {parsedData.suggestedStack.join(" • ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm glow-primary hover:opacity-90 active:scale-95"
                >
                  <Sparkles className="size-3.5" />
                  Apply Context to Blueprint Studio
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
