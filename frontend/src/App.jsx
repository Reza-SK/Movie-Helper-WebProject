import HomePage from "./pages/Homepage";
import LoginPage from "./pages/Loginpage";
import DashboardPage from "./pages/Dashboardpage";
import users from "./data/users.json";

function App() {
  const path = window.location.pathname;
  // Frontend preview only: this value is not proof of authentication.
  const username = sessionStorage.getItem("reza");
  const user = users.find((user) => user.username === username) || {
    username,
    role: "user",
    is_active: true,
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
      {path === "/signup" && (
        <LoginPage initialMode="register" onAuthenticated={signIn} />
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
