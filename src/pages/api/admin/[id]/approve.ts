import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
  application?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid application ID' });
  }

  try {
    await prisma.$connect();

    // Get the application
    const application = await prisma.applications.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!application || !application.users) {
      return res.status(404).json({ success: false, message: 'Application or associated user not found' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Application status is ${application.status}, not PENDING` });
    }

    // Update application status
    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved_by: application.users.id,
        approved_at: new Date()
      }
    });

    // Update user role (if not already VOLUNTEER or ADMIN)
    if (application.users.role !== 'VOLUNTEER' && application.users.role !== 'ADMIN') {
      await prisma.users.update({
        where: { id: application.users.id },
        data: { role: 'VOLUNTEER' },
      });
    }

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

    res.status(200).json({
      success: true,
      message: 'Application approved successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  } finally {
    await prisma.$disconnect();
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