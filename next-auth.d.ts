import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      token?: string; // pode ser string ou undefined
      githubOwner?: string; // pode ser string ou undefined
    };
  }
}