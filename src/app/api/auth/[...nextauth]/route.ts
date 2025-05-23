// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org repo repo_deployment workflow",
          prompt: "consent"
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login // Garantindo que o login está incluído no perfil
        };
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token && profile) {
        token.accessToken = account.access_token;
        // Usando type assertion para garantir que profile tem login
        const githubProfile = profile as { login?: string };
        token.githubOwner = githubProfile.login;
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