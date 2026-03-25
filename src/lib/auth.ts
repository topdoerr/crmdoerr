import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      admin: boolean;
      role: number;
      profileImage: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    admin: boolean;
    role: number;
    profileImage: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    admin: boolean;
    role: number;
    profileImage: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const staff = await prisma.staff.findFirst({
          where: { email: credentials.email },
        });

        if (!staff) {
          throw new Error("No account found with this email");
        }

        if (staff.active !== 1) {
          throw new Error("This account has been deactivated");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          staff.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: String(staff.staffid),
          email: staff.email,
          firstname: staff.firstname,
          lastname: staff.lastname,
          admin: staff.admin === 1,
          role: staff.role,
          profileImage: staff.profile_image,
        };
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
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.admin = user.admin;
        token.role = user.role;
        token.profileImage = user.profileImage;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        firstname: token.firstname,
        lastname: token.lastname,
        admin: token.admin,
        role: token.role,
        profileImage: token.profileImage,
      };
      return session;
    },
  },
};
