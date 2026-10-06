import { useEffect, useState } from "react";
import { listMovies, saveMovie, deleteMovie } from "../services/movieService";

const emptyForm = {
  title: "",
  description: "",
  year: "",
  type: "movie",
  poster: "",
  genres: [],
  duration_minutes: "",
  seasons: "",
};
function ManageMovies({ user }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newGenre, setNewGenre] = useState("");
  useEffect(() => {
    let active = true;
    listMovies(user)
      .then((data) => {
        if (active) {
          setMovies(data.movies);
          setGenres(data.genres);
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await saveMovie(user, editId, form);
      const data = await listMovies(user);
      setMovies(data.movies);
      setGenres(data.genres);
      setForm(null);
      setNewGenre("");
      setMessage("Title saved successfully.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteMovie(user, removing.id);
      const data = await listMovies(user);
      setMovies(data.movies);
      setGenres(data.genres);
      setRemoving(null);
      setMessage("Title deleted.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <p role="status">Loading movies and series…</p>;
  const addGenre = () => {
    const name = newGenre.trim();
    if (!name || !form || busy) return;

    const existing = genres.find(
      (genre) => genre.toLowerCase() === name.toLowerCase(),
    );

    const selected = existing || name;

    if (!existing) {
      setGenres((current) => [...current, name].sort());
    }

    setForm((current) => ({
      ...current,
      genres: current.genres.includes(selected)
        ? current.genres
        : [...current.genres, selected],
    }));

    setNewGenre("");
  };
  return (
    <>
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
      {!form && !removing && (
        <button
          type="button"
          onClick={() => {
            setForm({ ...emptyForm, genres: [] });
            setNewGenre("");
            setEditId(null);
            setError("");
            setMessage("");
          }}
        >
          Add movie / series
        </button>
      )}
      {form && (
        <form className="panel" onSubmit={submit}>
          <h2>
            {editId == null ? "Add movie / series" : "Edit movie / series"}
          </h2>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={update}
              required
              maxLength={200}
              disabled={busy}
            />
          </label>
          <label>
            Type
            <select
              name="type"
              value={form.type}
              onChange={update}
              disabled={busy}
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              required
              maxLength={5000}
              disabled={busy}
            />
          </label>
          <label>
            Release year
            <input
              name="year"
              type="number"
              min="1888"
              max="2100"
              step="1"
              value={form.year}
              onChange={update}
              required
              disabled={busy}
            />
          </label>
          {form.type === "movie" ? (
            <label>
              Duration (minutes)
              <input
                name="duration_minutes"
                type="number"
                min="1"
                step="1"
                value={form.duration_minutes}
                onChange={update}
                required
                disabled={busy}
              />
            </label>
          ) : (
            <label>
              Seasons
              <input
                name="seasons"
                type="number"
                min="1"
                step="1"
                value={form.seasons}
                onChange={update}
                required
                disabled={busy}
              />
            </label>
          )}
          <label>
            Poster path or URL (optional)
            <input
              name="poster"
              value={form.poster}
              onChange={update}
              placeholder="/poster-midnight.png"
              disabled={busy}
            />
          </label>
          <fieldset style={{ border: "none" }} disabled={busy}>
            <legend>Genres</legend>
            <div className="movie-genre-options">
              {genres.map((genre) => (
                <label key={genre}>
                  <input
                    type="checkbox"
                    checked={form.genres.includes(genre)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        genres: event.target.checked
                          ? [...form.genres, genre]
                          : form.genres.filter((id) => id !== genre),
                      })
                    }
                  />
                  {genre}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            New genre
            <input
              value={newGenre}
              onChange={(event) => setNewGenre(event.target.value)}
              maxLength={80}
              disabled={busy}
            />
          </label>
          <button
            type="button"
            onClick={addGenre}
            disabled={busy || !newGenre.trim()}
          >
            Add genre
          </button>
          <div className="profile-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setForm(null);
                setNewGenre("");
                setGenres(
                  [...new Set(movies.flatMap((movie) => movie.genres))].sort(),
                );
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {removing && (
        <section className="panel" aria-label="Confirm deletion">
          <p>
            Delete <strong>{removing.title}</strong>? Its ratings and reviews
            will also be deleted.
          </p>
          <div className="profile-actions">
            <button type="button" disabled={busy} onClick={remove}>
              Confirm delete
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRemoving(null)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
      {!movies.length && <p>No movies or series yet.</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Year</th>
              <th>Duration / Seasons</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{movie.type}</td>
                <td>{movie.year}</td>
                <td>
                  {movie.type === "series"
                    ? `${movie.seasons} seasons`
                    : `${movie.duration_minutes} min`}
                </td>
                <td>
                  <div className="profile-actions">
                    <button
                      type="button"
                      disabled={busy || Boolean(form) || Boolean(removing)}
                      onClick={() => {
                        setForm({
                          ...movie,
                          poster: movie.poster || "",
                          duration_minutes: movie.duration_minutes ?? "",
                          seasons: movie.seasons ?? "",
                        });
                        setEditId(movie.id);
                        setNewGenre("");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy || Boolean(form) || Boolean(removing)}
                      onClick={() => {
                        setRemoving(movie);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default ManageMovies;
