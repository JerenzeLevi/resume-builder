import { ResumeData } from "@/lib/resume-types";

function dateRange(start: string, end: string, current: boolean) {
  const endLabel = current ? "Present" : end;
  if (!start && !endLabel) return "";
  return [start, endLabel].filter(Boolean).join(" – ");
}

export function ResumePreview({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects, accent } = data;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
  ].filter(Boolean);

  return (
    <div
      id="resume-preview"
      className="mx-auto flex w-full max-w-[8.5in] flex-col bg-white px-[0.65in] py-[0.6in] text-[13px] leading-snug text-neutral-800 shadow-sm print:shadow-none"
      style={{ minHeight: "11in" }}
    >
      <header className="mb-4">
        <h1 className="text-[26px] font-bold tracking-tight text-neutral-900">
          {personal.name || "Your Name"}
        </h1>
        {personal.title && (
          <p className="mt-0.5 text-[15px] font-medium" style={{ color: accent }}>
            {personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <p className="mt-2 text-[11.5px] text-neutral-500">
            {contactItems.join("  •  ")}
          </p>
        )}
      </header>

      {summary && (
        <Section title="Summary" accent={accent}>
          <p className="text-neutral-700">{summary}</p>
        </Section>
      )}

      {experience.some((e) => e.role || e.company) && (
        <Section title="Experience" accent={accent}>
          <div className="flex flex-col gap-3.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold text-neutral-900">
                    {exp.role}
                    {exp.company && (
                      <span className="font-normal text-neutral-600"> · {exp.company}</span>
                    )}
                  </p>
                  <p className="whitespace-nowrap text-[11.5px] text-neutral-500">
                    {dateRange(exp.start, exp.end, exp.current)}
                  </p>
                </div>
                {exp.location && (
                  <p className="text-[11.5px] text-neutral-500">{exp.location}</p>
                )}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700 marker:text-neutral-400">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.some((e) => e.school || e.degree) && (
        <Section title="Education" accent={accent}>
          <div className="flex flex-col gap-2">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold text-neutral-900">
                    {edu.school}
                    {edu.degree && (
                      <span className="font-normal text-neutral-600"> · {edu.degree}</span>
                    )}
                  </p>
                  <p className="whitespace-nowrap text-[11.5px] text-neutral-500">
                    {dateRange(edu.start, edu.end, false)}
                  </p>
                </div>
                {(edu.location || edu.details) && (
                  <p className="text-[11.5px] text-neutral-500">
                    {[edu.location, edu.details].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills" accent={accent}>
          <p className="text-neutral-700">{skills.join("  •  ")}</p>
        </Section>
      )}

      {projects.some((p) => p.name) && (
        <Section title="Projects" accent={accent}>
          <div className="flex flex-col gap-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <p className="font-semibold text-neutral-900">
                  {proj.name}
                  {proj.link && (
                    <span className="font-normal text-neutral-500"> · {proj.link}</span>
                  )}
                </p>
                {proj.description && (
                  <p className="text-neutral-700">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2
        className="mb-1.5 border-b pb-0.5 text-[11.5px] font-bold uppercase tracking-wider"
        style={{ color: accent, borderColor: accent + "40" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
