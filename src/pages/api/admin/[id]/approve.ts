import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }

    // Get the application
    const application = await prisma.applications.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update application status
    await prisma.applications.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_by: session.user.id,
        approved_at: new Date()
      }
    });

    // Send approval email
    try {
      await sendEmail({
        to: application.email,
        ...emailTemplates.applicationApproved(application)
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue with the process even if email sending fails
    }

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully'
    });

  } catch (error) {
    console.error('Error approving application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Helper function to generate a temporary password
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
} 