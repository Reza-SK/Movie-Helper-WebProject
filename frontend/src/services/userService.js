import sampleUsers from "../data/users.json";

const key = "movie-helper-users";
export function getUsers() {
  let users = sampleUsers;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) users = saved;
  } catch { /* Use the sample users. */ }
  return users.map((user) => {
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem(`movie-helper-profile-${user.username}`)) || {}; } catch { /* Use original profile. */ }
    return { ...user, display_name: profile.display_name ?? user.display_name, email: profile.email ?? user.email, bio: profile.bio ?? user.bio };
  });
}
function requireAdmin(actor) {
  const current = getUsers().find((user) => user.id === actor?.id);
  if (current?.role !== "admin" || !current.is_active) throw new Error("Admin access required.");
}
export async function listUsers(actor) {
  requireAdmin(actor);
  return getUsers();
}
export function registerUser(values) {
  const users = getUsers();
  const username = values.username.trim();
  const email = values.email.trim();
  if (!username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a username and valid email.");
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase())) throw new Error("Username or email is already in use.");
  const user = { id: crypto.randomUUID(), username, email, display_name: username, bio: "", role: "user", is_active: true, joined_at: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify([...users, user]));
  return user;
}
export async function saveUser(actor, id, values) {
  requireAdmin(actor);
  const users = getUsers();
  const original = users.find((user) => user.id === id);
  if (id != null && !original) throw new Error("User not found.");
  const next = { username: values.username.trim(), display_name: values.display_name.trim(), email: values.email.trim(), bio: values.bio.trim(), role: values.role, is_active: Boolean(values.is_active) };
  if (!next.username || !next.display_name) throw new Error("Username and display name are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) throw new Error("Enter a valid email.");
  if (!["user", "admin"].includes(next.role)) throw new Error("Invalid role.");
  if (users.some((user) => user.id !== id && (user.username.toLowerCase() === next.username.toLowerCase() || user.email.toLowerCase() === next.email.toLowerCase()))) throw new Error("Username or email is already in use.");
  if (id === actor.id && (next.username !== original.username || next.role !== "admin" || !next.is_active)) throw new Error("You cannot rename, deactivate or demote your current admin account.");
  const result = { ...original, ...next, id: id ?? crypto.randomUUID(), joined_at: original?.joined_at || new Date().toISOString() };
  const updated = id == null ? [...users, result] : users.map((user) => user.id === id ? result : user);
  localStorage.setItem(key, JSON.stringify(updated));
  localStorage.removeItem(`movie-helper-profile-${result.username}`);
  if (original && original.username !== result.username) localStorage.removeItem(`movie-helper-profile-${original.username}`);
  return result;
}
export async function deleteUser(actor, id) {
  requireAdmin(actor);
  if (actor.id === id) throw new Error("You cannot delete your current admin account.");
  const users = getUsers();
  const target = users.find((user) => user.id === id);
  if (!target) throw new Error("User not found.");
  localStorage.setItem(key, JSON.stringify(users.filter((user) => user.id !== id)));
  localStorage.removeItem(`movie-helper-profile-${target.username}`);
}
