"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResumeData, resumeSearchableText } from "@/lib/resume-types";
import { JobMatchResult, scanJobDescription } from "@/lib/job-match";
import { Loader2, ScanSearch, Sparkles } from "lucide-react";

type DisplayResult = {
  scorePct: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  source: "ai" | "basic";
};

function toDisplayResult(result: JobMatchResult): DisplayResult {
  return {
    scorePct: result.scorePct,
    matched: result.keywords.filter((k) => k.matched).map((k) => k.term),
    missing: result.keywords.filter((k) => !k.matched).map((k) => k.term),
    suggestions: [],
    source: "basic",
  };
}

export function JobMatchCard({ data }: { data: ResumeData }) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<DisplayResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = async () => {
    if (!jobDescription.trim()) return;
    setScanning(true);
    const resumeText = resumeSearchableText(data);
    try {
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, jobTitle, company }),
      });
      if (!res.ok) throw new Error("ai scan unavailable");
      const ai = await res.json();
      setResult({
        scorePct: ai.scorePct,
        matched: ai.matched ?? [],
        missing: ai.missing ?? [],
        suggestions: ai.suggestions ?? [],
        source: "ai",
      });
    } catch {
      setResult(toDisplayResult(scanJobDescription(jobDescription, resumeText)));
    } finally {
      setScanning(false);
    }
  };

  const missing = result?.missing ?? [];
  const matched = result?.matched ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Match Scan</CardTitle>
        <CardDescription>
          Paste a job description to see which of its keywords your resume is missing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Company</label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Job title</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Data Entry Specialist"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Job description</label>
          <Textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here…"
          />
        </div>
        <Button
          type="button"
          size="sm"
          className="w-fit gap-1.5"
          disabled={!jobDescription.trim() || scanning}
          onClick={scan}
        >
          {scanning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ScanSearch className="size-4" />
          )}
          {scanning ? "Scanning…" : "Match / Scan"}
        </Button>

        {result && (
          <div className="mt-2 flex flex-col gap-3 rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {company || jobTitle
                  ? [jobTitle, company].filter(Boolean).join(" @ ")
                  : "Match score"}
              </p>
              <div className="flex items-center gap-1.5">
                {result.source === "ai" && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="size-3" />
                    AI
                  </Badge>
                )}
                <Badge variant={result.scorePct >= 60 ? "default" : "destructive"}>
                  {result.scorePct}% match
                </Badge>
              </div>
            </div>

            {missing.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Missing keywords — consider working these into your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((term) => (
                    <Badge key={term} variant="destructive">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {matched.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Already covered
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matched.map((term) => (
                    <Badge key={term} variant="outline">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Suggestions to close the gap
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-700">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
