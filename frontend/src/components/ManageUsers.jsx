import { useEffect, useState } from "react";
import { listUsers, saveUser, deleteUser } from "../services/userService";

const emptyForm = {
  username: "",
  display_name: "",
  email: "",
  bio: "",
  role: "user",
  is_active: true,
};
function ManageUsers({ user, onSaved }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    listUsers(user)
      .then((items) => {
        if (active) {
          setUsers(items);
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
    setForm({
      ...form,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await saveUser(user, editId, form);
      setUsers(await listUsers(user));
      setForm(null);
      if (updated.id === user.id) onSaved(updated);
      setMessage("User saved in this browser.");
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
      await deleteUser(user, removing.id);
      setUsers(await listUsers(user));
      setRemoving(null);
      setMessage("User deleted.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <p role="status">Loading users…</p>;
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
            setForm({ ...emptyForm });
            setEditId(null);
            setError("");
            setMessage("");
          }}
        >
          Add user
        </button>
      )}
      {form && (
        <form className="panel" onSubmit={submit}>
          <h2>{editId === null ? "Add user" : "Edit user"}</h2>
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={update}
              maxLength={150}
              required
              disabled={busy || editId === user.id}
            />
          </label>
          <label>
            Display name
            <input
              name="display_name"
              value={form.display_name}
              onChange={update}
              maxLength={100}
              required
              disabled={busy}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              required
              disabled={busy}
            />
          </label>
          <label>
            Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={update}
              maxLength={500}
              disabled={busy}
            />
          </label>
          <label>
            Role
            <select
              name="role"
              value={form.role}
              onChange={update}
              disabled={busy || editId === user.id}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Active account
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={update}
              disabled={busy || editId === user.id}
            />
          </label>
          <div className="profile-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setForm(null);
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
            Delete user <strong>{removing.username}</strong>?
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
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.username}</td>
                <td>{item.display_name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>{item.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div className="profile-actions">
                    <button
                      type="button"
                      disabled={busy || Boolean(form) || Boolean(removing)}
                      onClick={() => {
                        setForm({ ...item });
                        setEditId(item.id);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={
                        busy ||
                        Boolean(form) ||
                        Boolean(removing) ||
                        item.id === user.id
                      }
                      onClick={() => {
                        setRemoving(item);
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
export default ManageUsers;
