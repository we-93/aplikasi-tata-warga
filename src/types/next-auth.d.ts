import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    tenantId?: string | null;
  }
  interface Session {
    user: User;
  }
}
