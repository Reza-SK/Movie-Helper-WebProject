import { api } from "./api";

async function getAllPages(path) {
  const items = [];
  let page = 1;

  while (true) {
    const result = await api(`${path}?page=${page}`);
    items.push(...result.results);

    if (!result.next) return items;
    page += 1;
  }
}

export async function getAllFeedback() {
  const [scores, reviews] = await Promise.all([
    getAllPages("/admin/ratings/"),
    getAllPages("/admin/reviews/"),
  ]);

  return { scores, reviews };
}
