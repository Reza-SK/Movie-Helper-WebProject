import { useEffect, useState } from "react";
import { getCatalog } from "../services/discoveryService";

function HomePage({ isAuthenticated = false }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((catalog) => {
        if (cancelled) return;
        setMovies(catalog.items);
        setLoading(false);
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const popularMovies = movies
    .filter((movie) => movie.average_rating !== null)
    .sort((a, b) => b.average_rating - a.average_rating || a.id - b.id)
    .slice(0, 4);

  return (
    <div className="public-home">
      <nav className="public-nav">
        <a className="brand" href="/">
          Movie Helper
        </a>
        <div>
          {isAuthenticated ? (
            <a className="primary" href="/dashboard">
              Dashboard
            </a>
          ) : (
            <>
              <a className="primary" href="/login">
                Log in
              </a>

              <a className="primary" href="/signup">
                Sign up
              </a>
            </>
          )}
        </div>
      </nav>
      <header className="home-intro">
        <span className="eyebrow">A little less scrolling</span>
        <h1>
          Your next great
          <br />
          <em>story awaits.</em>
        </h1>
        <p>
          Discover movies and series, rate what you watch, and get
          recommendations shaped by your taste.
        </p>
        {!isAuthenticated ? (
          <a className="primary" href="/signup">
            Sign up to explore movies & series
          </a>
        ) : null}
      </header>
      <section className="page home-catalog">
        <div className="section-heading">
          <h2>Popular Movies</h2>
        </div>
        {loading && <p role="status">Loading popular movies…</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && popularMovies.length === 0 && (
          <p>No movies available yet.</p>
        )}
        <div className="movie-grid">
          {popularMovies.map((movie) => (
            <article className="movie-card" key={movie.id}>
              <a
                className="catalog-detail-link"
                href={`/movie-detail?id=${movie.id}`}
              >
                <div className="poster">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={`${movie.title} poster`}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="sample-poster"
                      aria-label={`${movie.title} sample poster`}
                    >
                      <span>Movie Helper</span>
                      <strong>{movie.title}</strong>
                    </div>
                  )}
                  <span className="media-type">
                    {movie.type === "series" ? "Series" : "Movie"}
                  </span>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>
                    {movie.year} · {movie.genre_names.join(" · ")}
                  </p>
                  <small>
                    {movie.average_rating === null
                      ? "No ratings yet"
                      : `Rating: ${movie.average_rating.toFixed(1)} / 10 (${movie.rating_count} ratings)`}
                  </small>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export default HomePage;
