import React, { useState } from "react";
import axios from "axios";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div
        className="forgot-password-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forgot-password-header">
          <h2>Reset Password</h2>
          <button className="forgot-password-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="forgot-password-content">
          {submitted ? (
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
              <h3>Check Your Email</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="reset-instructions">
                Click the link in the email to reset your password. The link
                expires in 10 minutes.
              </p>
              <p className="spam-notice">
                Don't see it? Check your spam folder.
              </p>
              <button className="forgot-password-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="form-description">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="forgot-password-actions">
                <button
                  type="button"
                  className="forgot-password-btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="forgot-password-btn"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
