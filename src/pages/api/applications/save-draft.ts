import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next'; // Removed
import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/lib/auth'; // Removed
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // const session = await getServerSession(req, res, authOptions); // Removed
  // if (!session?.user?.id) { // Removed
  //     return res.status(401).json({ message: 'Unauthorized' }); // Removed
  // }
  // const userId = session.user.id; // Removed

  const { formData } = req.body;

  try {
    await prisma.$connect();
    // Need userId to associate draft with a user.
    // Cannot save draft without authentication.
    return res.status(501).json({ message: 'Saving draft requires authentication (currently disabled)' });

    /* Original logic:
    await prisma.application_drafts.upsert({
        where: { user_id: userId }, // Needs userId
        update: {
            form_data: formData,
        },
        create: {
            user_id: userId, // Needs userId
            form_data: formData,
        },
    });
    res.status(200).json({ message: 'Draft saved successfully' });
    */
  } catch (error) {
    console.error('Error saving application draft:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
} 