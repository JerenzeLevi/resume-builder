import {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
  blankResume,
  emptyEducation,
  emptyExperience,
  emptyProject,
} from "./resume-types";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const LINKEDIN_RE = /linkedin\.com\/\S+/i;
const WEBSITE_RE = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?\b/i;
const BULLET_RE = /^[•●◦‣▪·∙*-]\s*/;
const DATE_TOKEN = "(?:\\d{1,2}\\/\\d{4}|[A-Za-z]{3,9}\\.?\\s+\\d{4}|\\d{4})";
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN}|present|current)\\s*[-–—]\\s*(${DATE_TOKEN}|present|current)`,
  "i"
);

const SECTION_KEYWORDS: { pattern: RegExp; key: Section }[] = [
  { pattern: /^(work\s+)?experience$|^professional\s+experience$|^employment\s+history$/i, key: "experience" },
  { pattern: /^education(al\s+background)?$/i, key: "education" },
  { pattern: /^(key\s+|core\s+|technical\s+)?skills$|^competencies$/i, key: "skills" },
  { pattern: /^projects?( experience)?$/i, key: "projects" },
  { pattern: /^(summary|profile|objective|about( me)?)$/i, key: "summary" },
];

type Section = "summary" | "experience" | "education" | "skills" | "projects";

type Line = {
  text: string;
  height: number;
  page: number;
};

/** Group raw PDF text items into visual lines, inserting extra spacing for large x-gaps
 * so two-column same-line content (e.g. "Company ... Dates") stays distinguishable. */
async function extractLines(file: File): Promise<Line[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const lines: Line[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    type Item = { str: string; x: number; y: number; width: number; height: number };
    type RawTextItem = { str: string; transform: number[]; width: number };
    const hasTransform = (it: unknown): it is RawTextItem =>
      typeof it === "object" &&
      it !== null &&
      "transform" in it &&
      "str" in it &&
      typeof (it as { str: unknown }).str === "string";
    const items: Item[] = (content.items as unknown[])
      .filter((it): it is RawTextItem => hasTransform(it) && it.str.trim().length > 0)
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        width: it.width,
        height: Math.abs(it.transform[3]) || 10,
      }));

    items.sort((a, b) => (Math.abs(a.y - b.y) > 2 ? b.y - a.y : a.x - b.x));

    let currentY: number | null = null;
    let buffer_: Item[] = [];
    const flush = () => {
      if (buffer_.length === 0) return;
      let text = "";
      let prevEnd: number | null = null;
      let maxHeight = 0;
      for (const it of buffer_) {
        maxHeight = Math.max(maxHeight, it.height);
        if (prevEnd !== null) {
          const gap = it.x - prevEnd;
          if (gap > it.height * 2.2) text += "    ";
          else if (gap > it.height * 0.15 && !text.endsWith(" ")) text += " ";
        }
        text += it.str;
        prevEnd = it.x + it.width;
      }
      const trimmed = text.replace(/[ \t]+$/g, "").trimStart();
      if (trimmed) lines.push({ text: trimmed, height: maxHeight, page: pageNum });
      buffer_ = [];
    };

    for (const it of items) {
      if (currentY !== null && Math.abs(it.y - currentY) > 2) flush();
      currentY = it.y;
      buffer_.push(it);
    }
    flush();
  }

  return lines;
}

function splitColumns(text: string): string[] {
  return text
    .split(/\s{3,}|\t/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchSection(text: string): Section | null {
  const clean = text.trim().replace(/[:•]+$/, "");
  if (clean.length > 40 || clean.split(/\s+/).length > 5) return null;
  for (const { pattern, key } of SECTION_KEYWORDS) {
    if (pattern.test(clean)) return key;
  }
  return null;
}

function parseDateRange(text: string): { start: string; end: string; current: boolean } {
  const m = text.match(DATE_RANGE_RE);
  if (!m) return { start: "", end: "", current: false };
  const end = m[2];
  const current = /present|current/i.test(end);
  return { start: m[1], end: current ? "" : end, current };
}

function stripContactExtras(token: string) {
  return token.replace(/^[•|,;\s]+|[•|,;\s]+$/g, "");
}

export async function parsePdfToResume(file: File): Promise<ResumeData> {
  const lines = await extractLines(file);
  const data = blankResume();

  if (lines.length === 0) return data;

  let i = 0;

  // 1. Name — first non-empty line, usually the largest font on the page.
  data.personal.name = lines[i].text.trim();
  i++;

  // 2. Contact line — next line(s) containing an email or phone, before any section heading.
  while (i < lines.length && i < 4 && !matchSection(lines[i].text)) {
    const line = lines[i].text;
    const hasEmail = EMAIL_RE.test(line);
    const hasPhone = PHONE_RE.test(line);
    const hasLinkedIn = LINKEDIN_RE.test(line);
    if (!hasEmail && !hasPhone && !hasLinkedIn) break;

    const email = line.match(EMAIL_RE)?.[0];
    if (email) data.personal.email = email;
    const linkedin = line.match(LINKEDIN_RE)?.[0];
    if (linkedin) data.personal.linkedin = stripContactExtras(linkedin);
    const phone = line.match(PHONE_RE)?.[0];
    if (phone) data.personal.phone = phone.trim();

    let rest = line;
    if (email) rest = rest.replace(email, "");
    if (linkedin) rest = rest.replace(linkedin, "");
    if (phone) rest = rest.replace(phone, "");
    for (const token of rest.split(/[•|]/)) {
      const clean = stripContactExtras(token);
      if (!clean) continue;
      if (!data.personal.location && !WEBSITE_RE.test(clean)) data.personal.location = clean;
      else if (!data.personal.website && WEBSITE_RE.test(clean)) data.personal.website = clean;
    }
    i++;
  }

  // 3. Job title — short line right after contact info, before the summary paragraph / first heading.
  if (i < lines.length && !matchSection(lines[i].text)) {
    const candidate = lines[i].text.trim();
    if (candidate.split(/\s+/).length <= 8 && !BULLET_RE.test(candidate)) {
      data.personal.title = candidate;
      i++;
    }
  }

  // 4. Everything else — walk lines, tracking the active section.
  let section: Section | null = "summary";
  const summaryParts: string[] = [];
  const skillParts: string[] = [];

  const experience = data.experience;
  experience.length = 0;
  let currentExp: ExperienceEntry | null = null;
  let expState: "expect-company" | "expect-role" | "in-bullets" = "expect-company";

  const education = data.education;
  education.length = 0;
  let currentEdu: EducationEntry | null = null;
  let eduAwaitingSchool = false;

  const projects = data.projects;
  projects.length = 0;
  let currentProj: ProjectEntry | null = null;

  for (; i < lines.length; i++) {
    const raw = lines[i].text.trim();
    if (!raw) continue;

    const heading = matchSection(raw);
    if (heading) {
      section = heading;
      currentExp = null;
      expState = "expect-company";
      currentEdu = null;
      eduAwaitingSchool = false;
      currentProj = null;
      continue;
    }

    if (section === "summary") {
      summaryParts.push(raw);
      continue;
    }

    if (section === "experience") {
      const cols = splitColumns(raw);

      if (BULLET_RE.test(raw)) {
        currentExp?.bullets.push(raw.replace(BULLET_RE, "").trim());
        expState = "in-bullets";
        continue;
      }

      // A date range is the strongest signal of a new job entry's "Company ... Dates" line.
      if (DATE_RANGE_RE.test(raw) && expState !== "expect-role") {
        currentExp = { ...emptyExperience(), bullets: [] };
        const dates = parseDateRange(raw);
        currentExp.company = cols[0] ?? raw.replace(DATE_RANGE_RE, "").trim();
        currentExp.start = dates.start;
        currentExp.end = dates.end;
        currentExp.current = dates.current;
        experience.push(currentExp);
        expState = "expect-role";
        continue;
      }

      if (expState === "expect-role" && currentExp) {
        currentExp.role = cols[0] ?? raw;
        if (cols[1]) currentExp.location = cols[1];
        expState = "in-bullets";
        continue;
      }

      if (expState === "in-bullets" && currentExp && currentExp.bullets.length > 0) {
        // Wrapped continuation of the previous bullet (no bullet marker on this line).
        const bullets = currentExp.bullets;
        bullets[bullets.length - 1] = `${bullets[bullets.length - 1]} ${raw}`.trim();
        continue;
      }

      if (expState === "expect-company" && !currentExp) {
        currentExp = { ...emptyExperience(), bullets: [] };
        currentExp.company = cols[0] ?? raw;
        experience.push(currentExp);
        expState = "expect-role";
        continue;
      }

      currentExp?.bullets.push(raw);
    }

    if (section === "education") {
      const cols = splitColumns(raw);
      if (!eduAwaitingSchool) {
        currentEdu = { ...emptyEducation() };
        currentEdu.degree = raw;
        education.push(currentEdu);
        eduAwaitingSchool = true;
      } else if (currentEdu) {
        currentEdu.school = cols[0] ?? raw;
        const dates = parseDateRange(raw);
        currentEdu.start = dates.start;
        currentEdu.end = dates.end;
        if (cols[1]) {
          currentEdu.location = cols[1]
            .replace(DATE_RANGE_RE, "")
            .trim()
            .replace(/[•|]+$/, "")
            .trim();
        }
        eduAwaitingSchool = false;
      }
      continue;
    }

    if (section === "skills") {
      skillParts.push(raw);
      continue;
    }

    if (section === "projects") {
      const cols = splitColumns(raw);
      const looksLikeNewProject =
        !currentProj || cols.some((c) => WEBSITE_RE.test(c) && !c.includes(" "));
      if (looksLikeNewProject && !BULLET_RE.test(raw)) {
        currentProj = { ...emptyProject() };
        currentProj.name = cols[0] ?? raw;
        if (cols[1]) currentProj.link = cols[1];
        projects.push(currentProj);
      } else if (currentProj) {
        currentProj.description = [currentProj.description, raw.replace(BULLET_RE, "")]
          .filter(Boolean)
          .join(" ");
      }
      continue;
    }
  }

  data.summary = summaryParts.join(" ").trim();
  data.skills = skillParts
    .join(" ")
    .split(/,|•/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (experience.length === 0) experience.push(emptyExperience());
  if (education.length === 0) education.push(emptyEducation());

  return data;
}
