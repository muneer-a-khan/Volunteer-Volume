import { NextApiRequest, NextApiResponse } from 'next';
import { withAdmin } from '@/middleware/withAuth';

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
  // This route is protected by withAdmin middleware
  // Only users with ADMIN role can access it
  
  return res.status(200).json({
    success: true,
    message: 'Admin route accessed successfully',
    data: {
      adminUser: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    }
  });
}

export default withAdmin(handler); 