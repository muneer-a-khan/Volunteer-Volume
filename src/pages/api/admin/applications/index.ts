import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface ApplicationResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApplicationResponse[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const applications = await prisma.applications.findMany({
      include: {
        users: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        application_date: 'desc'
      }
    });

    const formattedApplications = applications.map(app => ({
      id: app.id,
      userId: app.user_id,
      name: app.name,
      email: app.email,
      phone: app.phone,
      status: app.status,
      createdAt: app.application_date ? new Date(app.application_date).toISOString() : '',
      updatedAt: app.approved_at || app.rejected_at ? 
        new Date(app.approved_at || app.rejected_at || '').toISOString() : ''
    }));

    return res.status(200).json(mapSnakeToCamel(formattedApplications));
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 