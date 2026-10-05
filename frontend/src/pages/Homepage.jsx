const sampleMovies = [
  { id: 1, title: "Midnight", year: 2025, genre: "Thriller", rating: 8.8, popularity: 98, poster: "/poster-midnight.png" },
  { id: 2, title: "Orbit", year: 2024, genre: "Sci-Fi", rating: 8.5, popularity: 95, poster: "/poster-orbit.png" },
  { id: 3, title: "The Last Journey", year: 2025, genre: "Adventure", rating: 8.2, popularity: 91, poster: null },
  { id: 4, title: "Beyond the Horizon", year: 2023, genre: "Drama", rating: 8.0, popularity: 87, poster: null },
];

function HomePage({ isAuthenticated = false }) {
  const popularMovies = [...sampleMovies]
    .sort((a, b) => b.popularity - a.popularity)
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
        <div className="movie-grid">
          {popularMovies.map((movie) => (
            <article className="movie-card" key={movie.id}>
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
                <span className="media-type">Movie</span>
              </div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>
                  {movie.year} · {movie.genre}
                </p>
                <small>Rating: {movie.rating.toFixed(1)} / 10</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export default HomePage;

