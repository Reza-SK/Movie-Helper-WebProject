import { api } from "./api";

export async function getProfile(user) {
  const profile = await api("/profile/");

  return {
    ...user,
    ...profile,
  };
}

export async function saveProfile(user, values) {
  const profile = await api("/profile/", {
    method: "PATCH",
    body: JSON.stringify({
      display_name: values.display_name.trim(),
      email: values.email.trim(),
      bio: values.bio.trim(),
    }),
  });

  return {
    ...user,
    ...profile,
  };
}

export function getHistory() {
  return api("/profile/history/");
}
