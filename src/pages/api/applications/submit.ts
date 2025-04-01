import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils'; //from '../../../lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

// Define the validation schema for application data
const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  birthdate: z.string().min(1, 'Date of birth is required'),
  volunteerType: z.string().min(1, 'Volunteer type is required'),
  covidVaccinated: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  criminalRecord: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  criminalExplanation: z.string().optional(),
  referralSource: z.string().optional(),
  volunteerExperience: z.string().optional(),
  employmentExperience: z.string().optional(),
  reference: z.string().min(1, 'Reference is required'),
  interests: z.string().optional(),
  reasonForVolunteering: z.string().min(1, 'Reason for volunteering is required'),
  volunteerPosition: z.string().min(1, 'Volunteer position is required'),
  availability: z.string().min(1, 'Availability is required'),
  availableDays: z.array(z.string()).min(1, 'At least one day must be selected'),
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
    });

    // Create application record
    const application = await prisma.applications.create({
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
        user_id: existingUser?.id || null,
      },
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: validatedData.email,
        ...emailTemplates.applicationReceived(application)
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with the process even if email sending fails
    }

    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid application data',
        errors: error.errors,
      });
    }
    return res.status(500).json({ message: 'Something went wrong' });
  }
} 