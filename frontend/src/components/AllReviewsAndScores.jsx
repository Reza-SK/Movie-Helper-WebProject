import { useEffect, useState } from "react";
import { getAllFeedback } from "../services/adminFeedbackService";

const pageSize = 20;

function AllReviewsAndScores({ user }) {
  const [tab, setTab] = useState("scores");
  const [data, setData] = useState({ scores: [], reviews: [] });
  const [pages, setPages] = useState({ scores: 1, reviews: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllFeedback(user).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason.message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return <p role="status">Loading scores and reviews…</p>;
  if (error) return <p className="form-error" role="alert">{error}</p>;

  const entries = data[tab];
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(pages[tab], totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleEntries = entries.slice(start, start + pageSize);
  const changePage = (page) => setPages((current) => ({ ...current, [tab]: page }));

  return (
    <section className="panel" aria-label="All user feedback">
      <div className="profile-tabs" aria-label="Feedback categories">
        <button type="button" aria-pressed={tab === "scores"} onClick={() => setTab("scores")}>Scores ({data.scores.length})</button>
        <button type="button" aria-pressed={tab === "reviews"} onClick={() => setTab("reviews")}>Reviews ({data.reviews.length})</button>
      </div>
      <h2>{tab === "scores" ? "User scores" : "User reviews"}</h2>
      {!entries.length ? <p>No {tab} yet.</p> : (
        <>
          <p role="status">Showing {start + 1}–{Math.min(start + pageSize, entries.length)} of {entries.length}</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">User</th><th scope="col">Movie / Series</th><th scope="col">{tab === "scores" ? "Score" : "Review"}</th><th scope="col">Date</th></tr></thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.author}</td>
                    <td><a href={`/movie-detail?id=${entry.movie_id}`}>{entry.movie_title}</a></td>
                    <td className={tab === "reviews" ? "admin-review-text" : undefined}>{tab === "scores" ? `${entry.score} / 10` : entry.comment}</td>
                    <td><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Tehran" })}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="feedback-pagination" aria-label={`${tab} pagination`}>
            <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>Next</button>
          </nav>
        </>
      )}
    </section>
  );
}

export default AllReviewsAndScores;
