import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signInWithCredentials } from "@/lib/actions/authActions";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          console.log("Credentials received:", credentials);
          const user = await signInWithCredentials(credentials);

          console.log("User received from signInWithCredentials:", user);

          return user;
        } catch (error) {
          console.error("Error validating credentials:", error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = { ...user, name: user.full_name };
      }
      return {
        email: token.email,
        sub: token.sub,
        user: token.user,
      };
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub,
        name: token.user.name,
        email: token.email,
      };
      return session;
    },
  },
});

// export { handler as GET, handler as POST };
