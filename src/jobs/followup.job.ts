import { supabase } from '../lib/supabase';
import { getToolExecutor } from '../agent/tools';
import { logger } from '../lib/logger';

async function runFollowupJob(): Promise<void> {
  const { data: day7Apps } = await supabase
    .from('applications')
    .select('id, user_id, job_title, company, applied_at')
    .eq('status', 'submitted')
    .eq('followup_7_sent', false)
    .lte('applied_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: day14Apps } = await supabase
    .from('applications')
    .select('id, user_id, job_title, company, applied_at')
    .in('status', ['submitted', 'followed_up'])
    .eq('followup_7_sent', true)
    .eq('followup_14_sent', false)
    .lte('applied_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

  const emailDraftExecutor = getToolExecutor('email_draft');

  let draftsCreated = 0;

  interface AppRow {
    id: string;
    user_id: string;
    job_title: string;
    company: string;
    applied_at: string;
  }

  for (const app of (day7Apps ?? []) as AppRow[]) {
    try {
      await emailDraftExecutor(
        {
          application_id: app.id,
          day_trigger: 7,
          company_name: app.company,
          job_title: app.job_title,
          applied_date: app.applied_at,
        },
        app.user_id
      );
      draftsCreated++;
    } catch (err) {
      logger.error({ err, applicationId: app.id }, 'Failed to create day 7 draft');
    }
  }

  for (const app of (day14Apps ?? []) as AppRow[]) {
    try {
      await emailDraftExecutor(
        {
          application_id: app.id,
          day_trigger: 14,
          company_name: app.company,
          job_title: app.job_title,
          applied_date: app.applied_at,
        },
        app.user_id
      );
      draftsCreated++;
    } catch (err) {
      logger.error({ err, applicationId: app.id }, 'Failed to create day 14 draft');
    }
  }

  logger.info({ draftsCreated }, 'Followup job completed');
}

export { runFollowupJob };
