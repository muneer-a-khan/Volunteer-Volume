import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';
import { syncUserWithSupabase } from "@/lib/auth-utils";
import { v4 as uuidv4 } from 'uuid';

export const authOptions: NextAuthOptions = {
  // Removing adapter and handling OAuth manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "VOLUNTEER",
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please login with Google or set a password");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
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
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth account and user creation manually if necessary
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.users.findUnique({
            where: { email: user.email! },
          });
          
          // If user doesn't exist, create it
          if (!existingUser) {
            await prisma.users.create({
              data: {
                id: uuidv4(),
                name: user.name!,
                email: user.email!,
                image: user.image,
                role: "VOLUNTEER",
              },
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during OAuth sign in:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as string || 'VOLUNTEER';
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // For Google sign in, fetch the user from DB for complete info
      if (account?.provider === 'google') {
        try {
          const dbUser = await prisma.users.findUnique({
            where: { email: token.email as string },
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role || 'VOLUNTEER';
          }
        } catch (error) {
          console.error("Error fetching user data for token:", error);
        }
      }
      
      return token;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      // Sync with Supabase
      return syncUserWithSupabase(token, session);
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions); 