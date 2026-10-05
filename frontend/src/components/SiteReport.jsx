import { useEffect, useState } from "react";
import { getSiteReport } from "../services/reportService";

function Ranking({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {!items.length ? (
        <p>No rated titles yet.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Title</th>
                <th scope="col">Average score</th>
                <th scope="col">Ratings</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <a href={`/movie-detail?id=${item.id}`}>{item.title}</a>
                  </td>
                  <td>{item.average_rating.toFixed(1)} / 10</td>
                  <td>{item.rating_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SiteReport({ user }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    getSiteReport(user)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason.message);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error)
    return (
      <p role="alert" className="form-error">
        {error}
      </p>
    );
  if (!report) return <p role="status">Loading report…</p>;

  return (
    <>
      <section className="panel">
        <h2>Active User accounts & admins</h2>
        <p>
          <strong>{report.activeUsers}</strong>{" "}
        </p>
      </section>
      <Ranking title="Top 5 Highest-rated movies" items={report.topMovies} />
      <Ranking title="Top 5 Highest-rated series" items={report.topSeries} />
    </>
  );
}

export default SiteReport;
