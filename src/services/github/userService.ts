// services/github/userService.ts
import { Octokit } from "octokit";

export async function GetUserData(octokit: Octokit, username: string) {
  try {
    const { data } = await octokit.request("GET /users/{username}", {
      username: username,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });

    return {
      login: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      company: data.company,
      email: data.email,
      location: data.location,
      blog: data.blog,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
    };
  } catch (error) {
    throw new Error("Erro ao buscar dados do usuário.");
  }
}
