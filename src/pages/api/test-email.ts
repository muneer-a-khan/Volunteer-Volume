import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only available in development mode'
    });
  }

  try {
    // Send a test email
    await sendEmail({
      to: req.query.email as string || 'your-email@example.com',
      subject: 'Test Email from VADM Volunteer System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify that the email system is working correctly.</p>
        <p>Current server time: ${new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York',
          dateStyle: 'full',
          timeStyle: 'long'
        })}</p>
        <p>Configuration:</p>
        <ul>
          <li>GMAIL_USER: ${process.env.GMAIL_USER ? 'Configured ✓' : 'Not configured ✗'}</li>
          <li>GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? 'Configured ✓' : 'Not configured ✗'}</li>
          <li>ACTIONS_TOKEN: ${process.env.ACTIONS_TOKEN ? 'Configured ✓' : 'Not configured ✗'}</li>
        </ul>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: String(error)
    });
  }
} 