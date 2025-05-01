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
        // Solicitar permissões adicionais para acessar organizações
        params: {
          scope: "read:org user repo",  // Permissões necessárias para ler dados de organização
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Página de login personalizada (se houver)
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Adiciona o token e o githubOwner no JWT se ainda não estiverem
      if (account && user) {
        token.accessToken = account.access_token;
        token.githubOwner = user.name; // Ou qualquer outra informação relevante
      }
      return token;
    },
    async session({ session, token }) {
      // Tipando o token corretamente
      session.user.token = token.accessToken as string | undefined;
      session.user.githubOwner = token.githubOwner as string | undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Garantir que o redirecionamento após login vá para a página inicial
      return baseUrl; // Redireciona para a URL base (geralmente a página inicial)
    },
  },
});

export { handler as GET, handler as POST };
