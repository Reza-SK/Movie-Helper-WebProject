import sampleMovies from "../data/movies.json";
import genres from "../data/genres.json";
import { getUsers } from "./userService";

const key = "movie-helper-movies";
export function getMovies() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) return saved;
  } catch { /* Use sample data. */ }
  return sampleMovies;
}
function requireAdmin(actor) {
  const current = getUsers().find((user) => user.id === actor?.id);
  if (current?.role !== "admin" || !current.is_active) throw new Error("Admin access required.");
}
export async function listMovies(actor) {
  requireAdmin(actor);
  return { movies: getMovies(), genres };
}
export async function saveMovie(actor, id, values) {
  requireAdmin(actor);
  const movies = getMovies();
  const original = movies.find((movie) => movie.id === id);
  if (id != null && !original) throw new Error("Title not found.");
  const year = Number(values.year);
  const duration = Number(values.duration_minutes);
  const seasons = Number(values.seasons);
  if (!values.title.trim() || !values.description.trim()) throw new Error("Title and description are required.");
  if (!Number.isInteger(year) || year < 1888 || year > 2100) throw new Error("Enter a release year between 1888 and 2100.");
  if (!["movie", "series"].includes(values.type)) throw new Error("Invalid type.");
  if (values.type === "movie" && (!Number.isInteger(duration) || duration < 1)) throw new Error("Enter a positive duration in minutes.");
  if (values.type === "series" && (!Number.isInteger(seasons) || seasons < 1)) throw new Error("Enter a positive number of seasons.");
  if (!values.genre_ids.length || values.genre_ids.some((id) => !genres.some((genre) => genre.id === id))) throw new Error("Select at least one valid genre.");
  const poster = values.poster.trim();
  if (poster && !/^\/(?!\/)|^https?:\/\//i.test(poster)) throw new Error("Poster must be a local path starting with / or an HTTP(S) URL.");
  const result = {
    id: id ?? Math.max(Date.now(), ...movies.map((movie) => movie.id + 1)), title: values.title.trim(), description: values.description.trim(),
    year, type: values.type, poster: poster || null, genre_ids: [...new Set(values.genre_ids)],
    duration_minutes: values.type === "movie" ? duration : null,
    seasons: values.type === "series" ? seasons : null,
    created_at: original?.created_at || new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(id == null ? [...movies, result] : movies.map((movie) => movie.id === id ? result : movie)));
  return result;
}
export async function deleteMovie(actor, id) {
  requireAdmin(actor);
  const movies = getMovies();
  if (!movies.some((movie) => movie.id === id)) throw new Error("Title not found.");
  localStorage.setItem(key, JSON.stringify(movies.filter((movie) => movie.id !== id)));
}
