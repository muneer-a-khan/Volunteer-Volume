import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
  try {
    const mailOptions = {
      from: `"VADM Volunteer System" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  shiftReminder: (shift: any) => ({
    subject: `Reminder: Upcoming Shift - ${shift.title}`,
    html: `
      <h2>Shift Reminder</h2>
      <p>This is a reminder for your upcoming shift:</p>
      <ul>
        <li><strong>Title:</strong> ${shift.title}</li>
        <li><strong>Date:</strong> ${new Date(shift.start_time).toLocaleString()}</li>
        <li><strong>Location:</strong> ${shift.location}</li>
      </ul>
      <p>Please arrive on time and check in when you get there.</p>
      <p>Thank you for volunteering!</p>
    `,
  }),

  shiftConfirmation: (shift: any) => ({
    subject: `Shift Confirmation - ${shift.title}`,
    html: `
      <h2>Shift Confirmation</h2>
      <p>Your shift has been confirmed:</p>
      <ul>
        <li><strong>Title:</strong> ${shift.title}</li>
        <li><strong>Date:</strong> ${new Date(shift.start_time).toLocaleString()}</li>
        <li><strong>Location:</strong> ${shift.location}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `,
  }),

  shiftCancellation: (shift: any) => ({
    subject: `Shift Cancellation - ${shift.title}`,
    html: `
      <h2>Shift Cancellation</h2>
      <p>You have successfully cancelled your registration for the following shift:</p>
      <ul>
        <li><strong>Title:</strong> ${shift.title}</li>
        <li><strong>Date:</strong> ${new Date(shift.start_time).toLocaleString()}</li>
        <li><strong>Location:</strong> ${shift.location}</li>
      </ul>
      <p>If this was done in error, please sign up again on the website.</p>
      <p>Thank you for keeping your schedule updated!</p>
    `,
  }),

  applicationReceived: (application: any) => ({
    subject: 'Volunteer Application Received',
    html: `
      <h2>Application Received</h2>
      <p>Thank you for your volunteer application. We have received your submission and will review it shortly.</p>
      <p>We will contact you at ${application.email} once we have reviewed your application.</p>
      <p>Best regards,<br>VADM Volunteer Team</p>
    `,
  }),

  applicationApproved: (application: any) => ({
    subject: 'Volunteer Application Approved',
    html: `
      <h2>Application Approved</h2>
      <p>Congratulations! Your volunteer application has been approved.</p>
      <p>You can now log in to your account and start volunteering.</p>
      <p>Best regards,<br>VADM Volunteer Team</p>
    `,
  }),

  applicationRejected: (application: any, reason: string) => ({
    subject: 'Volunteer Application Status Update',
    html: `
      <h2>Application Status Update</h2>
      <p>We regret to inform you that your volunteer application has not been approved at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br>VADM Volunteer Team</p>
    `,
  }),

  // Add new email template for admin notification of new application
  newApplication: (application: any) => ({
    subject: 'New Volunteer Application Submitted',
    html: `
      <h2>New Volunteer Application</h2>
      <p>A new volunteer application has been submitted and requires your review.</p>
      <p><strong>Name:</strong> ${application.name}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>Position of Interest:</strong> ${application.volunteerPosition}</p>
      <p>Please login to the admin dashboard to review this application.</p>
    `,
  }),
}; 