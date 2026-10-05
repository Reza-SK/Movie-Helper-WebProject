import { getUsers } from "./userService";
import { getMovies } from "./movieService";
import { getRatings, getReviews } from "./feedbackService";

export async function getAllFeedback(user) {
  if (user?.role !== "admin" || !user.is_active) throw new Error("Admin access required.");
  const prepare = (entries) => entries.map((entry) => ({
    ...entry,
    author: getUsers().find((person) => person.id === entry.user_id)?.username || entry.username || "Unknown user",
    movie_title: getMovies().find((movie) => movie.id === entry.movie_id)?.title || "Unavailable title",
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { scores: prepare(getRatings()), reviews: prepare(getReviews()) };
}


