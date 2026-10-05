import ratings from "../data/ratings.json";
import reviews from "../data/reviews.json";
import { getUsers } from "./userService";
import { getMovies } from "./movieService";

function readSaved(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export function getRatings() {
  const saved = readSaved("movie-helper-ratings");
  return [...ratings.filter((rating) => !saved.some((item) => item.user_id === rating.user_id && item.movie_id === rating.movie_id)), ...saved];
}

export function getReviews() {
  return [...reviews, ...readSaved("movie-helper-reviews")];
}

export function userKey(user) {
  return user.id ?? `demo:${user.username}`;
}

export async function getFeedback(movieId) {
  const name = (item) => getUsers().find((user) => user.id === item.user_id)?.display_name || item.username || "User";
  return {
    ratings: getRatings().filter((item) => item.movie_id === movieId).map((item) => ({ ...item, author: name(item) })),
    reviews: getReviews().filter((item) => item.movie_id === movieId).map((item) => ({ ...item, author: name(item) })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  };
}

// Replace this local persistence with a feedback API request later.
export async function saveFeedback(movieId, user, score, comment) {
  if (!user?.username || !user.is_active) throw new Error("Please log in to submit feedback.");
  if (!getMovies().some((movie) => movie.id === movieId)) throw new Error("Movie not found.");
  const text = comment.trim();
  const number = score === "" ? null : Number(score);
  if (number === null && !text) throw new Error("Choose a rating or write a review.");
  if (number !== null && (!Number.isInteger(number) || number < 1 || number > 10)) throw new Error("Rating must be between 1 and 10.");
  if (text.length > 2000) throw new Error("Review must be at most 2000 characters.");
  const base = { user_id: userKey(user), username: user.username, movie_id: movieId, created_at: new Date().toISOString() };
  if (number !== null) {
    const saved = readSaved("movie-helper-ratings").filter((item) => !(item.user_id === base.user_id && item.movie_id === movieId));
    saved.push({ ...base, id: crypto.randomUUID(), score: number });
    localStorage.setItem("movie-helper-ratings", JSON.stringify(saved));
  }
  if (text) {
    const saved = readSaved("movie-helper-reviews");
    saved.push({ ...base, id: crypto.randomUUID(), comment: text });
    localStorage.setItem("movie-helper-reviews", JSON.stringify(saved));
  }
}


