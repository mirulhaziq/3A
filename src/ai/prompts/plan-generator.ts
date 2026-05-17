import { SkillGap } from '../../types';

export function buildPlanGeneratorPrompt(
  gaps: SkillGap[],
  targetRole: string,
  weeks: number
): string {
  return `You are a senior career development coach specialising in upskilling Malaysian fresh graduates for the tech and finance sectors. Generate a week-by-week learning roadmap.

TARGET ROLE: ${targetRole}
PLAN DURATION: ${weeks} weeks

SKILL GAPS TO ADDRESS (sorted by severity):
${JSON.stringify(gaps, null, 2)}

INSTRUCTIONS:
1. Generate a week-by-week learning plan covering the provided skill gaps
2. Sort gaps by: employer demand weight × severity × urgency (most critical first)
3. Allocate the top 5 gaps into week blocks based on complexity:
   - High complexity skills (e.g. Python, SQL, Machine Learning): 2-3 week block
   - Medium complexity (e.g. Tableau, Excel advanced, Power BI): 1-2 week block
   - Quick wins (e.g. LinkedIn profile, Canva, soft skills): 3-5 days
4. For each week include:
   - skill_focus: the skill being studied that week
   - daily_time_minutes: realistic daily commitment (30-120 mins)
   - resources: exactly 3 resources (one free, one paid, one hands_on project)
   - milestone_project: ONLY at weeks 4, 8, and 12 — a specific, portfolio-ready project relevant to the targetRole; null for all other weeks
5. The plan must cover exactly ${weeks} weeks — no more, no less

Return format: valid JSON as an array of RoadmapWeek objects:
[
  {
    "week_number": number,
    "skill_focus": string,
    "daily_time_minutes": number,
    "resources": [{ "title": string, "url": string, "type": "free" | "paid" | "hands_on" }],
    "milestone_project": string | null
  }
]

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation, no code fences.`;
}
