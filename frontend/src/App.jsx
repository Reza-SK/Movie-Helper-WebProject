import HomePage from "./pages/Homepage";
import LoginPage from "./pages/Loginpage";
import DashboardPage from "./pages/Dashboardpage";
import MovieDetail from "./components/MovieDetail";
import DashboardSidebar from "./components/DashboardSidebar";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "./services/authService";

function App() {
  const path = window.location.pathname;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((result) => {
        if (!cancelled) {
          setUser(result.isAuthenticated ? result.user : null);
        }
      })
      .catch((error) => {
        if (!cancelled) setAuthError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = Boolean(user);

  const signIn = () => {
    window.location.assign("/dashboard");
  };

  const signOut = async () => {
    try {
      await logoutUser();
      window.location.assign("/");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  if (loading) return <p role="status">Checking login…</p>;

  if (authError) {
    return (
      <div>
        <p role="alert">{authError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {path === "/" && <HomePage isAuthenticated={isAuthenticated} />}
      {path === "/login" && <LoginPage onAuthenticated={signIn} />}
      {path === "/forgot-password" && <LoginPage initialMode="forgot" onAuthenticated={signIn} />}
      {path === "/reset-password" && <LoginPage initialMode="reset" onAuthenticated={signIn} />}
      {path === "/signup" && (
        <LoginPage initialMode="register" onAuthenticated={signIn} />
      )}
      {path === "/movie-detail" && (
        <div className="dashboard-layout">
          <DashboardSidebar
            user={user}
            isAuthenticated={isAuthenticated}
            signOut={signOut}
          />
          <div className="dashboard-detail-content">
            <MovieDetail
              movieId={Number(
                new URLSearchParams(window.location.search).get("id"),
              )}
              user={user}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      )}
      {path === "/dashboard" && (
        <DashboardPage
          isAuthenticated={isAuthenticated}
          user={user}
          signOut={signOut}
        />
      )}
    </>
  );
}

export default App;
