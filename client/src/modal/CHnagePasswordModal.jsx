import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../Toast";
import useEscapeKey from "../hooks/useEscKey";
import "./CHnagePasswordModal.css";

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to change password";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen) return null;

  return (
    <div className="change-password-overlay" onClick={handleCancel}>
      <div
        className="change-password-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="change-password-header">
          <h3>Change Password</h3>
          <button className="change-password-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          {error && <div className="change-password-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={loading}
            />
          </div>

          <div className="change-password-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
