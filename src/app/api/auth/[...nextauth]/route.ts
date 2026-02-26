import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/auth";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/register",
  },
  callbacks: {
    async session({ session }) {
      if (session.user) {
        (session.user as Record<string, unknown>).isAdmin = isAdminEmail(session.user.email);
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
