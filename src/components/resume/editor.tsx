"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ACCENT_COLORS,
  RESUME_FONTS,
  RESUME_TEMPLATES,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
  emptyEducation,
  emptyExperience,
  emptyProject,
} from "@/lib/resume-types";
import { AddButton, MoveButtons, RemoveButton, moveItem } from "./field-array-controls";
import { cn } from "@/lib/utils";

type Props = {
  data: ResumeData;
  setData: Dispatch<SetStateAction<ResumeData>>;
};

export function ResumeEditor({ data, setData }: Props) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setPersonal = <K extends keyof ResumeData["personal"]>(
    key: K,
    value: ResumeData["personal"][K]
  ) => set("personal", { ...data.personal, [key]: value });

  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    set(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const updateEducation = (id: string, patch: Partial<EducationEntry>) =>
    set(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const updateProject = (id: string, patch: Partial<ProjectEntry>) =>
    set(
      "projects",
      data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>Your name and how to reach you.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={data.personal.name}
              onChange={(e) => setPersonal("name", e.target.value)}
              placeholder="Jordan Avery"
            />
          </Field>
          <Field label="Job title">
            <Input
              value={data.personal.title}
              onChange={(e) => setPersonal("title", e.target.value)}
              placeholder="Senior Product Designer"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={data.personal.email}
              onChange={(e) => setPersonal("email", e.target.value)}
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={data.personal.phone}
              onChange={(e) => setPersonal("phone", e.target.value)}
              placeholder="(555) 012-3456"
            />
          </Field>
          <Field label="Location">
            <Input
              value={data.personal.location}
              onChange={(e) => setPersonal("location", e.target.value)}
              placeholder="Austin, TX"
            />
          </Field>
          <Field label="Website">
            <Input
              value={data.personal.website}
              onChange={(e) => setPersonal("website", e.target.value)}
              placeholder="yourname.com"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={data.personal.linkedin}
              onChange={(e) => setPersonal("linkedin", e.target.value)}
              placeholder="linkedin.com/in/you"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>2–3 sentences on who you are and what you bring.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={4}
            placeholder="Product designer with 7+ years crafting..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
          <CardDescription>Most recent role first.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.experience.map((exp, i) => (
            <div key={exp.id} className="flex gap-2">
              <MoveButtons
                onUp={() => set("experience", moveItem(data.experience, i, -1))}
                onDown={() => set("experience", moveItem(data.experience, i, 1))}
                disableUp={i === 0}
                disableDown={i === data.experience.length - 1}
              />
              <div className="flex-1 rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Role {i + 1}
                  </p>
                  <RemoveButton
                    onClick={() =>
                      set(
                        "experience",
                        data.experience.filter((e) => e.id !== exp.id)
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Role">
                    <Input
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      placeholder="Senior Product Designer"
                    />
                  </Field>
                  <Field label="Company">
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      placeholder="Northwind Analytics"
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="Austin, TX"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start">
                      <Input
                        value={exp.start}
                        onChange={(e) => updateExperience(exp.id, { start: e.target.value })}
                        placeholder="Jan 2022"
                      />
                    </Field>
                    <Field label="End">
                      <Input
                        value={exp.end}
                        disabled={exp.current}
                        onChange={(e) => updateExperience(exp.id, { end: e.target.value })}
                        placeholder={exp.current ? "Present" : "Dec 2021"}
                      />
                    </Field>
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) =>
                      updateExperience(exp.id, { current: e.target.checked, end: "" })
                    }
                    className="size-4 rounded border-input"
                  />
                  I currently work here
                </label>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Highlights</p>
                  <div className="flex flex-col gap-2">
                    {exp.bullets.map((bullet, bi) => (
                      <div key={bi} className="flex gap-2">
                        <Textarea
                          value={bullet}
                          rows={2}
                          onChange={(e) => {
                            const bullets = [...exp.bullets];
                            bullets[bi] = e.target.value;
                            updateExperience(exp.id, { bullets });
                          }}
                          placeholder="Led redesign of core dashboard, increasing task completion by 28%"
                        />
                        <RemoveButton
                          onClick={() =>
                            updateExperience(exp.id, {
                              bullets: exp.bullets.filter((_, idx) => idx !== bi),
                            })
                          }
                        />
                      </div>
                    ))}
                    <AddButton
                      label="Add highlight"
                      onClick={() =>
                        updateExperience(exp.id, { bullets: [...exp.bullets, ""] })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <AddButton
            label="Add role"
            onClick={() => set("experience", [...data.experience, emptyExperience()])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.education.map((edu, i) => (
            <div key={edu.id} className="flex gap-2">
              <MoveButtons
                onUp={() => set("education", moveItem(data.education, i, -1))}
                onDown={() => set("education", moveItem(data.education, i, 1))}
                disableUp={i === 0}
                disableDown={i === data.education.length - 1}
              />
              <div className="flex-1 rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    School {i + 1}
                  </p>
                  <RemoveButton
                    onClick={() =>
                      set(
                        "education",
                        data.education.filter((e) => e.id !== edu.id)
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="School">
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                      placeholder="University of Texas at Austin"
                    />
                  </Field>
                  <Field label="Degree">
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      placeholder="B.F.A. in Design"
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={edu.location}
                      onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                      placeholder="Austin, TX"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start">
                      <Input
                        value={edu.start}
                        onChange={(e) => updateEducation(edu.id, { start: e.target.value })}
                        placeholder="2015"
                      />
                    </Field>
                    <Field label="End">
                      <Input
                        value={edu.end}
                        onChange={(e) => updateEducation(edu.id, { end: e.target.value })}
                        placeholder="2019"
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-3">
                  <Field label="Details (optional)">
                    <Input
                      value={edu.details}
                      onChange={(e) => updateEducation(edu.id, { details: e.target.value })}
                      placeholder="Magna cum laude, GPA 3.9"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <AddButton
            label="Add school"
            onClick={() => set("education", [...data.education, emptyEducation()])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Comma separated. Shown as a clean list on your resume.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={data.skills.join(", ")}
            onChange={(e) =>
              set(
                "skills",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Figma, Design Systems, User Research, Prototyping"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Optional — link personal or open-source work.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.projects.map((proj, i) => (
            <div key={proj.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Project {i + 1}
                </p>
                <RemoveButton
                  onClick={() =>
                    set(
                      "projects",
                      data.projects.filter((p) => p.id !== proj.id)
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="OpenGrid — Design System"
                  />
                </Field>
                <Field label="Link">
                  <Input
                    value={proj.link}
                    onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                    placeholder="github.com/you/opengrid"
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Description">
                  <Textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    placeholder="Open-source component library used by 400+ stars"
                  />
                </Field>
              </div>
            </div>
          ))}
          <AddButton
            label="Add project"
            onClick={() => set("projects", [...data.projects, emptyProject()])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
          <CardDescription>Pick the layout used for the preview and PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            {RESUME_TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("template", t.value)}
                className={cn(
                  "flex-1 rounded-md border p-3 text-left transition",
                  data.template === t.value
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Font</CardTitle>
          <CardDescription>Applied to the whole preview and PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            {RESUME_FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => set("font", f.value)}
                className={cn(
                  "flex-1 rounded-md border p-3 text-left transition",
                  data.font === f.value
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
                style={{ fontFamily: f.stack }}
              >
                <p className="text-sm font-medium">{f.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground" style={{ fontFamily: f.stack }}>
                  Aa Bb Cc — The quick brown fox
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
          <CardDescription>Applied to your name and section headings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set("accent", c.value)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition",
                  data.accent === c.value ? "border-foreground" : "border-transparent"
                )}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
                title={c.name}
              />
            ))}
            <label
              className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40"
              title="Custom color"
            >
              <input
                type="color"
                value={data.accent}
                onChange={(e) => set("accent", e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label="Custom accent color"
              />
              <span
                className="size-7 rounded-full border border-border"
                style={{ backgroundColor: data.accent }}
              />
            </label>
            <Input
              value={data.accent}
              onChange={(e) => set("accent", e.target.value)}
              className="h-9 w-28 font-mono text-xs"
              aria-label="Accent color hex value"
            />
          </div>
        </CardContent>
      </Card>
      <Separator />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
