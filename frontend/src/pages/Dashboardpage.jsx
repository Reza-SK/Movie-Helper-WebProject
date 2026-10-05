import { useEffect, useState } from "react";
import users from "../data/users.json";
import movies from "../data/movies.json";
import Profile from "../components/Profile";
import Discovery from "../components/Discovery";

function Dashboard({ isAuthenticated = false, user, signOut }) {
  const [page, setPage] = useState("profile");
  const [profileUser, setProfileUser] = useState(user);
  const isAdmin = user?.role === "admin";
  const titles = {
    profile: "Profile",
    discovery: "Discovery",
    users: "Manage users",
    movies: "Manage movies",
  };
  const currentPage =
    !isAdmin && (page === "users" || page === "movies") ? "profile" : page;

  useEffect(() => {
    if (!isAuthenticated) window.location.replace("/");
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-menu">
        <a href="/" className="login-brand">
          Movie Helper
        </a>
        <p>
          {profileUser.display_name || user.username} ·{" "}
          {isAdmin ? "Role: Admin" : "Role: User"}
        </p>
        <nav aria-label="Dashboard">
          <button
            type="button"
            className={currentPage === "profile" ? "active" : ""}
            onClick={() => setPage("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className={currentPage === "discovery" ? "active" : ""}
            onClick={() => setPage("discovery")}
          >
            Discovery
          </button>
          {isAdmin && (
            <>
              <hr />
              <button
                type="button"
                className={currentPage === "users" ? "active" : ""}
                onClick={() => setPage("users")}
              >
                Manage users
              </button>
              <button
                type="button"
                className={currentPage === "movies" ? "active" : ""}
                onClick={() => setPage("movies")}
              >
                Manage movies
              </button>
            </>
          )}
        </nav>
        <button type="button" onClick={signOut}>
          Log out
        </button>
      </aside>

      <main className="dashboard-body">
        <h1>{titles[currentPage]}</h1>
        {currentPage === "profile" && (
          <Profile user={user} onSaved={setProfileUser} />
        )}
        {currentPage === "discovery" && <Discovery />}
        {isAdmin && currentPage === "users" && (
          <>
            <p>
              Sample users. Editing controls will be added in the next step.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => item.username === profileUser.username ? { ...item, ...profileUser } : item).map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                      <td>{item.is_active ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {isAdmin && currentPage === "movies" && (
          <>
            <p>
              Sample movies. Editing controls will be added in the next step.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td>{movie.title}</td>
                      <td>{movie.year}</td>
                      <td>{movie.duration_minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

