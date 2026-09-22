import { getAllArticles } from "$lib/server/external-articles";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { articles: (await getAllArticles()).slice(0, 5) };
};
