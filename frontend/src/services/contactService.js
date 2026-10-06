import { api } from "./api";

export function sendContactForm(user, subject, message) {
  return api("/contact/", {
    method: "POST",
    body: JSON.stringify({
      subject: subject.trim(),
      message: message.trim(),
    }),
  });
}

export function getAdminContactNotifications() {
  return api("/admin/contact-messages/");
}
