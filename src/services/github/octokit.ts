// services/github/octokit.ts
import { Octokit } from "octokit";

export function CreateOctokit(token: string) {
  return new Octokit({ auth: token });
}
