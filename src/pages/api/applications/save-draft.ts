import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current user from session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    // Get user ID from session
    const userId = session.user.id;
    
    // Get form data from request body
    const formData = req.body;
    
    // Transform camelCase to snake_case for database (prisma doesn't do this automatically)
    const dbData = mapCamelToSnake(formData);
    
    // Add user_id to data
    dbData.user_id = userId;
    
    // Check if user already has an application
    const existingApplication = await prisma.applications.findFirst({
      where: {
        user_id: userId
      }
    });

    let application;
    
    if (existingApplication) {
      // Update existing application
      application = await prisma.applications.update({
        where: { id: existingApplication.id },
        data: {
          // Only update fields that are present in the form data
          ...(dbData.name && { name: dbData.name }),
          ...(dbData.email && { email: dbData.email }),
          ...(dbData.phone && { phone: dbData.phone }),
          ...(dbData.address && { address: dbData.address }),
          ...(dbData.city && { city: dbData.city }),
          ...(dbData.state && { state: dbData.state }),
          ...(dbData.zip_code && { zip_code: dbData.zip_code }),
          ...(dbData.birthdate && { birthdate: new Date(dbData.birthdate) }),
          ...(dbData.volunteer_type && { volunteer_type: dbData.volunteer_type }),
          ...(dbData.covid_vaccinated !== undefined && { covid_vaccinated: dbData.covid_vaccinated }),
          ...(dbData.criminal_record !== undefined && { criminal_record: dbData.criminal_record }),
          ...(dbData.criminal_explanation && { criminal_explanation: dbData.criminal_explanation }),
          ...(dbData.referral_source && { referral_source: dbData.referral_source }),
          ...(dbData.volunteer_experience && { volunteer_experience: dbData.volunteer_experience }),
          ...(dbData.employment_experience && { employment_experience: dbData.employment_experience }),
          ...(dbData.reference && { reference: dbData.reference }),
          ...(dbData.interests && { interests: dbData.interests }),
          ...(dbData.reason_for_volunteering && { reason_for_volunteering: dbData.reason_for_volunteering }),
          ...(dbData.volunteer_position && { volunteer_position: dbData.volunteer_position }),
          ...(dbData.availability && { availability: dbData.availability }),
          ...(dbData.available_days && { available_days: dbData.available_days }),
          status: 'INCOMPLETE',
        }
      });
    } else {
      // Create new application
      application = await prisma.applications.create({
        data: {
          name: dbData.name || '',
          email: dbData.email || '',
          phone: dbData.phone || '',
          address: dbData.address || '',
          city: dbData.city || '',
          state: dbData.state || '',
          zip_code: dbData.zip_code || '',
          birthdate: dbData.birthdate ? new Date(dbData.birthdate) : new Date(),
          volunteer_type: dbData.volunteer_type || '',
          covid_vaccinated: dbData.covid_vaccinated === true,
          criminal_record: dbData.criminal_record === true,
          criminal_explanation: dbData.criminal_explanation || '',
          referral_source: dbData.referral_source || '',
          volunteer_experience: dbData.volunteer_experience || '',
          employment_experience: dbData.employment_experience || '',
          reference: dbData.reference || '',
          interests: dbData.interests || '',
          reason_for_volunteering: dbData.reason_for_volunteering || '',
          volunteer_position: dbData.volunteer_position || '',
          availability: dbData.availability || '',
          available_days: dbData.available_days || [],
          status: 'INCOMPLETE',
          user_id: userId,
        }
      });
    }

    // Return success
    return res.status(200).json({ 
      message: 'Application draft saved successfully',
      application: mapSnakeToCamel(application)
    });
  } catch (error) {
    console.error('Error saving application draft:', error);
    return res.status(500).json({ message: 'An error occurred while saving your application' });
  }
} 