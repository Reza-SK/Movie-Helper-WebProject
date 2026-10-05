import { useEffect, useState } from "react";
import { getCatalog } from "../services/discoveryService";
import {
  getFeedback,
  saveFeedback,
  userKey,
} from "../services/feedbackService";

function MovieDetail({ movieId, user, isAuthenticated }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCatalog(), getFeedback(movieId)])
      .then(([catalog, feedback]) => {
        if (cancelled) return;
        const movie = catalog.items.find((item) => item.id === movieId);
        if (movie) {
          setDetail({ movie, ...feedback });
          const vote = feedback.ratings.find(
            (item) => item.user_id === userKey(user),
          );
          setScore(vote ? String(vote.score) : "");
        }
        setLoading(false);
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [movieId, user]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveFeedback(movieId, user, score, comment);
      const [catalog, feedback] = await Promise.all([
        getCatalog(),
        getFeedback(movieId),
      ]);
      setDetail({
        movie: catalog.items.find((item) => item.id === movieId),
        ...feedback,
      });
      setComment("");
      setMessage("Feedback saved in this browser.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="page">
        <p role="status">Loading…</p>
      </main>
    );
  if (!detail)
    return (
      <main className="page">
        <h1>Movie not found</h1>
        <p>{error}</p>
        <a href="/dashboard">Back to dashboard</a>
      </main>
    );
  const { movie, ratings, reviews } = detail;

  return (
    <main className="page detail-page">
      <section className="detail-hero">
        <div className="poster">
          {movie.poster ? (
            <img src={movie.poster} alt={`${movie.title} poster`} />
          ) : (
            <div className="sample-poster">
              <strong>{movie.title}</strong>
            </div>
          )}
        </div>
        <div>
          <h1>{movie.title}</h1>
          <p>
            {movie.type === "series" ? "Series" : "Movie"} · {movie.year} ·{" "}
            {movie.type === "series"
              ? `${movie.seasons} seasons`
              : `${movie.duration_minutes} minutes`}
          </p>
          <p>{movie.genre_names.join(" · ")}</p>
          <p>{movie.description}</p>
          <p>
            {movie.average_rating === null
              ? "No ratings yet"
              : `Average rating: ${movie.average_rating.toFixed(1)} / 10 (${movie.rating_count} ratings)`}
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>User ratings</h2>
        {ratings.length ? (
          <ul>
            {ratings.map((rating) => (
              <li key={rating.id}>
                {rating.author}: {rating.score} / 10
              </li>
            ))}
          </ul>
        ) : (
          <p>No ratings yet.</p>
        )}
      </section>
      <section className="panel">
        <h2>User reviews</h2>
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review.id} className="detail-review">
              <strong>{review.author}</strong>
              <p>{review.comment}</p>
              <time dateTime={review.created_at}>
                {new Date(review.created_at).toLocaleDateString("en-GB", {
                  timeZone: "Asia/Tehran",
                })}
              </time>
            </article>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </section>
      {isAuthenticated ? (
        <section className="panel">
          {isAuthenticated ? (
            <>
              <h2>Your rating and review</h2>
              <form onSubmit={submit}>
                <label>
                  Rating (one per movie; saving updates your previous rating)
                  <select
                    value={score}
                    disabled={saving}
                    onChange={(event) => setScore(event.target.value)}
                  >
                    <option value="">No rating selected</option>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                      (value) => (
                        <option key={value} value={value}>
                          {value} / 10
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Review
                  <textarea
                    value={comment}
                    maxLength={2000}
                    disabled={saving}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </label>
                <button disabled={saving} type="submit">
                  {saving ? "Saving…" : "Submit feedback"}
                </button>
              </form>
            </>
          ) : null}

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success-message">
              {message}
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}

export default MovieDetail;
