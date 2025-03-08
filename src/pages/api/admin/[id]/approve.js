import prisma from '../../../../../lib/prisma';
import { getIdToken } from '../../../../../lib/aws/cognito';
import { sendEmail } from '../../../../../lib/aws/sns';
import * as cognitoService from '../../../../../lib/aws/cognito';

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

    // Check if user already exists
    let volunteerUser = await prisma.user.findFirst({
      where: { email: application.email }
    });

    // Create a Cognito user account
    try {
      // Generate a temporary password
      const tempPassword = generateTemporaryPassword();
      
      if (!volunteerUser) {
        // Create user in Cognito
        const cognitoUser = await cognitoService.signUp(
          application.email, 
          tempPassword,
          application.name,
          application.phone
        );
        
        // Create user in our database
        volunteerUser = await prisma.user.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            cognitoId: cognitoUser.userSub,
            role: 'VOLUNTEER',
            profile: {
              create: {
                address: application.address,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode,
                birthdate: application.birthdate,
                interests: application.interests
              }
            }
          }
        });
      }

      // Update application status
      await prisma.volunteerApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: user.id,
          approvedAt: new Date(),
          userId: volunteerUser.id
        }
      });

      // Send approval email with login instructions
      await sendEmail({
        to: application.email,
        subject: 'Virginia Discovery Museum - Volunteer Application Approved',
        message: `
          Dear ${application.name},
          
          Congratulations! Your application to volunteer at the Virginia Discovery Museum has been approved.
          
          We have created an account for you to use our volunteer management system. You can log in with the following details:
          
          Email: ${application.email}
          Temporary Password: ${tempPassword}
          
          Please log in at https://volunteer.vadm.org/login and change your password on your first login.
          
          We are excited to have you join our volunteer team! If you have any questions, please contact us at volunteers@vadm.org.
          
          Thank you,
          Virginia Discovery Museum Volunteer Team
        `
      });

      return res.status(200).json({
        message: 'Application approved successfully',
        volunteer: {
          id: volunteerUser.id,
          name: volunteerUser.name,
          email: volunteerUser.email
        }
      });
    } catch (error) {
      console.error('Error creating volunteer account:', error);
      return res.status(500).json({ 
        message: 'Failed to create volunteer account', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error approving application:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Helper function to generate a temporary password
function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}