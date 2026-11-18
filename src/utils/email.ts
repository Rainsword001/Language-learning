import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

  // No API key (local development): log the link instead of sending
  if (!resend) {
    console.log('--- PASSWORD RESET EMAIL (dev mode) ---');
    console.log(`To: ${email}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log('----------------------------------------');
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password',
    text:
      `We received a request to reset your password.\n\n` +
      `Open this link to choose a new one (valid for 1 hour):\n${resetUrl}\n\n` +
      `If you didn't request this, you can ignore this email.`,
    html:
      `<p>We received a request to reset your password.</p>` +
      `<p><a href="${resetUrl}">Reset your password</a></p>` +
      `<p>This link is valid for 1 hour. If you didn't request it, you can ignore this email.</p>`,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}