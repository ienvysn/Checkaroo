import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../Toast";
import useEscapeKey from "../hooks/useEscKey";
import "./DeleteAccountModal.css";

const DeleteAccountModal = ({ isOpen, onClose, onSuccess, isOAuthAccount }) => {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    if (!isOAuthAccount && !password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/auth/account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("personalGroupId");
      onSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete account";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setConfirmText("");
    setError("");
    onClose();
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen) return null;

  return (
    <div className="delete-account-overlay" onClick={handleCancel}>
      <div
        className="delete-account-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-account-header">
          <h3>Delete Account</h3>
          <button className="delete-account-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="delete-account-body">
          <div className="delete-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="warning-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <div>
              <h4>This action cannot be undone</h4>
              <p>This will permanently delete your account and:</p>
              <ul>
                <li>Remove you from all groups</li>
                <li>Delete your personal list</li>
                <li>Erase all your data</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="delete-account-error">{error}</div>}

            {!isOAuthAccount && (
              <div className="form-group">
                <label htmlFor="password">Enter your password to confirm</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="confirm-text">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                required
                disabled={loading}
              />
            </div>

            <div className="delete-account-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-delete-confirm"
                disabled={loading || confirmText !== "DELETE"}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
