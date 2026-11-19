import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://b.tashkentlawschool.uz").replace(/\/+$/, "");

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          try {
            const res = await axios.post(
              `${API_URL}/api/auth/login`,
              {
                email: credentials.email,
                password: credentials.password,
              }
            );

            if (res.data.success && res.data.data) {
              return {
                id: res.data.data.admin.id.toString(),
                email: res.data.data.admin.email,
                name: res.data.data.admin.full_name || res.data.data.admin.email,
                token: res.data.data.token,
              };
            }
            return null;
          } catch {
            return null;
          }
        },
    }),
  ],
  callbacks: {
      async jwt({ token, user }) {
        if (user) {
          (token as any).token = (user as any).token;
          (token as any).id = user.id;
        }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).token = token.token;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
