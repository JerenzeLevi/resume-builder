"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResumeEditor } from "@/components/resume/editor";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStorage } from "@/lib/use-resume-storage";
import { blankResume, sampleResume, wordCount } from "@/lib/resume-types";
import { parsePdfToResume } from "@/lib/pdf-import";
import { FileDown, FileUp, Printer, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function timeAgo(ts: number | null) {
  if (!ts) return "not saved yet";
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (secs < 2) return "saved just now";
  if (secs < 60) return `saved ${secs}s ago`;
  return `saved ${Math.round(secs / 60)}m ago`;
}

export default function Home() {
  const { data, setData, reset, loaded, savedAt } = useResumeStorage();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function importPdf(file: File) {
    setImporting(true);
    try {
      const parsed = await parsePdfToResume(file);
      reset(parsed);
      toast.success("Imported from PDF — please review, extraction is best-effort");
    } catch {
      toast.error("Couldn't read that PDF — try a text-based (not scanned) resume PDF");
    } finally {
      setImporting(false);
    }
  }

  async function downloadPdf() {
    const node = document.getElementById("resume-preview");
    if (!node) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = data.personal.name
        ? `${data.personal.name.trim().replace(/\s+/g, "-")}-resume.pdf`
        : "resume.pdf";
      pdf.save(fileName);
    } catch {
      toast.error("Couldn't generate PDF — try Print instead");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-ink/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <p className="font-heading text-xl italic tracking-tight text-foreground">
              Resume Creator
            </p>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
              — proof shop for your career
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-1 flex rounded-md border border-border p-0.5 lg:hidden">
              <button
                onClick={() => setView("edit")}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  view === "edit" ? "bg-brass text-ink" : "text-muted-foreground"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setView("preview")}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  view === "preview" ? "bg-brass text-ink" : "text-muted-foreground"
                }`}
              >
                Preview
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) importPdf(file);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="size-4" />
              <span className="hidden sm:inline">{importing ? "Importing…" : "Import PDF"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                reset(sampleResume);
                toast.success("Loaded sample resume");
              }}
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Load sample</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                reset(blankResume());
                toast("Cleared — starting fresh");
              }}
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-brass text-ink hover:bg-brass-soft"
              disabled={downloading}
              onClick={downloadPdf}
            >
              <FileDown className="size-4" />
              {downloading ? "Preparing…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      {loaded && (
        <main className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-10">
          <div className={`${view === "edit" ? "block" : "hidden"} lg:block print:hidden`}>
            <ResumeEditor data={data} setData={setData} />
          </div>
          <div className={`${view === "preview" ? "block" : "hidden"} lg:block print:block`}>
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto print:static print:max-h-none print:overflow-visible">
              <div className="crop-marks mx-auto w-full max-w-[8.5in] print:mx-0 print:max-w-none">
                <span className="crop-tl" aria-hidden />
                <span className="crop-br" aria-hidden />
                <ResumePreview data={data} />
              </div>
              <div className="mx-auto mt-3 flex max-w-[8.5in] items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground print:hidden">
                <span>proof · {wordCount(data)} words</span>
                <span>{timeAgo(savedAt)}</span>
              </div>
            </div>
          </div>
        </main>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}
