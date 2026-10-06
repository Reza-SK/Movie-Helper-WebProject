import { useEffect, useState } from "react";
import { getCatalog } from "../services/discoveryService";

function Discovery() {
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((catalog) => {
        if (cancelled) return;
        setItems(catalog.items);
        setGenres(catalog.genres);
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

  const years = [...new Set(items.map((item) => item.year))].sort(
    (a, b) => b - a,
  );
  const visibleItems = items.filter(
    (item) =>
      (!genre || item.genres.includes(genre)) &&
      (!year || item.year === Number(year)),
  );
  if (sort !== "default") {
    visibleItems.sort((a, b) => {
      // Unrated items stay at the end in either direction.
      if (a.average_rating === null && b.average_rating === null)
        return a.id - b.id;
      if (a.average_rating === null) return 1;
      if (b.average_rating === null) return -1;
      return (
        (sort === "highest"
          ? b.average_rating - a.average_rating
          : a.average_rating - b.average_rating) || a.id - b.id
      );
    });
  }

  if (loading) return <p role="status">Loading movies and series…</p>;
  if (error)
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );

  return (
    <section aria-label="Movies and series">
      <div className="catalog-filters">
        <label>
          Genre
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Release year
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">All years</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by user rating
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="default">Default order</option>
            <option value="highest">Highest rating first</option>
            <option value="lowest">Lowest rating first</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setGenre("");
            setYear("");
            setSort("default");
          }}
        >
          Reset filters
        </button>
      </div>
      <p role="status">
        {visibleItems.length} of {items.length} movies and series
      </p>
      {visibleItems.length === 0 ? (
        <p>No movies or series match these filters.</p>
      ) : (
        <div className="movie-grid">
          {visibleItems.map((item) => (
            <article className="movie-card" key={item.id}>
              <a className="catalog-detail-link" href={`/movie-detail?id=${item.id}`}>
              <div className="poster">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={`${item.title} poster`}
                    loading="lazy"
                  />
                ) : (
                  <div className="sample-poster">
                    <strong>{item.title}</strong>
                  </div>
                )}
                <span className="media-type">
                  {item.type === "series" ? "Series" : "Movie"}
                </span>
              </div>
              <div className="movie-info">
                <h3>{item.title}</h3>
                <p>
                  {item.year} ·{" "}
                  {item.type === "series"
                    ? `${item.seasons} seasons`
                    : `${item.duration_minutes} min`}
                </p>
                <p>{item.genre_names.join(" · ")}</p>
                <p>{item.description}</p>
                <small>
                  {item.average_rating === null
                    ? "No ratings yet"
                    : `Rating: ${item.average_rating.toFixed(1)} / 10 (${item.rating_count} ratings)`}
                </small>
              </div>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Discovery;
