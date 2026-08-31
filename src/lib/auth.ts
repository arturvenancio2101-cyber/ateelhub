import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailNormalized = credentials.email.trim().toLowerCase();

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: emailNormalized,
                mode: 'insensitive'
              }
            }
          });

          if (user) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
          }
        } catch (err) {
          console.error("Auth DB Error:", err);
        }

        // Fallback para credenciais padrão
        if (
          (emailNormalized === 'admin@ateel.com.br' || emailNormalized === 'admin@lifehub.com') &&
          credentials.password === 'admin123'
        ) {
          return {
            id: 'admin-fallback-id',
            email: emailNormalized,
            name: 'Admin ATEEL',
            role: 'ADMIN',
          };
        }

        if (
          emailNormalized === 'atendimento@ateel.com.br' &&
          credentials.password === 'membro123'
        ) {
          return {
            id: 'user-fallback-id',
            email: emailNormalized,
            name: 'Membro Atendimento',
            role: 'USER',
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "ateel-secret-for-dev",
};

