import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { RESUME_MODEL, GPT4_MODEL, getOpenAIClient, getGPT4Client, extractJson } from '../lib/openai';

const roadmapRouter = Router();

roadmapRouter.use(authMiddleware);

const skillResourcesSchema = z.object({
  skillId: z.string().min(1),
  skillLabel: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
});

roadmapRouter.post('/skill-resources', async (req, res, next): Promise<void> => {
  try {
    const { skillLabel, role, description } = skillResourcesSchema.parse(req.body);
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: RESUME_MODEL,
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: 'You are a career learning guide. Return only valid JSON. No markdown.',
        },
        {
          role: 'user',
          content: `Generate 5 curated free learning resources for a ${role} developer learning "${skillLabel}".
${description ? `Skill context: ${description}` : ''}

Return exactly this JSON:
{
  "resources": [
    { "label": "Resource title", "url": "https://..." },
    ...
  ]
}

Rules:
- Only use real, popular, free resources (MDN, freeCodeCamp, official docs, YouTube channels, GitHub repos, roadmap.sh)
- Each URL must be a real, well-known URL — do not invent links
- Keep labels short and descriptive (max 5 words)
- Prioritize official docs first, then interactive platforms, then YouTube
- No paywalled content`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    const parsed = extractJson(content) as { resources?: { label: string; url: string }[] };
    const resources = (parsed.resources ?? []).slice(0, 5);

    res.json({ success: true, data: { resources } });
  } catch (error) {
    next(error);
  }
});

roadmapRouter.post('/generate', async (req, res, next): Promise<void> => {
  try {
    const { role } = z.object({ role: z.string().min(1).max(120) }).parse(req.body);
    const openai = getGPT4Client();

    const completion = await openai.chat.completions.create({
      model: GPT4_MODEL,
      temperature: 0.4,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are a tech career learning path designer. Return only valid JSON. No markdown.' },
        {
          role: 'user',
          content: `Create a 4-phase career roadmap for a "${role}" developer. Return JSON with exactly 4 phases: foundation, core, advanced, jobready. Each phase has exactly 4 skills. The very first skill in "foundation" has status "available", ALL other skills have status "locked".

Return this JSON shape (no other text):
{"phases":[{"id":"foundation","label":"Foundation","skills":[...]},{"id":"core","label":"Core ${role}","skills":[...]},{"id":"advanced","label":"Advanced","skills":[...]},{"id":"jobready","label":"Job Ready","skills":[...]}]}

Where each skill is: {"id":"snake_id","label":"Skill Name","icon":"emoji","xp":NUMBER,"status":"locked","description":"One sentence.","resources":[{"label":"Short Title","url":"https://real.url"}]}

Rules:
- Foundation skills: xp 40-80. Core skills: xp 70-110. Advanced: 90-130. Job Ready: 100-140.
- Unique snake_case skill ids across all phases
- Real free resource URLs only (MDN, freeCodeCamp, official docs, roadmap.sh, go.dev, etc.)
- Labels under 4 words
- 1 resource per skill`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response for roadmap generation');

    const parsed = extractJson(content) as { phases?: unknown[] };

    if (!Array.isArray(parsed.phases)) {
      throw new Error('AI returned invalid roadmap structure');
    }

    res.json({ success: true, data: { phases: parsed.phases } });
  } catch (error) {
    next(error);
  }
});

export { roadmapRouter };
