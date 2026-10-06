import { api } from "./api";

export async function getSiteReport() {
  const report = await api("/admin/reports/");

  return {
    activeUsers: report.active_users,
    topMovies: report.top_movies,
    topSeries: report.top_series,
  };
}
