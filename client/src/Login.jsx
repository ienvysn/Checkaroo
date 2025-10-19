import React, { useState, useEffect } from "react";
import "./Login.css";
import ForgotPasswordModal from "./modal/ForgotPasswordModal";
import { getTheme, applyTheme } from "./utils/themeStorage";
import { loginUser, registerUser, getInviteInfo, joinGroup } from "./api";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  useEffect(() => {
    const savedTheme = getTheme();
    applyTheme(savedTheme);
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userData = {
        email: email.trim(),
        password: password,
      };
      const { data } = await loginUser(userData);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("personalGroupId", data.personalGroup);

        // Check for invite token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const inviteToken = urlParams.get("inviteToken");

        if (inviteToken) {
          try {
            // First get the group info
            const inviteRes = await getInviteInfo(inviteToken);
            const groupId = inviteRes.data.group._id;

            await joinGroup(groupId);

            // Clear invite token from URL
            const url = new URL(window.location);
            url.searchParams.delete("inviteToken");
            window.history.replaceState({}, "", url);

            // Set the joined group as selected
            localStorage.setItem("selectedGroupId", groupId);

            console.log(
              `Successfully joined group: ${inviteRes.data.group.name}`
            );
          } catch (joinErr) {
            console.error("Failed to join group:", joinErr);
          }
        }

        window.location.reload();
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
      console.error("Login error:", err);
    }
  };
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = "http://localhost:5000/api/auth/google";
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = {
        email: email.trim(),
        password: password,
        username: username.trim(),
      };

      const { data } = await registerUser(userData);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("personalGroupId", data.personalGroup);

        // Check for invite token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const inviteToken = urlParams.get("inviteToken");

        if (inviteToken) {
          try {
            // First get the group info
            const inviteRes = await getInviteInfo(inviteToken);
            const groupId = inviteRes.data.group._id;

            // Join the group
            await joinGroup(groupId);

            // Clear invite token from URL
            const url = new URL(window.location);
            url.searchParams.delete("inviteToken");
            window.history.replaceState({}, "", url);

            // Set the joined group as selected
            localStorage.setItem("selectedGroupId", groupId);

            console.log(
              `Successfully joined group: ${inviteRes.data.group.name}`
            );
          } catch (joinErr) {
            console.error("Failed to join group:", joinErr);
            // Continue with normal signup even if group join fails
          }
        }

        window.location.reload();
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Email already exists. Please log in.");
      } else {
        setError("Sign-up failed. Please try again.");
      }
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-content">
          <h1 className="main-title">
            {isLogin ? "Log in to your account" : "Create your account"}
          </h1>

          <div className="form-container">
            <div className="toggle-buttons" onClick={() => setError("")}>
              <button
                className={`toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
              >
                Log in
              </button>
              <button
                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {isLogin ? (
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="password-header">
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <button type="submit" className="continue-btn">
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="input-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="yourusername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="continue-btn">
                  Sign Up
                </button>
              </form>
            )}

            <div className="divider">or</div>

            <div className="social-login">
              <button className="social-btn" onClick={handleGoogleLogin}>
                <img
                  src="https://img.icons8.com/color/16/000000/google-logo.png"
                  alt="Google"
                />
                Google
              </button>
              <button className="social-btn">
                <img
                  src="https://img.icons8.com/ios-glyphs/16/000000/github.png"
                  alt="GitHub"
                />
                GitHub
              </button>
            </div>
            <p className="terms-text">
              By continuing you agree to our Terms and Privacy.
            </p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-right-container">
          <div className="illustration-placeholder"></div>
          <h2 className="right-title">Access your shared lists</h2>
          <p className="right-subtitle">Collaborate with family and friends</p>
        </div>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
