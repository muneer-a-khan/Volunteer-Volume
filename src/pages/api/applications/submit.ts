import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils'; //from '../../../lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

// Define the validation schema for application data
const applicationSchema = z.object({
  // Personal Information (all required)
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  birthdate: z.string().min(1, 'Date of birth is required'),
  volunteerType: z.string().min(1, 'Volunteer type is required'),
  covidVaccinated: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  criminalRecord: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  criminalExplanation: z.string().optional(),
  
  // Experience & Interests (required fields)
  referralSource: z.string().optional(),
  volunteerExperience: z.string().optional(),
  employmentExperience: z.string().min(1, 'Current/previous employment information is required'),
  reference: z.string().min(1, 'Reference is required'),
  interests: z.string().optional(),
  reasonForVolunteering: z.string().min(1, 'Reason for volunteering is required'),
  volunteerPosition: z.string().min(1, 'Volunteer position is required'),
  
  // Availability (all required)
  availability: z.string().min(1, 'Availability is required'),
  availableDays: z.array(z.string()).min(1, 'At least one day must be selected'),
}).refine((data) => {
  // If criminal record is true, then explanation must be provided
  if (data.criminalRecord === true) {
    return !!data.criminalExplanation && data.criminalExplanation.trim() !== '';
  }
  return true;
}, {
  message: "Explanation is required when criminal record is indicated",
  path: ["criminalExplanation"]
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  console.log("Type of req body: ", typeof req.body);
  console.log("Req body: ", req.body);
  try {
    // Validate the request data
    const validatedData = applicationSchema.parse(req.body);
    console.log("Validated Data", validatedData);
    // Check if user with email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email },
      include: {
        applications: {
          where: {
            status: 'INCOMPLETE'
          }
        }
      }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Please register before submitting an application' });
    }

    // Check if this is a pending user updating their application
    const isPendingUser = existingUser.role?.toString() === 'PENDING';

    if (!isPendingUser) {
      return res.status(400).json({ message: 'This user already has an approved account' });
    }

    let application;
    
    // Update existing application if there is one, otherwise create new one
    if (existingUser.applications && existingUser.applications.length > 0) {
      application = await prisma.applications.update({
        where: { id: existingUser.applications[0].id },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zip_code: validatedData.zipCode,
          birthdate: new Date(validatedData.birthdate),
          volunteer_type: validatedData.volunteerType,
          covid_vaccinated: validatedData.covidVaccinated,
          criminal_record: validatedData.criminalRecord,
          criminal_explanation: validatedData.criminalExplanation,
          referral_source: validatedData.referralSource,
          volunteer_experience: validatedData.volunteerExperience,
          employment_experience: validatedData.employmentExperience,
          reference: validatedData.reference,
          interests: validatedData.interests,
          reason_for_volunteering: validatedData.reasonForVolunteering,
          volunteer_position: validatedData.volunteerPosition,
          availability: validatedData.availability,
          available_days: validatedData.availableDays,
          status: 'PENDING', // Now the application is complete and pending approval
        }
      });
    } else {
      application = await prisma.applications.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zip_code: validatedData.zipCode,
          birthdate: new Date(validatedData.birthdate),
          volunteer_type: validatedData.volunteerType,
          covid_vaccinated: validatedData.covidVaccinated,
          criminal_record: validatedData.criminalRecord,
          criminal_explanation: validatedData.criminalExplanation,
          referral_source: validatedData.referralSource,
          volunteer_experience: validatedData.volunteerExperience,
          employment_experience: validatedData.employmentExperience,
          reference: validatedData.reference,
          interests: validatedData.interests,
          reason_for_volunteering: validatedData.reasonForVolunteering,
          volunteer_position: validatedData.volunteerPosition,
          availability: validatedData.availability,
          available_days: validatedData.availableDays,
          status: 'PENDING',
          user_id: existingUser.id,
        }
      });
    }
    //Update row in user table to add phone number if it is not already there
    if (validatedData.phone) {
      await prisma.users.update({
        where: { id: existingUser.id },
        data: { phone: validatedData.phone }
      });
    }
    // Notify admin about new application
    try {
      const admins = await prisma.users.findMany({
        where: { role: 'ADMIN' },
        select: { email: true },
      });
      
      const adminEmails = admins.map(admin => admin.email);
      
      if (adminEmails.length > 0) {
        await sendEmail({
          to: adminEmails.join(','),
          ...emailTemplates.newApplication(validatedData),
        });
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Continue processing even if email fails
    }

    return res.status(201).json({ 
      message: 'Application submitted successfully',
      application: mapSnakeToCamel(application)
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    // Handle other errors
    return res.status(500).json({ message: 'An error occurred while submitting your application' });
  }
} 