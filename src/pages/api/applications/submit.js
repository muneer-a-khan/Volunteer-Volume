import prisma from '../../../lib/prisma';
import { getIdToken } from '../../../lib/aws/cognito';
import { sendEmail } from '../../../lib/aws/sns';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    name, email, phone, address, city, state, zipCode, birthdate,
    volunteerType, covidVaccinated, criminalRecord, criminalExplanation,
    referralSource, volunteerExperience, employmentExperience, reference,
    interests, reasonForVolunteering, volunteerPosition, availability,
    availableDays, agreement
  } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !address || !city || !state || !zipCode || !birthdate || 
      !volunteerType || !covidVaccinated || !criminalRecord || !reference || 
      !reasonForVolunteering || !volunteerPosition || !availability || !availableDays || !agreement) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Additional validation for criminal record explanation
  if (criminalRecord === 'yes' && !criminalExplanation) {
    return res.status(400).json({ message: 'Criminal record explanation is required' });
  }

  // COVID vaccination check - can be configured based on policy
  if (covidVaccinated === 'no') {
    return res.status(400).json({ 
      message: 'Virginia Discovery Museum requires volunteers to be vaccinated against COVID-19'
    });
  }

  try {
    // Create application in database
    const application = await prisma.volunteerApplication.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        birthdate: new Date(birthdate),
        volunteerType,
        covidVaccinated: covidVaccinated === 'yes',
        criminalRecord: criminalRecord === 'yes',
        criminalExplanation: criminalExplanation || null,
        referralSource: referralSource || null,
        volunteerExperience: volunteerExperience || null,
        employmentExperience: employmentExperience || null,
        reference,
        interests: interests || null,
        reasonForVolunteering,
        volunteerPosition,
        availability,
        availableDays: { set: Array.isArray(availableDays) ? availableDays : [availableDays] },
        status: 'PENDING',
        applicationDate: new Date()
      }
    });

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: email,
        subject: 'Virginia Discovery Museum - Volunteer Application Received',
        message: `
          Dear ${name},
          
          Thank you for your interest in volunteering with the Virginia Discovery Museum!
          
          We have received your application for the ${volunteerPosition} position. Our volunteer coordinator will review your application and contact you soon.
          
          If you have any questions, please contact us at volunteers@vadm.org.
          
          Thank you,
          Virginia Discovery Museum Volunteer Team
        `
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue without failing the request
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: 'volunteers@vadm.org', // Replace with actual admin email
        subject: 'New Volunteer Application Received',
        message: `
          A new volunteer application has been received.
          
          Name: ${name}
          Email: ${email}
          Phone: ${phone}
          Position: ${volunteerPosition}
          
          Please log in to the admin dashboard to review the application.
        `
      });
    } catch (adminEmailError) {
      console.error('Error sending admin notification:', adminEmailError);
      // Continue without failing the request
    }

    return res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application.id
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
}