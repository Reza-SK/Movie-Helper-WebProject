import { api } from "./api";

export async function listMovies() {
  const movies = await api("/admin/movies/");

  const genres = [...new Set(movies.flatMap((movie) => movie.genres))].sort();

  return { movies, genres };
}

export function saveMovie(actor, id, values) {
  const isSeries = values.type === "series";

  const data = {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    year: Number(values.year),
    genres: values.genres,
    poster: values.poster.trim(),
    duration_minutes: isSeries ? null : Number(values.duration_minutes),
    seasons: isSeries ? Number(values.seasons) : null,
  };

  return api(id == null ? "/admin/movies/" : `/admin/movies/${id}/`, {
    method: id == null ? "POST" : "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMovie(actor, id) {
  return api(`/admin/movies/${id}/`, {
    method: "DELETE",
  });
}
