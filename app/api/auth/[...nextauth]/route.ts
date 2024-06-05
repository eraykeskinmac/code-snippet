import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GithubProvider from 'next-auth/providers/github';

const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: isProd ? process.env.GITHUB_ID! : process.env.GITHUB_LOCAL_ID!,
      clientSecret: isProd
        ? process.env.GITHUB_SECRET!
        : process.env.GITHUB_LOCAL_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
