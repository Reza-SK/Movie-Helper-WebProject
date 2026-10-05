import sampleMessages from "../data/contactMessages.json";
import { getUsers } from "./userService";

const storageKey = "movie-helper-contact-forms";

function getSavedMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Replace these async functions with API calls when the backend is ready.
export async function sendContactForm(user, subject, message) {
  if (!user?.username || !user.is_active || user.role !== "user") {
    throw new Error("An active user account is required.");
  }
  const title = subject.trim();
  const text = message.trim();
  if (!title || !text) throw new Error("Please enter a subject and message.");
  if (title.length > 150 || text.length > 3000)
    throw new Error("Your message is too long.");

  const form = {
    id: crypto.randomUUID(),
    user_id: user.id ?? null,
    username: user.username,
    subject: title,
    message: text,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(
    storageKey,
    JSON.stringify([...getSavedMessages(), form]),
  );
  return form;
}

export async function getAdminNotifications(user) {
  if (user?.role !== "admin" || !user.is_active)
    throw new Error("Admin access required.");
  return [...sampleMessages, ...getSavedMessages()]
    .map((form) => ({
      ...form,
      author:
        getUsers().find((person) => person.id === form.user_id)?.display_name ||
        form.username ||
        "User",
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

