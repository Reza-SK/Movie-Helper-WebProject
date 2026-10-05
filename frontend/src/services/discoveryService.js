import movies from "../data/movies.json";
import genres from "../data/genres.json";
import ratings from "../data/ratings.json";

// Later, replace this function with a catalog API request.
export async function getCatalog() {
  const items = movies.map((movie) => {
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
