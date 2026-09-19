import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type GeminiResult = {
  scorePct: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
};

function buildPrompt(resumeText: string, jobDescription: string, jobTitle: string, company: string) {
  return `You are an ATS (applicant tracking system) resume screener.

Compare the RESUME below against the JOB DESCRIPTION for the role "${jobTitle || "the role"}" at "${company || "the company"}".

Identify the important skills, tools, and qualification keywords from the job description, then classify each as either present in the resume ("matched") or absent from it ("missing"). Also give 3-6 short, concrete suggestions for how to naturally work the missing keywords into the resume's summary or bullet points, without fabricating experience the candidate doesn't have.

Respond with ONLY minified JSON, no markdown, in exactly this shape:
{"scorePct": number (0-100, overall keyword coverage), "matched": string[], "missing": string[], "suggestions": string[]}

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI scan not configured" }, { status: 501 });
  }

  let body: { resumeText?: string; jobDescription?: string; jobTitle?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeText, jobDescription, jobTitle = "", company = "" } = body;
  if (!resumeText || !jobDescription) {
    return NextResponse.json({ error: "resumeText and jobDescription are required" }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const prompt = buildPrompt(resumeText, jobDescription, jobTitle, company);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error", res.status, errText);
      return NextResponse.json({ error: "AI scan failed" }, { status: 502 });
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "AI scan returned no content" }, { status: 502 });
    }

    const parsed = JSON.parse(text) as GeminiResult;
    if (!Array.isArray(parsed.matched) || !Array.isArray(parsed.missing)) {
      return NextResponse.json({ error: "AI scan returned unexpected shape" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API call failed", err);
    return NextResponse.json({ error: "AI scan failed" }, { status: 502 });
  }
}
