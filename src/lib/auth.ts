import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import type { RequestInternal } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req: Pick<RequestInternal, "query" | "headers" | "body" | "method">) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.users.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          throw new Error("Please sign in with Google.");
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        // Return the user with properties that work with NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role ? String(user.role) : undefined, // Convert to string or undefined
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch user details from DB using token.sub (user id)
        const user = await prisma.users.findUnique({
          where: { id: token.sub || "" },
          select: { role: true, id: true } // Select only needed fields
        });

        if (user) {
          session.user.role = user.role ? String(user.role) : "GUEST"; // Convert to string
          session.user.id = user.id;
        } else {
          // Handle case where user is not found in DB, maybe invalidate session?
          console.warn(`User not found for token sub: ${token.sub}`);
          // Setting role to GUEST or similar might be safer than leaving it undefined
          session.user.role = "GUEST"; 
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
       // 'user' is available on initial sign-in
       if (user) {
         token.sub = user.id; // Persist the user id (subject) into the token
         token.role = user.role || "GUEST"; // Use the role from the user
       }
       
       // Fetch role from DB if token exists but role doesn't (e.g., session refresh)
       if (token.sub && !token.role) {
         const dbUser = await prisma.users.findUnique({
           where: { id: token.sub },
           select: { role: true }
         });
         token.role = dbUser?.role ? String(dbUser.role) : "GUEST"; // Convert to string
       }
       
       return token;
    },
    async redirect({ url, baseUrl }) {
      // PENDING users no longer redirected for demo purposes
      
      // Handle standard OAuth signups which might redirect to sign-up first
      if (url.includes('/sign-up') && url.includes('callbackUrl')) {
        // Allow redirecting back to the intended page after sign-up flow
        return url;
      }
      
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect to base URL if none of the above match
      return baseUrl;
    }
  },
}; 