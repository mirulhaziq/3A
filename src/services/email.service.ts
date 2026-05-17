import { Resend } from 'resend';
import { retry } from '../lib/retry';
import { logger } from '../lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY!);

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await retry(async () => {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    logger.info({ to, subject }, 'Email sent successfully');
  });
}

export { sendEmail };
