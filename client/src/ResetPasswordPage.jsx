import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPasswordPage.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    if (!resetToken) {
      setError("Invalid reset link. No token found.");
      setVerifying(false);
      return;
    }

    setToken(resetToken);

    // Verify token
    const verifyToken = async () => {
      try {
        await axios.get(
          `http://localhost:5000/api/auth/verify-reset-token/${resetToken}`
        );
        setTokenValid(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This reset link is invalid or has expired."
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <div className="reset-password-content">
          {verifying ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Verifying reset link...</p>
            </div>
          ) : success ? (
            <div className="success-state">
              <div className="success-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2>Password Reset Successful!</h2>
              <p>
                Your password has been changed. You can now log in with your new
                password.
              </p>
              <p className="redirect-notice">Redirecting to login...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h2>Something Went Wrong</h2>
              <p>{error}</p>
              <button
                className="reset-password-btn"
                onClick={() => navigate("/")}
              >
                Back to Login
              </button>
            </div>
          ) : tokenValid ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                className="reset-password-btn"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="help-text">
                Remember your password?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate("/")}
                >
                  Back to Login
                </button>
              </p>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
