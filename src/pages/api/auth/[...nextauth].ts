import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from '@/lib/prisma';

// Add better error logging for production debugging
const logAuthError = (message: string, error?: any) => {
  console.error(`[NextAuth] ${message}`, error || '');
  // In production, you might want to log to an external service
  if (process.env.NODE_ENV === 'production') {
    // Log additional context that might help debugging
    console.error('[NextAuth] Context:', {
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    });
  }
};

export const authOptions: NextAuthOptions = {
  // Removing adapter and handling OAuth manually
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          // Directly use the simplified prisma client
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Password not configured for this account");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password || ''
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return as User type expected by NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role || 'VOLUNTEER',
            image: user.image || '',
          } as User;
        } catch (error: any) {
          logAuthError(`Authentication error: ${error.message}`, error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Increase max age to match session
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.role = user.role as string || 'VOLUNTEER';
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }

        return token;
      } catch (error) {
        logAuthError('JWT callback error', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        logAuthError('Session callback error', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

// Apply a middleware approach to handle errors gracefully
const authHandler = async (req: any, res: any) => {
  try {
    // Remove the initial database connection check as it might be causing issues
    // try {
    //   await prisma.$queryRaw`SELECT 1`;
    // } catch (dbError) {
    //   logAuthError('Database connection check failed', dbError);
    //   return res.status(500).json({ 
    //     error: 'Internal Server Error',
    //     message: 'Could not connect to the database'
    //   });
    // }

    // Run the NextAuth handler
    return await NextAuth(req, res, authOptions);
  } catch (error) {
    logAuthError('Unhandled NextAuth error', error);
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'An unexpected authentication error occurred'
    });
  }
};

export default authHandler; 