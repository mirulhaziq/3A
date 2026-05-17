import { ToolDefinition } from '../../types/agent.types';
import { supabase } from '../../lib/supabase';
import { callClaude } from '../../ai/claude';

const emailDraftTool: ToolDefinition = {
  name: 'email_draft',
  description:
    "Call this tool to draft a follow-up email for an existing job application. Use at Day 7 post-application if there has been no response, or Day 14 for a final close-loop follow-up. This tool NEVER sends the email — it only creates a draft that must be approved by the user. Do not call this if the application status is already Interviewing, Offered, or Rejected.",
  input_schema: {
    type: 'object',
    properties: {
      application_id: { type: 'string' },
      day_trigger: {
        type: 'number',
        enum: [7, 14],
        description: 'Which follow-up this is',
      },
      company_name: { type: 'string' },
      job_title: { type: 'string' },
      applied_date: {
        type: 'string',
        description: 'ISO date string of when the user applied',
      },
      jd_id: {
        type: 'string',
        description: 'Optional: Supabase ID from job_descriptions table to fetch company and job details',
      },
    },
    required: [
      'application_id',
      'day_trigger',
      'applied_date',
    ],
  },
  execute: async (
    input: Record<string, unknown>,
    userId: string
  ): Promise<Record<string, unknown>> => {
    const applicationId = input.application_id as string;
    const dayTrigger = input.day_trigger as 7 | 14;
    const appliedDate = input.applied_date as string;
    const jdId = input.jd_id as string | undefined;

    let companyName = (input.company_name as string) ?? 'the company';
    let jobTitle = (input.job_title as string) ?? 'the position';

    // Resolve company/job details from job_descriptions table if jd_id provided
    if (jdId) {
      const { data: jdRecord } = await supabase
        .from('job_descriptions')
        .select('company, job_title')
        .eq('id', jdId)
        .eq('user_id', userId)
        .single();

      if (jdRecord) {
        companyName = (jdRecord.company as string) || companyName;
        jobTitle = (jdRecord.job_title as string) || jobTitle;
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, target_role')
      .eq('id', userId)
      .single();

    const { data: cv } = await supabase
      .from('cv_versions')
      .select('cv_text')
      .eq('user_id', userId)
      .eq('type', 'master')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const userName = (profile?.full_name as string) ?? 'the candidate';
    const cvHighlights = cv?.cv_text
      ? (cv.cv_text as string).slice(0, 500)
      : '';

    let emailPrompt: string;

    if (dayTrigger === 7) {
      emailPrompt = `Write a Day 7 follow-up email for a job application.

Candidate name: ${userName}
Company: ${companyName}
Role: ${jobTitle}
Applied on: ${appliedDate}
CV highlights (use one specific hook from here): ${cvHighlights}

Requirements:
- Polite, professional tone
- Reference the specific role and submission date
- Include ONE specific value hook from the candidate's background
- End with a clear call-to-action asking about next steps
- Subject line: clear and non-pushy
- Body: 3-4 short paragraphs maximum

Return valid JSON: { "subject": string, "body": string }
Return ONLY the JSON. No markdown, no code fences.`;
    } else {
      emailPrompt = `Write a Day 14 close-loop follow-up email for a job application.

Candidate name: ${userName}
Company: ${companyName}
Role: ${jobTitle}
Applied on: ${appliedDate}

Requirements:
- Shorter than the Day 7 email
- Close-loop tone: "I remain very interested and happy to discuss further"
- Offer to share additional materials or answer questions
- Professional sign-off
- Subject line: reference previous follow-up
- Body: 2-3 short paragraphs maximum

Return valid JSON: { "subject": string, "body": string }
Return ONLY the JSON. No markdown, no code fences.`;
    }

    const response = await callClaude(
      [{ role: 'user', content: emailPrompt }],
      'You are a professional career coach drafting follow-up emails for Malaysian job seekers.',
      [],
      1024
    );

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    let emailData: { subject: string; body: string };
    try {
      emailData = JSON.parse(responseText) as { subject: string; body: string };
    } catch {
      throw new Error('Failed to parse email draft response');
    }

    const { data: draft, error: draftError } = await supabase
      .from('followup_drafts')
      .insert({
        application_id: applicationId,
        day_trigger: dayTrigger,
        subject: emailData.subject,
        body: emailData.body,
        approved: false,
      })
      .select('id')
      .single();

    if (draftError || !draft) {
      throw new Error('Failed to save email draft');
    }

    return {
      draft_id: draft.id as string,
      subject: emailData.subject,
      body: emailData.body,
      day_trigger: dayTrigger,
    };
  },
};

export { emailDraftTool };
