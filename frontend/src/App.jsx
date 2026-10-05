import HomePage from "./pages/Homepage";
import LoginPage from "./pages/Loginpage";
import DashboardPage from "./pages/Dashboardpage";
import { getUsers } from "./services/userService";
import MovieDetail from "./components/MovieDetail";
import DashboardSidebar from "./components/DashboardSidebar";

function App() {
  const path = window.location.pathname;
  // Frontend preview only: this value is not proof of authentication.
  const username = sessionStorage.getItem("reza");
  const user = getUsers().find((user) => user.username === username) || {
    username,
    role: "user",
    is_active: false,
  };
  const isAuthenticated = Boolean(username) && user.is_active;

  const signIn = (name) => {
    sessionStorage.setItem("reza", name);
    window.location.assign("/dashboard");
  };

  const signOut = () => {
    sessionStorage.removeItem("reza");
    window.location.assign("/");
  };

  return (
    <>
      {path === "/" && <HomePage isAuthenticated={isAuthenticated} />}
      {path === "/login" && <LoginPage onAuthenticated={signIn} />}
      {path === "/forgot-password" && <LoginPage initialMode="forgot" />}
      {path === "/signup" && (
        <LoginPage initialMode="register" onAuthenticated={signIn} />
      )}
      {path === "/movie-detail" && (
        <div className="dashboard-layout">
        <DashboardSidebar user={user} isAuthenticated={isAuthenticated} signOut={signOut} />
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

