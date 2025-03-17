import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

interface ResponseData {
  success: boolean;
  message: string;
  remindersSent: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed',
      remindersSent: 0
    });
  }

  // Verify the request is from GitHub Actions
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ACTIONS_TOKEN}`) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized',
      remindersSent: 0
    });
  }

  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        remindersSent: 0
      });
    }

    // Get current time in the America/New_York timezone
    const now = new Date();
    // Log the server time for debugging timezone issues
    console.log(`Server time: ${now.toISOString()}`);
    console.log(`Local time string: ${now.toString()}`);
    
    // Find shifts that are exactly 1 hour away (with a 5-minute window)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const fiveMinutesBefore = new Date(oneHourFromNow.getTime() - 5 * 60 * 1000); // 5 minutes before the 1-hour mark
    const fiveMinutesAfter = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000); // 5 minutes after the 1-hour mark

    console.log(`Looking for shifts between: ${fiveMinutesBefore.toISOString()} and ${fiveMinutesAfter.toISOString()}`);

    const upcomingShifts = await prisma.shift.findMany({
      where: {
        start_time: {
          gte: fiveMinutesBefore,
          lte: fiveMinutesAfter
        },
        status: 'OPEN'
      },
      include: {
        volunteers: true,
        location: true, // Include location details if available
        group: true // Include group details if available
      }
    });

    console.log(`Found ${upcomingShifts.length} upcoming shifts`);

    let remindersSent = 0;

    // Send reminders for each shift
    for (const shift of upcomingShifts) {
      console.log(`Processing shift: ${shift.id}, starting at ${shift.start_time}, with ${shift.volunteers.length} volunteers`);
      
      for (const volunteer of shift.volunteers) {
        try {
          await sendEmail({
            to: volunteer.email,
            ...emailTemplates.shiftReminder({
              ...shift,
              // Format the datetime for display
              start_time: new Date(shift.start_time).toLocaleString('en-US', {
                timeZone: 'America/New_York',
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }),
              // Include location name if available
              location: shift.location?.name || shift.location || 'TBD'
            })
          });
          remindersSent++;
          console.log(`Sent reminder to ${volunteer.email} for shift at ${shift.start_time}`);
        } catch (emailError) {
          console.error(`Error sending reminder to ${volunteer.email}:`, emailError);
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Shift reminders processed successfully. Found ${upcomingShifts.length} shifts.`,
      remindersSent
    });

  } catch (error) {
    console.error('Error processing shift reminders:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      remindersSent: 0
    });
  }
} 