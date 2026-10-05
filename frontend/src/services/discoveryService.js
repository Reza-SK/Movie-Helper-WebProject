import { getMovies } from "./movieService";
import genres from "../data/genres.json";
import { getRatings } from "./feedbackService";

// Later, replace this function with a catalog API request.
export async function getCatalog() {
  const ratings = getRatings();
  const items = getMovies().map((movie) => {
    const votes = ratings.filter((rating) => rating.movie_id === movie.id);
    return {
      ...movie,
      genre_names: movie.genre_ids.map((id) => genres.find((genre) => genre.id === id)?.name).filter(Boolean),
      rating_count: votes.length,
      average_rating: votes.length ? votes.reduce((total, vote) => total + vote.score, 0) / votes.length : null,
    };
  });
  return { items, genres };
}

