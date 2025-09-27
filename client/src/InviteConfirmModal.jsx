import React, { useState, useEffect } from "react";
import { getInviteInfo, joinGroup } from "./api";
import { useToast } from "./Toast";
import "./InviteConfirmModal.css";

const InviteConfirmModal = ({
  isOpen,
  onClose,
  inviteToken,
  onJoinSuccess,
}) => {
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && inviteToken) {
      fetchGroupInfo();
    }
  }, [isOpen, inviteToken]);

  const fetchGroupInfo = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getInviteInfo(inviteToken);
      setGroupInfo(response.data.group);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid invite link";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    setError("");
    try {
      const response = await joinGroup(groupInfo._id);
      showSuccess(`Successfully joined ${groupInfo.name}!`);
      onJoinSuccess(groupInfo);
      onClose();
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message === "Already a member"
      ) {
        showSuccess(`You're already a member of ${groupInfo.name}!`);
        onJoinSuccess(groupInfo);
        onClose();
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to join group";
        setError(errorMessage);
        showError(errorMessage);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleDecline = () => {
    // Clear the invite token from URL
    const url = new URL(window.location);
    url.searchParams.delete("inviteToken");
    window.history.replaceState({}, "", url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="invite-modal-overlay" onClick={handleDecline}>
      <div
        className="invite-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-modal-header">
          <div className="invite-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
          </div>
          <div className="invite-header-content">
            <h3>Group Invitation</h3>
            <p>You've been invited to join a group</p>
          </div>
        </div>

        <div className="invite-modal-body">
          {error && <div className="invite-error">{error}</div>}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: "16px", color: "var(--medium-gray)" }}>
                Loading group details...
              </p>
            </div>
          ) : groupInfo ? (
            <>
              <div className="group-info">
                <img
                  src={`https://i.pravatar.cc/64?u=${groupInfo._id}`}
                  alt="Group"
                  className="group-avatar"
                />
                <h4 className="group-name">{groupInfo.name}</h4>
                <p className="group-members">
                  {groupInfo.members?.length || 0} member
                  {(groupInfo.members?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>

              <p className="invite-message">
                You've been invited to join <strong>{groupInfo.name}</strong>.
                You'll be able to collaborate on shared lists with other group
                members.
              </p>
            </>
          ) : null}

          <div className="invite-modal-actions">
            <button className="btn-decline" onClick={handleDecline}>
              Decline
            </button>
            <button
              className="btn-join"
              onClick={handleJoinGroup}
              disabled={loading || !groupInfo || joining}
            >
              {joining ? (
                <>
                  <div className="loading-spinner"></div>
                  Joining...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Join Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteConfirmModal;
