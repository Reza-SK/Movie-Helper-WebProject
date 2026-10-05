import { useEffect, useState } from "react";
import { getProfile } from "../services/profileService";

function DashboardSidebar({
  user,
  isAuthenticated = false,
  currentPage = "discovery",
  onNavigate,
  signOut,
}) {
  const [profile, setProfile] = useState(user);
  const isAdmin = isAuthenticated && user?.role === "admin";
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return;
    getProfile(user)
      .then((info) => {
        if (!cancelled) setProfile(info);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated]);

  const navigate = (page) => {
    if (onNavigate) onNavigate(page);
    else window.location.assign(`/dashboard?section=${page}`);
  };
  const menuButton = (page, title) => (
    <button
      type="button"
      className={currentPage === page ? "active" : ""}
      aria-current={currentPage === page ? "page" : undefined}
      onClick={() => navigate(page)}
    >
      {title}
    </button>
  );

  return (
    <aside className="dashboard-menu">
      <a href="/" className="login-brand">
        Movie Helper
      </a>
      {isAuthenticated ? (
        <>
          <p>Welcome {profile?.display_name || user?.username}</p>
          <nav aria-label="Dashboard">
            {menuButton("profile", "Profile")}
            {menuButton("discovery", "Discovery")}
            {!isAdmin && menuButton("contact", "Contact Form")}
            {isAdmin && (
              <>
                <hr />
                {menuButton("notifications", "Notifications")}

                {menuButton("users", "Manage users")}
                {menuButton("movies", "Manage movies")}
                {menuButton("feedback", "All Reviews & Scores")}
                {menuButton("reports", "Site Report")}
              </>
            )}
          </nav>
          <button type="button" className="primary" onClick={signOut}>
            Log out
          </button>
        </>
      ) : (
        <>
          <p>Guest</p>
          <a className="primary" href="/login">
            Log in
          </a>
          <a className="primary" href="/signup">
            Sign up
          </a>
        </>
      )}
    </aside>
  );
}

export default DashboardSidebar;
