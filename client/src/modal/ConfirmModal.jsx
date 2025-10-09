import React, { useState, useEffect } from "react";
import useEscapeKey from "../hooks/useEscKey";

import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "danger",
  requireTextMatch = false,
  textToMatch = "",
  warningMessage = null,
  warningList = null,
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      setInputError(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (requireTextMatch) {
      if (inputValue.trim() !== textToMatch.trim()) {
        setInputError(true);
        return;
      }
    }
    onConfirm();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (inputError) setInputError(false);
  };

  const isConfirmDisabled = requireTextMatch
    ? inputValue.trim() !== textToMatch.trim() || loading
    : loading;

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="confirm-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="confirm-modal-body">
          {warningMessage && (
            <div className="confirm-modal-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="confirm-modal-warning-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <div>
                <p className="confirm-modal-warning-text">
                  <strong>{warningMessage}</strong>
                  {warningList && (
                    <ul className="confirm-modal-list">
                      {warningList.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </p>
              </div>
            </div>
          )}

          <p className="confirm-modal-message">{message}</p>

          {requireTextMatch && (
            <div className="confirm-modal-input-group">
              <label className="confirm-modal-input-label">
                Type the group name to confirm:
              </label>
              <div className="confirm-modal-group-name-display">
                {textToMatch}
              </div>
              <input
                type="text"
                className={`confirm-modal-input ${inputError ? "error" : ""}`}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type here..."
                autoFocus
                disabled={loading}
              />
            </div>
          )}

          <div className="confirm-modal-actions">
            <button
              className="confirm-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              className={`confirm-modal-btn-confirm ${
                confirmButtonStyle === "primary" ? "btn-primary" : ""
              }`}
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
            >
              {loading && <span className="confirm-modal-loading"></span>}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
