export function buildJDExtractionPromptFromText(
  rawText: string,
  sourceUrl: string
): string {
  return `You are receiving raw text scraped from a job listing page. Extract structured job description data from it.

Source URL: ${sourceUrl || 'Unknown'}

Raw text:
${rawText}

INSTRUCTIONS:
- Ignore navigation menus, cookie banners, sidebar content, footer links, and any text that is not part of the actual job description
- Extract only the main job posting content
- Extract these exact fields:
  - job_title: the exact job title as written
  - company: company name
  - location: city, state/region, country (e.g. "Kuala Lumpur, Malaysia")
  - seniority_level: one of: Junior / Mid / Senior / Lead / Manager / Not specified
  - salary_range: extract if visible in the text, otherwise "Not specified"
  - required_skills: array of hard requirements (skills/tools explicitly required)
  - preferred_skills: array of nice-to-have skills (explicitly stated as preferred/bonus)
  - responsibilities: array of the top 5 key job responsibilities
  - about_company: 1-2 sentence summary of the company if present, otherwise "Not specified"

- If a field cannot be determined from the text, use "Not specified" for strings and [] for arrays

Return format: valid JSON matching this EXACT structure:
{
  "job_title": string,
  "company": string,
  "location": string,
  "seniority_level": string,
  "salary_range": string,
  "required_skills": string[],
  "preferred_skills": string[],
  "responsibilities": string[],
  "about_company": string
}

Return ONLY the JSON object. No markdown, no code fences, no explanation.`;
}

export function buildJDExtractionPromptFromImage(sourceUrl: string): string {
  return `You are reading text from a screenshot of a job listing page.

Source URL: ${sourceUrl || 'Unknown'}

INSTRUCTIONS:
- Focus only on the main job description content visible in the screenshot
- Ignore navigation bars, headers, footers, sidebars, cookie banners, and browser chrome
- If the screenshot is cropped or partial, extract what is visible and mark missing fields as "Not specified"
- Extract these exact fields:
  - job_title: the exact job title as written
  - company: company name
  - location: city, state/region, country (e.g. "Kuala Lumpur, Malaysia")
  - seniority_level: one of: Junior / Mid / Senior / Lead / Manager / Not specified
  - salary_range: extract if visible in the screenshot, otherwise "Not specified"
  - required_skills: array of hard requirements (skills/tools explicitly required)
  - preferred_skills: array of nice-to-have skills (explicitly stated as preferred/bonus)
  - responsibilities: array of the top 5 key job responsibilities visible
  - about_company: 1-2 sentence summary of the company if present, otherwise "Not specified"

- If a field cannot be determined from what is visible, use "Not specified" for strings and [] for arrays

Return format: valid JSON matching this EXACT structure:
{
  "job_title": string,
  "company": string,
  "location": string,
  "seniority_level": string,
  "salary_range": string,
  "required_skills": string[],
  "preferred_skills": string[],
  "responsibilities": string[],
  "about_company": string
}

Return ONLY the JSON object. No markdown, no code fences, no explanation.`;
}
