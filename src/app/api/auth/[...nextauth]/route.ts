import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

interface JWT {
  accessToken?: string;
  githubOwner?: string;
}

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org repo  repo_deployment workflow", 
          prompt: "consent"         
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.githubOwner = user.name; // Ou qualquer outra informação relevante
      }
      return token;
    },
    async session({ session, token }) {
      session.user.token = token.accessToken as string | undefined;
      session.user.githubOwner = token.githubOwner as string | undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
