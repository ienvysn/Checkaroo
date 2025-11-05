import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../Toast";
import useEscapeKey from "../hooks/useEscKey";
import ChangePasswordModal from "./CHnagePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import "./UserSettingsModal.css";

const UserSettingsModal = ({ isOpen, onClose, onAccountDeleted }) => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const changed = username !== user.username || email !== user.email;
      setHasChanges(changed);
    }
  }, [username, email, user]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { username: username.trim(), email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data);
      setHasChanges(false);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setHasChanges(false);
    }
    onClose();
  };

  const handlePasswordChanged = () => {
    showSuccess("Password changed successfully!");
    setIsPasswordModalOpen(false);
  };

  const handleAccountDeleted = () => {
    showSuccess("Account deleted successfully");
    setIsDeleteModalOpen(false);
    onAccountDeleted();
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen) return null;

  const isOAuthAccount = user?.authProvider !== "local";

  return (
    <>
      <div className="user-settings-overlay" onClick={handleCancel}>
        <div
          className="user-settings-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="user-settings-header">
            <h3>Account Settings</h3>
            <button className="user-settings-close-btn" onClick={handleCancel}>
              ×
            </button>
          </div>

          <div className="user-settings-body">
            {loading ? (
              <div className="user-settings-loading">Loading...</div>
            ) : (
              <>
                <div className="settings-section">
                  <h4 className="settings-section-title">
                    Profile Information
                  </h4>

                  <div className="settings-field">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      disabled={saving}
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      disabled={saving || isOAuthAccount}
                    />
                    {isOAuthAccount && (
                      <p className="settings-help-text">
                        Email cannot be changed for Google accounts
                      </p>
                    )}
                  </div>

                  <div className="settings-field">
                    <label>Password</label>
                    <div className="password-field">
                      <input
                        type="password"
                        value="••••••••"
                        disabled
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn-change-password"
                        onClick={() => setIsPasswordModalOpen(true)}
                        disabled={isOAuthAccount}
                      >
                        Change
                      </button>
                    </div>
                    {isOAuthAccount && (
                      <p className="settings-help-text">
                        Password management not available for Google accounts
                      </p>
                    )}
                  </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section">
                  <h4 className="settings-section-title">
                    Account Information
                  </h4>
                  <div className="account-info">
                    <div className="info-row">
                      <span className="info-label">Member since:</span>
                      <span className="info-value">
                        {new Date(user?.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section danger-section">
                  <h4 className="settings-section-title danger-title">
                    ⚠️ Danger Zone
                  </h4>
                  <p className="danger-description">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    className="btn-delete-account"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="user-settings-footer">
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordChanged}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleAccountDeleted}
        isOAuthAccount={isOAuthAccount}
      />
    </>
  );
};

export default UserSettingsModal;
