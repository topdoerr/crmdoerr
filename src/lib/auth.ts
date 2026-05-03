import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const missingEnv = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"].filter(
  (k) => !process.env[k]
);
if (missingEnv.length > 0) {
  throw new Error(
    `[auth] missing required env vars: ${missingEnv.join(", ")}. ` +
      `Add them to .env.local (see .env.example) and restart the dev server.`
  );
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      admin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    admin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    admin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[auth] missing email or password");
            throw new Error("Email and password are required");
          }

          const staff = await prisma.staff.findFirst({
            where: { email: credentials.email },
          });

          if (!staff) {
            console.error("[auth] no staff found for email:", credentials.email);
            throw new Error("No account found with this email");
          }

          if (staff.active !== 1) {
            console.error("[auth] staff inactive:", credentials.email, "active=", staff.active);
            throw new Error("This account has been deactivated");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            staff.password
          );

          if (!isPasswordValid) {
            console.error("[auth] invalid password for:", credentials.email);
            throw new Error("Invalid password");
          }

          return {
            id: String(staff.staffid),
            email: staff.email,
            firstName: staff.firstName,
            lastName: staff.lastName,
            admin: staff.admin === 1,
          };
        } catch (err) {
          console.error("[auth] authorize() threw:", err);
          throw err;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.admin = user.admin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        admin: token.admin,
      };
      return session;
    },
  },
};
