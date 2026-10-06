import { getMovies, getGenres } from "./movieService";
import { getRatings } from "./feedbackService";

// Later, replace this function with a catalog API request.
export async function getCatalog() {
  const ratings = getRatings();
  const items = getMovies().map((movie) => {
    const votes = ratings.filter((rating) => rating.movie_id === movie.id);
    return {
      ...movie,
      genre_names: movie.genres,
      rating_count: votes.length,
      average_rating: votes.length ? votes.reduce((total, vote) => total + vote.score, 0) / votes.length : null,
    };
  });
  return { items, genres: getGenres() };
}

