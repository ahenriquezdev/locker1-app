import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (credentials?.id && credentials?.email && credentials?.accessToken) {
          return {
            id: credentials.id,
            email: credentials.email,
            name: credentials.fullName,
            accessToken: credentials.accessToken,
          };
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;

        try {
          const decodedToken = JSON.parse(
            Buffer.from(
              account.access_token.split(".")[1],
              "base64",
            ).toString(),
          );
          token.exp = decodedToken.exp;
        } catch (error) {
          console.error("Error while decoding accessToken", error);
        }
      } else if (user?.accessToken) {
        token.accessToken = user.accessToken;

        try {
          const decodedToken = JSON.parse(
            Buffer.from(user.accessToken.split(".")[1], "base64").toString(),
          );
          token.exp = decodedToken.exp;
        } catch (error) {
          console.error("Error while decoding accessToken from user:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
      }
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }

      if (token?.exp) {
        session.expires = new Date(token.exp * 1000).toISOString();
      }
      return session;
    },
  },
});
