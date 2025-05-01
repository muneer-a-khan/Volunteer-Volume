import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import from the new central location

// Create the handler with explicit named exports
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 