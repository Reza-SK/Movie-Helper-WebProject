import { getUsers } from "./userService";
import { getCatalog } from "./discoveryService";

export async function getSiteReport(user) {
  if (user?.role !== "admin" || !user.is_active)
    throw new Error("Admin access required.");
  const { items } = await getCatalog();
  const ranked = items
    .filter((item) => item.average_rating !== null)
    .sort((a, b) => b.average_rating - a.average_rating || a.id - b.id);
  return {
    activeUsers: getUsers().filter((person) => person.is_active).length,
    topMovies: ranked.filter((item) => item.type === "movie").slice(0, 5),
    topSeries: ranked.filter((item) => item.type === "series").slice(0, 5),
  };
}

