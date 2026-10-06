import { api } from "./api";

function normalizeUser(user) {
  return {
    ...user,
    role: user.is_staff ? "admin" : "user",
  };
}

export async function listUsers() {
  const users = await api("/admin/users/");
  return users.map(normalizeUser);
}

export async function saveUser(actor, id, values) {
  const data = {
    username: values.username.trim(),
    email: values.email.trim(),
    is_active: values.is_active,
    is_staff: values.role === "admin",
    display_name: values.display_name.trim(),
    bio: values.bio.trim(),
  };

  if (id == null) {
    data.password = values.password;
    data.display_name = values.display_name.trim();
  }

  const user = await api(id == null ? "/admin/users/" : `/admin/users/${id}/`, {
    method: id == null ? "POST" : "PATCH",
    body: JSON.stringify(data),
  });

  return normalizeUser(user);
}

export function deleteUser(actor, id) {
  return api(`/admin/users/${id}/`, {
    method: "DELETE",
  });
}
