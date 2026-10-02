import { useState } from "react";
import api from "../api/client";

function LoginSignup({ onLogin }) {
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/api/auth/signup", signupForm);
      setMessage(response.data.message || "Signup successful");
      setSignupForm({ name: "", email: "", password: "", role: "user" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/api/auth/login", loginForm);
      onLogin(response.data.user);
      setMessage("Login successful");
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2 className="section-title">Login / Signup</h2>
      <p className="muted">
        Create a user, then login to unlock booking and role-based pages.
      </p>

      <div className="card-list">
        <div className="item-card">
          <h3>Signup</h3>
          <form onSubmit={handleSignup}>
            <div className="form-grid">
              <label className="input-group">
                <span>Name</span>
                <input
                  type="text"
                  required
                  placeholder="Example: Riya Sharma"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                />
              </label>

              <label className="input-group">
                <span>Email</span>
                <input
                  type="email"
                  required
                  placeholder="Example: riya@example.com"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                />
              </label>

              <label className="input-group">
                <span>Password</span>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                />
              </label>

              <label className="input-group">
                <span>Role</span>
                <select
                  value={signupForm.role}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <small className="input-help">
                  Use Admin only when you want to add trains.
                </small>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit">Create Account</button>
            </div>
          </form>
        </div>

        <div className="item-card">
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div className="form-grid">
              <label className="input-group">
                <span>Email</span>
                <input
                  type="email"
                  required
                  placeholder="Registered email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
              </label>

              <label className="input-group">
                <span>Password</span>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit">Login</button>
            </div>
          </form>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default LoginSignup;
