import prisma from '../../../../../lib/prisma';
import { getIdToken } from '../../../../../lib/aws/cognito';
import { sendEmail } from '../../../../../lib/aws/sns';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const { reason } = req.body; // Optional rejection reason

  if (!id) {
    return res.status(400).json({ message: 'Application ID is required' });
  }

  try {
    // Get the authenticated user
    const cognitoToken = await getIdToken();
    if (!cognitoToken) {
      return res.status(401).json({ message: 'Authentication token expired or invalid' });
    }

    // Get user from our database
    const user = await prisma.user.findFirst({
      where: {
        cognitoId: cognitoToken.sub
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the user is an admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Get the application
    const application = await prisma.volunteerApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ 
        message: `Application has already been ${application.status.toLowerCase()}`
      });
    }

    // Update application status
    await prisma.volunteerApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason: reason || null
      }
    });

    // Send rejection email
    try {
      await sendEmail({
        to: application.email,
        subject: 'Virginia Discovery Museum - Volunteer Application Status',
        message: `
          Dear ${application.name},
          
          Thank you for your interest in volunteering with the Virginia Discovery Museum.
          
          After careful consideration of your application, we regret to inform you that we are not able to offer you a volunteer position at this time.
          
          ${reason ? `Reason: ${reason}` : ''}
          
          We appreciate your interest in our organization and encourage you to apply for future opportunities.
          
          If you have any questions, please contact us at volunteers@vadm.org.
          
          Thank you,
          Virginia Discovery Museum Volunteer Team
        `
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Continue without failing the request
    }

    return res.status(200).json({
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}