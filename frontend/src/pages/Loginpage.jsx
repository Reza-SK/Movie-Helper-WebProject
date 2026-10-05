import { useState } from "react";

const emptyForm = { username: "", email: "", password: "", confirm: "" };
const titles = {
  login: "Welcome back",
  register: "Create your account",
  forgot: "Reset your password",
};

function LoginPage({ initialMode = "login", onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const changeMode = (nextMode) => {
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
  //need to be edited from backend in the future
  const submit = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode !== "forgot" && !form.username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (mode !== "forgot" && onAuthenticated) {
      onAuthenticated(form.username.trim());
      return;
    }
    setMessage(
      mode === "forgot"
        ? "Email format is valid. This is a preview; no email has been sent."
        : "Form is valid. This is a preview; no account has been created or signed in.",
    );
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
            {mode !== "login" && (
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  required
                />
              </label>
            )}
            {mode !== "forgot" && (
              <>
                <label>
                  Username
                  <input
                    name="username"
                    value={form.username}
                    onChange={update}
                    autoComplete="username"
                    maxLength={150}
                    required
                  />
                </label>
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
                    minLength={mode === "register" ? 4 : undefined}
                    required
                  />
                </label>
              </>
            )}
            {mode === "register" && (
              <label>
                Confirm password
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={update}
                  autoComplete="new-password"
                  required
                />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {message && <p role="status">{message}</p>}
            <button type="submit">
              {mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Sign up"
                  : "Continue"}
            </button>
          </form>

          <div className="auth-links">
            {mode === "login" ? (
              <>
                <button
                  type="button"
                  className="mode-link"
                  onClick={() => changeMode("register")}
                >
                  Create an account
                </button>
                <button
                  type="button"
                  className="mode-link"
                  onClick={() => changeMode("forgot")}
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                className="mode-link"
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
