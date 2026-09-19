const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "your", "with", "have", "has",
  "will", "can", "our", "their", "this", "that", "from", "any", "all", "who",
  "what", "when", "where", "how", "into", "onto", "than", "then", "them", "they",
  "she", "him", "her", "his", "its", "was", "were", "been", "being", "about",
  "over", "under", "such", "some", "each", "every", "other", "more", "most",
  "also", "may", "must", "should", "would", "could", "while", "which", "these",
  "those", "here", "there", "per", "via", "including", "include", "includes",
  "role", "roles", "job", "jobs", "work", "working", "works", "team", "teams",
  "company", "companies", "position", "candidate", "candidates", "we", "our",
  "you'll", "you're", "an", "as", "at", "be", "by", "in", "is", "it", "of", "on",
  "or", "to", "up", "we're", "years", "year", "within", "across", "based",
  "looking", "requirements", "requirement", "responsibilities", "responsibility",
  "preferred", "required", "strong", "excellent", "ability", "abilities", "using",
  "use", "used", "etc", "e.g", "i.e", "new", "one", "two", "day", "days", "time",
]);

export type MatchedKeyword = {
  term: string;
  count: number;
  matched: boolean;
};

export type JobMatchResult = {
  keywords: MatchedKeyword[];
  matchedCount: number;
  totalCount: number;
  scorePct: number;
};

/** Multi-word proper-case phrases (e.g. "Google Sheets", "Microsoft Excel") that are usually
 * tool/skill names in a job posting. */
function extractPhrases(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-zA-Z0-9+/#.]*(?:\s+[A-Z][a-zA-Z0-9+/#.]*){0,2}\b/g) ?? [];
  return matches
    .map((m) => m.trim())
    .filter((m) => m.split(/\s+/).length >= 2 || m.length > 2)
    .filter((m) => !STOPWORDS.has(m.toLowerCase()));
}

function extractWords(text: string): string[] {
  const matches = text.toLowerCase().match(/\b[a-z][a-z0-9+/#.-]{2,}\b/g) ?? [];
  return matches.filter((w) => !STOPWORDS.has(w));
}

export function scanJobDescription(jobDescription: string, resumeText: string): JobMatchResult {
  const counts = new Map<string, { term: string; count: number }>();

  for (const phrase of extractPhrases(jobDescription)) {
    const key = phrase.toLowerCase();
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { term: phrase, count: 1 });
  }

  for (const word of extractWords(jobDescription)) {
    const existing = counts.get(word);
    if (existing) existing.count += 1;
    else counts.set(word, { term: word, count: 1 });
  }

  const resumeLower = resumeText.toLowerCase();
  const keywords: MatchedKeyword[] = Array.from(counts.values())
    .map(({ term, count }) => ({
      term,
      count,
      matched: resumeLower.includes(term.toLowerCase()),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const matchedCount = keywords.filter((k) => k.matched).length;
  const totalCount = keywords.length;
  const scorePct = totalCount === 0 ? 0 : Math.round((matchedCount / totalCount) * 100);

  return { keywords, matchedCount, totalCount, scorePct };
}
