import React from "react";
import useEscapeKey from "../hooks/useEscKey";

import "./OwnerLeaveModal.css";

const OwnerLeaveModal = ({ isOpen, onClose, groupName, onDeleteGroup }) => {
  const handleDeleteClick = () => {
    onClose();
    onDeleteGroup();
  };

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="owner-leave-modal-overlay" onClick={onClose}>
      <div
        className="owner-leave-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="owner-leave-modal-header">
          <h3>You are the Group Owner</h3>
          <button className="owner-leave-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="owner-leave-modal-body">
          <p className="owner-leave-info">
            As the owner of <strong>{groupName}</strong>, you cannot leave
            without deleting the group.
          </p>

          <div className="owner-leave-option">
            <div className="owner-leave-option-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="owner-leave-option-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <h4 className="owner-leave-option-title">Delete Group</h4>
            </div>
            <p className="owner-leave-option-description">
              Permanently delete this group and all its contents. All members
              will be removed.
            </p>
            <button
              className="owner-leave-delete-btn"
              onClick={handleDeleteClick}
            >
              Delete Group
            </button>
          </div>

          <div className="owner-leave-divider"></div>

          <div className="owner-leave-actions">
            <button className="owner-leave-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLeaveModal;
