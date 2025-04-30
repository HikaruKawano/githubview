// services/github/orgService.ts
import { Octokit } from "octokit";

export async function GetOwnerType(octokit: Octokit, owner: string): Promise<"org" | "user"> {
  try {
    await octokit.request("GET /orgs/{org}", { org: owner });
    return "org";
  } catch {
    try {
      await octokit.request("GET /users/{username}", { username: owner });
      return "user";
    } catch {
      throw new Error("Usuário ou organização não encontrados.");
    }
  }
}
