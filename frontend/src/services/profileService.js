import users from "../data/users.json";
import movies from "../data/movies.json";
import ratings from "../data/ratings.json";
import reviews from "../data/reviews.json";

// Replace these async functions with API calls when the backend is ready.
const storageKey = (user) => `movie-helper-profile-${user.username}`;

export async function getProfile(user) {
  const original = users.find((item) => item.username === user.username) || user;
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey(user))) || {};
  } catch {
    // A damaged local preview should fall back to the JSON data.
  }
  return {
    ...original,
    display_name: saved.display_name ?? original.display_name ?? "",
    email: saved.email ?? original.email ?? "",
    bio: saved.bio ?? original.bio ?? "",
  };
}

export async function saveProfile(user, values) {
  const profile = {
    display_name: values.display_name.trim(),
    email: values.email.trim(),
    bio: values.bio.trim(),
  };
  if (!profile.display_name) throw new Error("Please enter your display name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error("Please enter a valid email address.");
  for (const other of users) {
    if (other.username === user.username) continue;
    const otherProfile = await getProfile(other);
    if (otherProfile.email.toLowerCase() === profile.email.toLowerCase()) {
      throw new Error("This email is already in use.");
    }
  }
  localStorage.setItem(storageKey(user), JSON.stringify(profile));
  return { ...await getProfile(user), ...profile };
}

export async function getHistory(user) {
  if (user.id == null) return [];
  const entries = [
    ...ratings.filter((item) => item.user_id === user.id).map((item) => ({ ...item, type: "rating" })),
    ...reviews.filter((item) => item.user_id === user.id).map((item) => ({ ...item, type: "review" })),
  ];
  return entries.map((entry) => ({
    ...entry,
    movie_title: movies.find((movie) => movie.id === entry.movie_id)?.title || "Unavailable movie",
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
