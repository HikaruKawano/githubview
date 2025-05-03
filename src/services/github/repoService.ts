// services/github/myRepoService.ts
import { Octokit } from "octokit";

export async function GetRepos(octokit: Octokit): Promise<string[]> {
  try {
    const repos: string[] = [];
    let page = 1;

    // Paginação: obtém até 100 repos por página enquanto houver resultados
    while (true) {
      const { data } = await octokit.request("GET /user/repos", {
        visibility: "all",    // 'all' retorna públicos e privados
        per_page: 100,        // máximo permitido
        page,
      });

      if (data.length === 0) break;
      repos.push(...data.map((repo: any) => repo.name));
      page++;
    }

    return repos;
  } catch (error: any) {
    console.error("Erro ao buscar meus repositórios:", error);
    throw new Error("Não foi possível listar os seus repositórios.");
  }
}
