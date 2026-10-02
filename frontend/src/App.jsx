import { useState } from "react";
import "./App.css";

import LoginSignup from "./pages/LoginSignup";
import SearchTrains from "./pages/SearchTrains";
import BookTicket from "./pages/BookTicket";
import ViewBookings from "./pages/ViewBookings";
import AdminAddTrain from "./pages/AdminAddTrain";

function App() {
  const [activePage, setActivePage] = useState("login");
  const [user, setUser] = useState(null);

  const isLoggedIn = Boolean(user?._id);
  const isAdmin = user?.role === "admin";
  const isNormalUser = user?.role === "user";

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.role === "admin") {
      setActivePage("admin");
    } else {
      setActivePage("search");
    }
  };

  const availablePages = [
    { key: "login", label: "Login / Signup", visible: true },
    { key: "search", label: "Search Trains", visible: isNormalUser },
    { key: "book", label: "Book Ticket", visible: isNormalUser },
    { key: "bookings", label: "View Bookings", visible: isNormalUser },
    { key: "admin", label: "Admin Add Train", visible: isAdmin },
  ];

  const visiblePages = availablePages.filter((page) => page.visible);

  const handleLogout = () => {
    setUser(null);
    setActivePage("login");
  };

  const renderPage = () => {
    if (activePage === "login")
      return <LoginSignup onLogin={handleLoginSuccess} />;
    if (activePage === "search") return <SearchTrains user={user} />;
    if (activePage === "book") return <BookTicket user={user} />;
    if (activePage === "bookings") return <ViewBookings user={user} />;
    if (activePage === "admin") return <AdminAddTrain user={user} />;
    return null;
  };

  const pageAccessible = visiblePages.some((page) => page.key === activePage);

  return (
    <div className="container">
      <div className="header-card">
        <h1>Railway Management System</h1>
        <p className="muted">MongoDB Learning Demo</p>

        <div className="user-strip">
          <div className="inline-row">
            <strong>Active User:</strong>{" "}
            {user ? `${user.name} (${user.role})` : "Not logged in"}
            {isNormalUser && (
              <span className="role-badge user-role">User Mode</span>
            )}
            {isAdmin && (
              <span className="role-badge admin-role">Admin Mode</span>
            )}
          </div>
          {isLoggedIn && (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <div className="quick-guide">
          {!isLoggedIn && (
            <p>
              Start with <strong>Login / Signup</strong>. Search and booking
              pages are unlocked only after login.
            </p>
          )}
          {isNormalUser && (
            <p>
              Recommended flow: <strong>Search Trains</strong> {" -> "}
              <strong>Book Ticket</strong> {" -> "}
              <strong>View Bookings</strong>.
            </p>
          )}
          {isAdmin && (
            <p>
              You are admin. Manage train catalog in{" "}
              <strong>Admin Add Train</strong>. Booking pages are user-only.
            </p>
          )}
        </div>
      </div>

      <div className="nav-row">
        {visiblePages.map((page) => (
          <button
            type="button"
            key={page.key}
            onClick={() => setActivePage(page.key)}
            className={activePage === page.key ? "active-nav" : ""}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div className="page-card">
        {pageAccessible ? (
          renderPage()
        ) : (
          <p>Please choose an available page.</p>
        )}
      </div>
    </div>
  );
}

export default App;
