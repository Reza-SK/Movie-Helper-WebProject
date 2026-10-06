import { useState } from "react";
import { sendContactForm } from "../services/contactService";

function ContactForm({ user }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await sendContactForm(user, subject, message);
      setSubject("");
      setMessage("");
      setSuccess("Your request was sent successfully.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <p>Send a suggestion or report a site problem to the admins.</p>
      <label>
        Subject
        <input
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value);
            setSuccess("");
          }}
          required
          maxLength={150}
          disabled={sending}
        />
      </label>
      <label>
        Message
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSuccess("");
          }}
          required
          maxLength={3000}
          disabled={sending}
        />
      </label>
      <button type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send request"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}
    </form>
  );
}

export default ContactForm;
