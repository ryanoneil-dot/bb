import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../lib/prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/signin' },
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      // include user id in session
      return { ...session, user: { ...session.user, id: user.id } }
    },
  },
})
