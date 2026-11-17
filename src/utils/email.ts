export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  if (process.env.NODE_ENV !== 'production') {
    // Dev mode: no real email provider configured yet — just log it
    console.log('--- PASSWORD RESET EMAIL (dev mode) ---');
    console.log(`To: ${email}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log('----------------------------------------');
    return;
  }

  // TODO: wire up a real provider here when ready (Resend, SendGrid, SES, etc.)
  // Example with Resend:
  // await resend.emails.send({
  //   from: env.EMAIL_FROM,
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  // });

  throw new Error('Email provider not configured for production');
}