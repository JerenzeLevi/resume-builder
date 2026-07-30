"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResumeEditor } from "@/components/resume/editor";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStorage } from "@/lib/use-resume-storage";
import { blankResume, sampleResume, wordCount } from "@/lib/resume-types";
import { FileDown, RotateCcw, Sparkles } from "lucide-react";
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
              size="sm"
              className="gap-1.5 bg-brass text-ink hover:bg-brass-soft"
              onClick={() => window.print()}
            >
              <FileDown className="size-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {loaded && (
        <main className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-10">
          <div className={`${view === "edit" ? "block" : "hidden"} lg:block print:hidden`}>
            <ResumeEditor data={data} setData={setData} />
          </div>
          <div className={`${view === "preview" ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-24">
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
