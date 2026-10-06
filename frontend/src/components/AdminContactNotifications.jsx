import { useEffect, useState } from "react";
import { getAdminContactNotifications } from "../services/contactService";

function AdminContactNotifications({ user }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAdminContactNotifications(user)
      .then((items) => {
        if (cancelled) return;
        setForms(items);
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
  }, [user]);

  if (loading) return <p role="status">Loading requests…</p>;
  if (error)
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );

  return (
    <section aria-label="User contact requests">
      <p>{forms.length} user requests</p>
      {!forms.length && <p>No requests yet.</p>}
      {forms.map((form) => (
        <article className="panel" key={form.id}>
          <h2>Subject: {form.subject}</h2>
          <p>
            <strong>From:</strong> {form.author}
          </p>
          <p className="contact-message-text">Message: {form.message}</p>

          <time dateTime={form.created_at}>
            {new Date(form.created_at).toLocaleString("en-GB", {
              timeZone: "Asia/Tehran",
            })}
          </time>
        </article>
      ))}
    </section>
  );
}

export default AdminContactNotifications;

