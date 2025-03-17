import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
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

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    // Get the application
    const application = await prisma.applications.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update application status
    await prisma.applications.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        rejected_by: session.user.id,
        rejected_at: new Date(),
        rejectionReason: reason
      }
    });

    // Send rejection email
    try {
      await sendEmail({
        to: application.email,
        ...emailTemplates.applicationRejected(application, reason)
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Continue with the process even if email sending fails
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Application rejected successfully' 
    });

  } catch (error) {
    console.error('Error rejecting application:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 