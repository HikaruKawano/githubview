// services/github/myRepoService.ts
import { Octokit } from "octokit";

export async function GetRepos(octokit: Octokit): Promise<{ name: string; pulls_url: string }[]> {
  try {
    const repos: { name: string; pulls_url: string }[] = [];
    let page = 1;

    while (true) {
      const { data } = await octokit.request("GET /user/repos", {
        visibility: "all",
        per_page: 20,
        page,
      });

      if (data.length === 0) break;

      repos.push(...data.map((repo: any) => ({
        name: repo.name,
        pulls_url: repo.pulls_url.replace("{/number}", "")
      })));

      page++;
    }

    return repos;
  } catch (error: any) {
    console.error("Erro ao buscar meus repositórios:", error);
    throw new Error("Não foi possível listar os seus repositórios.");
  }
}
