import { supabase } from '../lib/supabase';
import { sendEmail } from '../services/email.service';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import { logger } from '../lib/logger';

async function runNudgeJob(): Promise<void> {
  const now = new Date();
  const currentHour = `${String(now.getUTCHours()).padStart(2, '0')}:00`;

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, whatsapp_number, nudge_time, streak, last_active_at, target_role')
    .eq('nudge_time', currentHour)
    .or('whatsapp_number.not.is.null,email.not.is.null');

  if (!profiles || profiles.length === 0) {
    logger.info({ hour: currentHour }, 'No nudges scheduled for this hour');
    return;
  }

  let delivered = 0;
  let failed = 0;

  interface ProfileRow {
    id: string;
    email: string | null;
    whatsapp_number: string | null;
    streak: number;
    last_active_at: string | null;
    target_role: string | null;
  }

  for (const profile of profiles as ProfileRow[]) {
    const { data: stats } = await supabase
      .from('applications')
      .select('applied_at, id')
      .eq('user_id', profile.id)
      .order('applied_at', { ascending: false })
      .limit(1);

    const { data: tasks } = await supabase
      .from('roadmap_weeks')
      .select('id')
      .eq('user_id', profile.id)
      .eq('completed', false);

    const mostRecentApp = stats?.[0];
    const daysSinceApplied = mostRecentApp
      ? Math.floor(
          (Date.now() - new Date(mostRecentApp.applied_at as string).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 99;

    const lastActiveAt = profile.last_active_at
      ? new Date(profile.last_active_at)
      : null;
    const daysSinceActive = lastActiveAt
      ? Math.floor((Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
      : 99;

    const openTasks = (tasks ?? []).length;

    let message: string;

    if (profile.streak === 0 || daysSinceActive > 1) {
      message =
        'Your CareerAI streak is at risk! Complete one quick task to keep your momentum going.';
    } else if (daysSinceApplied > 3) {
      message = `You haven't applied to any jobs in ${daysSinceApplied} days. 3 new matching roles are waiting.`;
    } else if (openTasks > 0) {
      message = `You have ${openTasks} tasks on your 90-day plan. Spend 5 minutes on your career today.`;
    } else {
      message =
        'Keep going! Every day you invest in your career search gets you closer.';
    }

    try {
      if (profile.whatsapp_number) {
        await sendWhatsAppMessage(profile.whatsapp_number, message);
      } else if (profile.email) {
        await sendEmail(
          profile.email,
          'Your Daily CareerAI Check-in',
          `<p>${message}</p><p><a href="${process.env.FRONTEND_URL}">Open CareerAI</a></p>`
        );
      }
      delivered++;
    } catch (err) {
      logger.error({ err, userId: profile.id }, 'Failed to deliver nudge');
      failed++;
    }
  }

  logger.info({ delivered, failed, hour: currentHour }, 'Nudge job completed');
}

export { runNudgeJob };
