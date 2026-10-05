import { useEffect, useState } from "react";
import ManageUsers from "../components/ManageUsers";
import ManageMovies from "../components/ManageMovies";
import Profile from "../components/Profile";
import Discovery from "../components/Discovery";
import DashboardSidebar from "../components/DashboardSidebar";
import ContactForm from "../components/ContactForm";
import Notifications from "../components/Notifications";
import AllReviewsAndScores from "../components/AllReviewsAndScores";
import SiteReport from "../components/SiteReport";

function Dashboard({ isAuthenticated = false, user, signOut }) {
  const [page, setPage] = useState(
    ["profile", "discovery", "users", "movies", "contact", "notifications", "feedback", "reports"].includes(
      new URLSearchParams(window.location.search).get("section"),
    )
      ? new URLSearchParams(window.location.search).get("section")
      : "profile",
  );
  const [profileUser, setProfileUser] = useState(user);
  const isAdmin = user?.role === "admin";
  const titles = {
    profile: "Profile",
    discovery: "Discovery",
    users: "Manage users",
    movies: "Manage movies", contact: "Contact Form", notifications: "Notifications", feedback: "All Reviews & Scores", reports: "Site Report",
  };
  const currentPage =
    ((!isAdmin && ["users", "movies", "notifications", "feedback", "reports"].includes(page)) || (isAdmin && page === "contact")) ? "profile" : page;

  useEffect(() => {
    if (!isAuthenticated) window.location.replace("/");
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={profileUser}
        isAuthenticated={isAuthenticated}
        currentPage={currentPage}
        onNavigate={setPage}
        signOut={signOut}
      />

      <main className="dashboard-body">
        <h1>{titles[currentPage]}</h1>
        {currentPage === "profile" && (
          <Profile user={user} onSaved={setProfileUser} />
        )}
        {currentPage === "discovery" && <Discovery />}
{!isAdmin && currentPage === "contact" && <ContactForm user={user} />}
        {isAdmin && currentPage === "notifications" && <Notifications user={user} />}
        {isAdmin && currentPage === "feedback" && <AllReviewsAndScores user={user} />}
        {isAdmin && currentPage === "reports" && <SiteReport user={user} />}
        {isAdmin && currentPage === "users" && <ManageUsers user={user} onSaved={setProfileUser} />}
        {isAdmin && currentPage === "movies" && <ManageMovies user={user} />}
      </main>
    </div>
  );
}

export default Dashboard;

