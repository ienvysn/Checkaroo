import React, { useState } from "react";
import { createGroup } from "../api";
import { useToast } from "../Toast";
import useEscapeKey from "../hooks/useEscKey";
import "./CreateGroupModal.css";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  const validateGroupName = (name) => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return "Group name is required";
    }

    if (trimmedName.length < 3) {
      return "Group name must be at least 3 characters long";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateGroupName(groupName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await createGroup({ name: groupName.trim() });
      const newGroup = response.data;

      showSuccess(`"${newGroup.name}" group created successfully!`);

      // Reset form
      setGroupName("");
      setError("");

      // Notify parent
      onGroupCreated(newGroup);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create group";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupName("");
    setError("");
    onClose();
  };

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
    // Clear error when user starts typing
    if (error) setError("");
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen) return null;

  const isFormValid = !validateGroupName(groupName) && !loading;

  return (
    <div className="create-group-modal-overlay" onClick={handleCancel}>
      <div
        className="create-group-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="create-group-modal-header">
          <h3>Create new group</h3>
          <button
            className="create-group-modal-close-btn"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-group-modal-form">
          {error && <div className="create-group-error">{error}</div>}

          <div className="create-group-form-group">
            <label htmlFor="group-name">Group name</label>
            <input
              id="group-name"
              type="text"
              placeholder="e.g., Family Shopping List"
              value={groupName}
              onChange={handleInputChange}
              autoFocus
              disabled={loading}
            />
          </div>

          <p className="create-group-help-text">
            Choose a descriptive name with at least 3 characters. You can invite
            members after creating the group.
          </p>

          <div className="create-group-modal-actions">
            <button
              type="button"
              className="create-group-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-group-btn-create"
              disabled={!isFormValid}
            >
              {loading ? (
                <>
                  <div className="create-group-loading-spinner"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span>+</span> Create group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
