import { useEffect, useState } from "react";
import {
  getProfile,
  saveProfile,
  getHistory,
} from "../services/profileService";

function Profile({ user, onSaved }) {
  const [tab, setTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [history, setHistory] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProfile(user), getHistory(user)])
      .then(([info, entries]) => {
        if (cancelled) return;
        setProfile(info);
        onSaved(info);
        setForm(info);
        setHistory(entries);
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
  }, [user, onSaved]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await saveProfile(user, form);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      setMessage("Profile saved in this browser.");
      onSaved(updated);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p role="status">Loading profile…</p>;
  if (!profile) return <p role="alert">{error || "Unable to load profile."}</p>;

  return (
    <section className="panel">
      <div className="profile-tabs" aria-label="Profile sections">
        <button
          type="button"
          aria-pressed={tab === "personal"}
          onClick={() => setTab("personal")}
        >
          Your Personal information
        </button>
        <button
          type="button"
          aria-pressed={tab === "history"}
          onClick={() => setTab("history")}
        >
          Review & Rating History
        </button>
      </div>
      {tab === "personal" ? (
        <>
          <h2>Personal information</h2>
          {editing ? (
            <form className="profile-details-form" onSubmit={submit}>
              <p>
                Username: {profile.username} · Role: {profile.role}
              </p>
              <label>
                Display name
                <input
                  name="display_name"
                  value={form.display_name}
                  maxLength={100}
                  required
                  disabled={saving}
                  onChange={(event) =>
                    setForm({ ...form, display_name: event.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  required
                  disabled={saving}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>
              <label>
                Bio
                <textarea
                  name="bio"
                  value={form.bio}
                  maxLength={500}
                  disabled={saving}
                  onChange={(event) =>
                    setForm({ ...form, bio: event.target.value })
                  }
                />
              </label>
              <div className="profile-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setForm(profile);
                    setEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p>
                <strong>Username:</strong> {profile.username}
              </p>
              <p>
                <strong>Name:</strong> {profile.display_name || "Not provided"}
              </p>
              <p>
                <strong>Email:</strong> {profile.email || "Not provided"}
              </p>
              <p>
                <strong>Bio:</strong> {profile.bio || "Not provided"}
              </p>
              <p>
                <strong>Role:</strong> {profile.role}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                }}
              >
                Edit profile
              </button>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Your ratings and reviews</h2>
          {history.length === 0 ? (
            <p>You have not rated or reviewed any movies yet.</p>
          ) : (
            <ul className="profile-history">
              {history.map((entry) => (
                <li key={`${entry.type}-${entry.id}`}>
                  <h3>{entry.movie_title}</h3>
                  <p>
                    {entry.type === "rating"
                      ? `Rating: ${entry.score} / 10`
                      : `Review: ${entry.comment}`}
                  </p>
                  <time dateTime={entry.created_at}>
                    {new Date(entry.created_at).toLocaleDateString("en-GB", {
                      timeZone: "Asia/Tehran",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default Profile;
