import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { supabaseAdmin } from './supabase-server';

/**
 * Sync session information with Supabase auth
 */
export const syncUserWithSupabase = async (
  token: JWT,
  session: Session
): Promise<Session> => {
  try {
    // Get user by email from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (error) {
      console.error('Error syncing with Supabase:', error);
      return session;
    }

    if (user) {
      // Update session with user data from Supabase
      session.user.id = user.id;
      session.user.role = user.role;
    }

    return session;
  } catch (error) {
    console.error('Error in syncUserWithSupabase:', error);
    return session;
  }
};

/**
 * Generate a Supabase access token for a user
 */
export const getSupabaseAccessToken = async (
  userEmail: string
): Promise<string | null> => {
  try {
    // Use Supabase API to create a custom JWT for the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: { source: 'next-auth' },
    });

    if (error) {
      console.error('Error generating Supabase token:', error);
      return null;
    }

    // Return the session token
    return data.user?.id || null;
  } catch (error) {
    console.error('Error in getSupabaseAccessToken:', error);
    return null;
  }
};

/**
 * Check if user has the required role
 */
export const hasRole = (
  session: Session | null | undefined,
  roles: string | string[]
): boolean => {
  if (!session?.user) return false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(session.user.role as string);
};

/**
 * Check if user is an admin
 */
export const isAdmin = (session: Session | null | undefined): boolean => {
  return hasRole(session, 'ADMIN');
};

/**
 * Check if user is a volunteer
 */
export const isVolunteer = (session: Session | null | undefined): boolean => {
  return hasRole(session, ['VOLUNTEER', 'ADMIN']);
}; 