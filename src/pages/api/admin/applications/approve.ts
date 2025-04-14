import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { withAdmin } from '@/middleware/withAuth';
import { sendEmail, emailTemplates } from '@/lib/email';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { applicationId } = req.body;

  if (!applicationId) {
    return res.status(400).json({ message: 'Application ID is required' });
  }

  try {
    // Fetch the application with user details
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: { users: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({
        message: `Application cannot be approved because it is already ${application.status.toLowerCase()}`
      });
    }

    if (!application.user_id) {
      return res.status(400).json({ message: 'No user associated with this application' });
    }

    // Start a transaction to update multiple records
    await prisma.$transaction(async (tx) => {
      // Update application status
      await tx.applications.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          approved_by: session.user.id,
          approved_at: new Date(),
        }
      });

      // Make sure user_id is not null
      if (application.user_id) {
        // Update user role from PENDING to VOLUNTEER
        await tx.users.update({
          where: { id: application.user_id },
          data: { role: 'VOLUNTEER' }
        });

        // Create or update user profile with application data
        const existingProfile = await tx.profiles.findUnique({
          where: { user_id: application.user_id }
        });

        if (existingProfile) {
          await tx.profiles.update({
            where: { user_id: application.user_id },
            data: {
              address: application.address || "",
              city: application.city || "",
              state: application.state || "",
              zip_code: application.zip_code || "",
              birthdate: application.birthdate,
              interests: application.interests || "",
              // Add any other relevant fields from application to profile
            }
          });
        } else {
          await tx.profiles.create({
            data: {
              user_id: application.user_id,
              address: application.address || "",
              city: application.city || "",
              state: application.state || "",
              zip_code: application.zip_code || "",
              birthdate: application.birthdate,
              interests: application.interests || "",
              // Add any other relevant fields from application to profile
            }
          });
        }
      }
    });

    // Send approval email to volunteer
    try {
      if (application.email) {
        await sendEmail({
          to: application.email,
          ...emailTemplates.applicationApproved(application)
        });
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue processing even if email fails
    }

    return res.status(200).json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    return res.status(500).json({ message: 'An error occurred while approving the application' });
  }
}

export default withAdmin(handler); 