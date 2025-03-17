import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';

interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  session: any
) {
  // This route is protected by withAuth middleware
  // Only authenticated users can access it
  
  return res.status(200).json({
    success: true,
    message: 'Protected route accessed successfully',
    data: {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    }
  });
}

export default withAuth(handler); 