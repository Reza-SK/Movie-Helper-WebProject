import { api } from "./api";

export async function getCatalog() {
  const movies = await api("/movies/");

  const items = movies.map((movie) => ({
    ...movie,
    genre_names: movie.genres,
  }));

  const genres = [...new Set(items.flatMap((movie) => movie.genres))].sort();

  return { items, genres };
}
