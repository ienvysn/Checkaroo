import React, { useState, useEffect } from "react";
import { getActivities } from "../api";
import useEscapeKey from "../hooks/useEscKey";
import "./ActivityModal.css";

const ActivityModal = ({ isOpen, onClose, groupId, currentUserId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchActivities();
    }
  }, [isOpen, groupId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await getActivities(groupId);
      setActivities(response.data);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const getActivityText = (activity) => {
    const isCurrentUser = activity.user === currentUserId;
    const userName = isCurrentUser ? "You" : activity.username;

    switch (activity.action) {
      case "added_item":
        return (
          <>
            <span className="user-highlight">{userName}</span> added{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      case "marked_complete":
        return (
          <>
            <span className="user-highlight">{userName}</span> marked{" "}
            <span className="item-highlight">{activity.itemName}</span> as
            bought
          </>
        );
      case "marked_incomplete":
        return (
          <>
            <span className="user-highlight">{userName}</span> unmarked{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      case "deleted_item":
        return (
          <>
            <span className="user-highlight">{userName}</span> removed{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      case "joined_group":
        return (
          <>
            <span className="user-highlight">{userName}</span> joined the group
          </>
        );
      case "left_group":
        return (
          <>
            <span className="user-highlight">{userName}</span> left the group
          </>
        );
      case "assigned_item":
        return (
          <>
            <span className="user-highlight">{userName}</span> assigned{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      case "unassigned_item":
        return (
          <>
            <span className="user-highlight">{userName}</span> unassigned{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      case "edited_item":
        return (
          <>
            <span className="user-highlight">{userName}</span> edited{" "}
            <span className="item-highlight">{activity.itemName}</span>
          </>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="activity-modal-overlay" onClick={onClose}>
      <div
        className="activity-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="activity-modal-header">
          <h3>Activity Log (Last 7 Days)</h3>
          <button className="activity-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="activity-modal-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "var(--medium-gray)" }}>
                Loading activities...
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-modal-empty">
              <div className="activity-modal-empty-icon">
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h4>No activities yet</h4>
              <p>Activities from the last 7 days will appear here</p>
            </div>
          ) : (
            <ul className="activity-modal-list">
              {activities.map((activity) => (
                <li key={activity._id} className="activity-modal-item">
                  <img
                    src={`https://api.dicebear.com/7.x/big-ears/svg?seed=${activity.user}`}
                    alt="User"
                    className="activity-modal-avatar"
                  />
                  <div className="activity-modal-details">
                    <p className="activity-modal-text">
                      {getActivityText(activity)}
                    </p>
                    <div className="activity-modal-time">
                      {getTimeAgo(activity.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
