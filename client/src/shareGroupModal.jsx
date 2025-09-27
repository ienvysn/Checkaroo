// client/src/ShareGroupModal.jsx

import React from "react";
import "./ShareGroupModal.css";
import { useToast } from "./Toast";

const ShareGroupModal = ({
  isOpen,
  onClose,
  groupName,
  groupId,
  inviteToken,
}) => {
  const { showSuccess, showError } = useToast();

  if (!isOpen) return null;

  // Use inviteToken instead of groupId, with fallback for old method
  const token = inviteToken || groupId;
  const inviteLink = `http://localhost:3000?inviteToken=${token}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${inviteLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showSuccess("Invite link copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showSuccess("Invite link copied to clipboard!");
      } catch (fallbackErr) {
        showError("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSaveQR = async () => {
    try {
      // Fetch the QR code image as blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      // Create object URL for the blob
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${groupName.replace(/[^a-zA-Z0-9]/g, "_")}_QR_Code.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("QR code downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
      showError("Failed to download QR code");
    }
  };

  const handleCopyQR = async () => {
    try {
      // Convert QR code image to blob and copy to clipboard
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        showSuccess("QR code copied to clipboard!");
      } else {
        await navigator.clipboard.writeText(qrCodeUrl);
        showSuccess("QR code URL copied to clipboard!");
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        showSuccess("Invite link copied instead (QR copy not supported)!");
      } catch (fallbackErr) {
        showError("Failed to copy QR code");
      }
    }
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
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
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
              <button className="secondary-btn" onClick={handleSaveQR}>
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
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Save
              </button>
              <button className="secondary-btn" onClick={handleCopyQR}>
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
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
                Copy
              </button>
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
