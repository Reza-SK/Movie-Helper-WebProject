import { useState } from "react";
import {
  loginUser,
  registerUser,
  confirmPasswordReset,
  requestPasswordReset,
} from "../services/authService";

const emptyForm = { username: "", email: "", password: "", confirm: "" };
const titles = {
  login: "Welcome back",
  register: "Create your account",
  forgot: "Reset your password",
  reset: "Choose a new password",
};

function LoginPage({ initialMode = "login", onAuthenticated }) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const changeMode = (nextMode) => {
    if (mode === "reset") {
      window.history.replaceState(null, "", "/login");
    }
    setMode(nextMode);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");

    if (mode === "forgot" || mode === "reset") {
      if (mode === "reset" && form.password !== form.confirm) {
        setError("Passwords do not match.");
        return;
      }

      setBusy(true);

      try {
        if (mode === "forgot") {
          const result = await requestPasswordReset(form.email.trim());
          setMessage(result.detail);
        } else {
          const params = new URLSearchParams(window.location.search);
          const uid = params.get("uid");
          const token = params.get("token");

          if (!uid || !token) {
            throw new Error("Invalid reset link.");
          }

          const result = await confirmPasswordReset(uid, token, form.password);

          setMode("login");
          setForm(emptyForm);
          setMessage(result.detail);

          window.history.replaceState(null, "", "/login");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setBusy(false);
      }

      return;
    }

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const username = form.username.trim();

      if (mode === "register") {
        await registerUser({
          username,
          email: form.email.trim(),
          password: form.password,
          display_name: username,
        });
        setMode("login");
        setMessage("Account created. Signing in...");
      }

      await loginUser(username, form.password);
      if (onAuthenticated) onAuthenticated();
      else window.location.assign("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <a className="login-brand" href="/">
          <strong>Movie Helper</strong>
        </a>
        <div className="login-copy">
          <h1 className="auth-title">{titles[mode]}</h1>
          {mode === "forgot" && <p>*Enter Your Email Address*</p>}

          <form onSubmit={submit}>
            {["register", "forgot"].includes(mode) && (
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  required
                  disabled={busy}
                />
              </label>
            )}
            {mode !== "forgot" && (
              <>
                {["login", "register"].includes(mode) && <label>
                  Username
                  <input
                    name="username"
                    value={form.username}
                    onChange={update}
                    autoComplete="username"
                    maxLength={150}
                    required
                    disabled={busy}
                  />
                </label>}
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={update}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={["register", "reset"].includes(mode) ? 4 : undefined}
                    required
                    disabled={busy}
                  />
                </label>
              </>
            )}
            {["register", "reset"].includes(mode) && (
              <label>
                Confirm password
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={update}
                  autoComplete="new-password"
                  required
                  disabled={busy}
                />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {message && <p role="status">{message}</p>}
            <button type="submit" disabled={busy}>
              {busy
                ? "Please wait..."
                : { login: "Sign in", register: "Sign up", forgot: "Send reset link", reset: "Save new password" }[mode]}
            </button>
          </form>

          <div className="auth-links">
            {mode === "login" ? (
              <>
                <button
                  type="button"
                  className="mode-link"
                  disabled={busy}
                  onClick={() => changeMode("register")}
                >
                  Create an account
                </button>
                <button
                  type="button"
                  className="mode-link"
                  disabled={busy}
                  onClick={() => changeMode("forgot")}
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                className="mode-link"
                disabled={busy}
                onClick={() => changeMode("login")}
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
