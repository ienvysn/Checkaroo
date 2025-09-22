// client/src/ShareGroupModal.jsx

import React from "react";
import "./ShareGroupModal.css";

const ShareGroupModal = ({ isOpen, onClose, groupName, groupId }) => {
  if (!isOpen) return null;

  const inviteLink = `https://lists.app/invite/${groupId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${inviteLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share group invite</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="subtitle">
            Send an invite link or add members directly.
          </p>

          <div className="invite-section">
            <div className="invite-header">
              <h4>Invite link</h4>
              <p className="group-name-label">{groupName}</p>
            </div>
            <div className="input-group">
              <input type="text" readOnly value={inviteLink} />
              <button className="copy-btn" onClick={handleCopyLink}>
                Copy
              </button>
            </div>
            <small className="help-text">
              Anyone with the link can request to join this group.
            </small>
          </div>

          <div className="qr-section">
            <div className="qr-header">
              <h4>QR code</h4>
              <p className="valid-label">Valid 24h</p>
            </div>
            <div className="qr-image-container">
              <img src={qrCodeUrl} alt="QR Code" />
            </div>
            <div className="qr-actions">
              <button className="secondary-btn">Save</button>
              <button className="secondary-btn">Copy</button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareGroupModal;
