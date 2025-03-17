import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export type Role = 'ADMIN' | 'VOLUNTEER' | 'USER';

// Middleware for checking if user is authenticated
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return handler(req, res, session);
  };
}

// Middleware for checking if user has specific role
export function withRole(
  handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>,
  allowedRoles: Role | Role[]
) {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse, session) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(session.user.role as Role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    return handler(req, res, session);
  });
}

// Middleware that only allows admins
export function withAdmin(
  handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>
) {
  return withRole(handler, 'ADMIN');
}

// Middleware that only allows volunteers or admins
export function withVolunteer(
  handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>
) {
  return withRole(handler, ['VOLUNTEER', 'ADMIN']);
} 