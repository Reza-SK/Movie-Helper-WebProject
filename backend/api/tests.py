from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase


@override_settings(
    DEBUG=True,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    MAILERS={
        "default": {
            "BACKEND": "django.core.mail.backends.locmem.EmailBackend",
        },
    },
)
class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reset-user",
            email="reset@example.com",
            password="OriginalPassword123!",
        )

    def test_local_reset_link_changes_password_and_cannot_be_reused(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "RESET@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("reset_url", response.data)
        self.assertEqual(len(mail.outbox), 0)
        reset_url = urlparse(response.data["reset_url"])
        self.assertEqual(reset_url.path, "/reset-password")
        params = parse_qs(reset_url.query)
        payload = {
            "uid": params["uid"][0],
            "token": params["token"][0],
            "password": "ReplacementPassword456!",
        }

        confirm = self.client.post(
            "/api/auth/password-reset-confirm/", payload, format="json",
        )

        self.assertEqual(confirm.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ReplacementPassword456!"))
        self.assertFalse(self.user.check_password("OriginalPassword123!"))
        login = self.client.post(
            "/api/auth/login/",
            {"username": self.user.username, "password": payload["password"]},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        replay = self.client.post(
            "/api/auth/password-reset-confirm/", payload, format="json",
        )
        self.assertEqual(replay.status_code, 400)

    def test_local_unknown_email_returns_error_without_reset_link(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "missing@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)
        self.assertNotIn("reset_url", response.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_local_inactive_account_does_not_receive_reset_link(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("reset_url", response.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_local_account_without_password_does_not_receive_reset_link(self):
        self.user.set_unusable_password()
        self.user.save(update_fields=["password"])

        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("reset_url", response.data)
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(DEBUG=False)
    def test_reset_returns_link_without_email_when_debug_is_disabled(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("reset_url", response.data)
        self.assertEqual(urlparse(response.data["reset_url"]).path, "/reset-password")
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(DEBUG=False)
    def test_unknown_email_returns_error_when_debug_is_disabled(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "missing@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)
        self.assertNotIn("reset_url", response.data)
        self.assertEqual(len(mail.outbox), 0)
