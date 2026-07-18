import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import type { UserRole } from "@/types";

/**
 * Credentials provider backed by a pluggable user lookup. Swap
 * `findUserByEmail` for a real DB call (see docs/DATABASE.md) — the auth
 * config itself doesn't need to change.
 *
 * Passwords: this demo compares against a bcrypt hash placeholder. Wire in
 * `bcrypt.compare` once a real user table exists; never store or compare
 * plaintext passwords.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface DemoUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

// Demo-only in-memory user store. Replace with a real repository.
const DEMO_USERS: DemoUser[] = [
  { id: "u1", email: "organizer@fifa2026.demo", passwordHash: "demo-hash", role: "organizer" },
  { id: "u2", email: "volunteer@fifa2026.demo", passwordHash: "demo-hash", role: "volunteer" },
];

async function findUserByEmail(email: string): Promise<DemoUser | undefined> {
  return DEMO_USERS.find((u) => u.email === email);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user) return null;

        // Placeholder check — replace with:
        //   const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        const valid = parsed.data.password.length >= 8;
        if (!valid) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role: UserRole }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: UserRole }).role = token.role as UserRole;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
