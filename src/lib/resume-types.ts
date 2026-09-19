export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  link: string;
  description: string;
};

export type ResumeTemplate = "classic" | "clean-columns";

export type ResumeFont = "calibri" | "arial" | "times-new-roman";

export type ResumeData = {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  accent: string;
  template: ResumeTemplate;
  font: ResumeFont;
};

export const RESUME_TEMPLATES: { value: ResumeTemplate; name: string; description: string }[] = [
  {
    value: "classic",
    name: "Classic",
    description: "Underlined section headers, centered contact line.",
  },
  {
    value: "clean-columns",
    name: "Clean Columns",
    description: "Client-requested layout: bold role/dates rows, plain colored section labels.",
  },
];

export const RESUME_FONTS: { value: ResumeFont; name: string; stack: string }[] = [
  {
    value: "calibri",
    name: "Calibri",
    stack: "Calibri, Candara, 'Segoe UI', Optima, sans-serif",
  },
  {
    value: "arial",
    name: "Arial",
    stack: "Arial, Helvetica, sans-serif",
  },
  {
    value: "times-new-roman",
    name: "Times New Roman",
    stack: "'Times New Roman', Times, Georgia, serif",
  },
];

export const ACCENT_COLORS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Slate", value: "#334155" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#e11d48" },
  { name: "Amber", value: "#b45309" },
  { name: "Teal", value: "#0d9488" },
];

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyExperience(): ExperienceEntry {
  return {
    id: newId(),
    role: "",
    company: "",
    location: "",
    start: "",
    end: "",
    current: false,
    bullets: [""],
  };
}

export function emptyEducation(): EducationEntry {
  return {
    id: newId(),
    school: "",
    degree: "",
    location: "",
    start: "",
    end: "",
    details: "",
  };
}

export function emptyProject(): ProjectEntry {
  return { id: newId(), name: "", link: "", description: "" };
}

export const sampleResume: ResumeData = {
  personal: {
    name: "Jordan Avery",
    title: "Senior Product Designer",
    email: "jordan.avery@email.com",
    phone: "(555) 012-3456",
    location: "Austin, TX",
    website: "jordanavery.design",
    linkedin: "linkedin.com/in/jordanavery",
  },
  summary:
    "Product designer with 7+ years crafting user-centered experiences for B2B SaaS platforms. Led design systems and cross-functional teams that shipped features used by 2M+ monthly active users. Passionate about turning complex workflows into simple, delightful interfaces.",
  experience: [
    {
      id: newId(),
      role: "Senior Product Designer",
      company: "Northwind Analytics",
      location: "Austin, TX",
      start: "Jan 2022",
      end: "",
      current: true,
      bullets: [
        "Led redesign of core dashboard used by 40,000+ daily active users, increasing task completion rate by 28%",
        "Built and maintained a company-wide design system adopted by 6 product teams",
        "Mentored 3 junior designers and ran weekly critique sessions to raise design quality bar",
      ],
    },
    {
      id: newId(),
      role: "Product Designer",
      company: "Fieldstone Software",
      location: "Remote",
      start: "Jun 2019",
      end: "Dec 2021",
      current: false,
      bullets: [
        "Designed onboarding flow that reduced new-user drop-off by 34%",
        "Partnered with PM and engineering to ship 15+ features from concept to launch",
        "Ran usability studies with 50+ customers to validate new billing experience",
      ],
    },
  ],
  education: [
    {
      id: newId(),
      school: "University of Texas at Austin",
      degree: "B.F.A. in Design",
      location: "Austin, TX",
      start: "2015",
      end: "2019",
      details: "",
    },
  ],
  skills: [
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "Interaction Design",
    "HTML/CSS",
    "Accessibility",
  ],
  projects: [
    {
      id: newId(),
      name: "OpenGrid — Design System",
      link: "github.com/jordanavery/opengrid",
      description:
        "Open-source component library and Figma kit used by 400+ stars on GitHub.",
    },
  ],
  accent: "#0d9488",
  template: "clean-columns",
  font: "calibri",
};

function resumeParts(data: ResumeData): string[] {
  return [
    data.personal.name,
    data.personal.title,
    data.summary,
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...data.education.flatMap((e) => [e.school, e.degree, e.details]),
    ...data.skills,
    ...data.projects.flatMap((p) => [p.name, p.description]),
  ];
}

export function wordCount(data: ResumeData): number {
  return resumeParts(data)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Flattened, lowercased text of everything on the resume — used for job-description keyword matching. */
export function resumeSearchableText(data: ResumeData): string {
  return resumeParts(data).filter(Boolean).join(" ").toLowerCase();
}

export function blankResume(): ResumeData {
  return {
    personal: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [emptyExperience()],
    education: [emptyEducation()],
    skills: [],
    projects: [],
    accent: "#0d9488",
    template: "clean-columns",
    font: "calibri",
  };
}
