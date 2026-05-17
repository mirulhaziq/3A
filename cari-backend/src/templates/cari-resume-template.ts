interface ResumeTemplateSection {
  key: string;
  heading: string;
  purpose: string;
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  layoutRules: string[];
  sections: ResumeTemplateSection[];
}

const cariResumeTemplate: ResumeTemplate = {
  id: 'cari-amirul-single-column-v1',
  name: 'Cari Single Column Technical Resume',
  description:
    'Single-column ATS-friendly technical resume format based on the provided sample structure.',
  layoutRules: [
    'Use a compact single-column layout.',
    'Start with the candidate name in uppercase, then one contact line with location, phone, and email.',
    'Place LinkedIn and GitHub links directly under the contact line.',
    'Use uppercase section headings.',
    'Order sections exactly as: Summary, Education, Certification, Project, Relevant Experience, Technical Skills, Awards & Honors, Extracurricular Involvement.',
    'For education, projects, and experience, put organization/title on the left and dates on the right when rendered.',
    'Use concise bullet points focused on impact, metrics, tools, and scope.',
    'Keep skills grouped into Languages, Frameworks, Tools & Platforms, and Soft Skills.',
    'Do not invent dates, employers, certifications, schools, awards, or links.',
  ],
  sections: [
    {
      key: 'summary',
      heading: 'SUMMARY',
      purpose: 'Three to five lines describing role, domain, strongest stack, and current target.',
    },
    {
      key: 'education',
      heading: 'EDUCATION',
      purpose: 'Institution, date range, degree/program, field, and grade or notable academic detail.',
    },
    {
      key: 'certifications',
      heading: 'CERTIFICATION',
      purpose: 'Date followed by certification name and issuer when available.',
    },
    {
      key: 'projects',
      heading: 'PROJECT',
      purpose: 'Project name, date range, and two to three impact bullets with stack and measurable results.',
    },
    {
      key: 'experience',
      heading: 'RELEVANT EXPERIENCE',
      purpose: 'Company, role, date range, and bullets grounded in delivered work.',
    },
    {
      key: 'skills',
      heading: 'TECHNICAL SKILLS',
      purpose: 'Grouped technical and soft skills using label-colon lines.',
    },
    {
      key: 'awards',
      heading: 'AWARDS & HONORS',
      purpose: 'Year followed by award title and issuer.',
    },
    {
      key: 'extracurricular',
      heading: 'EXTRACURRICULAR INVOLVEMENT',
      purpose: 'Leadership, competitions, hackathons, ambassador work, and measurable extracurricular impact.',
    },
  ],
};

function buildResumeTemplateInstructions(): string {
  return [
    `Template ID: ${cariResumeTemplate.id}`,
    `Template name: ${cariResumeTemplate.name}`,
    'Layout rules:',
    ...cariResumeTemplate.layoutRules.map((rule) => `- ${rule}`),
    'Section purposes:',
    ...cariResumeTemplate.sections.map(
      (section) => `- ${section.heading}: ${section.purpose}`
    ),
  ].join('\n');
}

export { buildResumeTemplateInstructions, cariResumeTemplate };
export type { ResumeTemplate };
