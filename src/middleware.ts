import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login, /register, /forgot-password (auth pages)
     * - /api/auth/* (NextAuth API routes)
     * - /_next/static, /_next/image (Next.js internals)
     * - /favicon.ico, /images/*, /assets/* (static assets)
     */
    "/((?!login|register|forgot-password|api/auth|_next/static|_next/image|favicon\\.ico|images|assets).*)",
  ],
};
