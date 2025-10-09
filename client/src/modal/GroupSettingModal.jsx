import React, { useState } from "react";
import { updateGroupName, removeMember, deleteGroup, leaveGroup } from "../api";
import { useToast } from "../Toast";
import useEscapeKey from "../hooks/useEscKey";
import ConfirmModal from "./ConfirmModal";
import OwnerLeaveModal from "./OwnerLeaveModal";
import "./GroupSettingModal.css";

const GroupSettingsModal = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  onGroupUpdated,
  onGroupDeleted,
  onGroupLeft,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const [ownerLeaveModalOpen, setOwnerLeaveModalOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  const isOwner = group?.owner === currentUserId;

  const handleEditNameClick = () => {
    setEditedName(group.name);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (editedName.trim().length < 3) {
      showError("Group name must be at least 3 characters");
      return;
    }

    if (editedName.trim() === group.name) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await updateGroupName(group._id, editedName.trim());
      showSuccess("Group name updated successfully!");
      setIsEditingName(false);
      onGroupUpdated();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update group name");
    } finally {
      setSavingName(false);
    }
  };

  const handleRemoveMember = (member) => {
    setConfirmModal({
      isOpen: true,
      type: "removeMember",
      data: member,
    });
  };

  const confirmRemoveMember = async () => {
    const member = confirmModal.data;
    try {
      await removeMember(group._id, member._id);
      showSuccess(`${member.username} removed from group`);
      setConfirmModal({ isOpen: false, type: null, data: null });
      onGroupUpdated();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleLeaveGroup = () => {
    if (isOwner) {
      setOwnerLeaveModalOpen(true);
    } else {
      setConfirmModal({
        isOpen: true,
        type: "leaveGroup",
        data: null,
      });
    }
  };

  const confirmLeaveGroup = async () => {
    try {
      await leaveGroup(group._id);
      showSuccess("You left the group");
      setConfirmModal({ isOpen: false, type: null, data: null });
      onGroupLeft();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to leave group");
    }
  };

  const handleDeleteGroup = () => {
    setConfirmModal({
      isOpen: true,
      type: "deleteGroup",
      data: null,
    });
  };

  const confirmDeleteGroup = async () => {
    try {
      await deleteGroup(group._id);
      showSuccess("Group deleted successfully");
      setConfirmModal({ isOpen: false, type: null, data: null });
      onGroupDeleted();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete group");
    }
  };

  useEscapeKey(isOpen, onClose);

  if (!isOpen || !group) return null;

  return (
    <>
      <div className="group-settings-modal-overlay" onClick={onClose}>
        <div
          className="group-settings-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="group-settings-modal-header">
            <h3>Group Settings</h3>
            <button
              className="group-settings-modal-close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="group-settings-modal-body">
            {/* Group Name Section */}
            <div className="group-settings-section">
              <h4 className="group-settings-section-title">Group Name</h4>
              <div className="group-name-container">
                {isEditingName ? (
                  <>
                    <input
                      type="text"
                      className="group-name-input"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      autoFocus
                      disabled={savingName}
                    />
                    <div className="edit-name-actions">
                      <button
                        className="save-name-btn"
                        onClick={handleSaveName}
                        disabled={savingName}
                        title="Save"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </button>
                      <button
                        className="cancel-name-btn"
                        onClick={handleCancelEdit}
                        disabled={savingName}
                        title="Cancel"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="group-name-text">{group.name}</span>
                    {isOwner && (
                      <button
                        className="edit-name-btn"
                        onClick={handleEditNameClick}
                        title="Edit name"
                      >
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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Members Section */}
            <div className="group-settings-section">
              <h4 className="group-settings-section-title">
                Members ({group.members?.length || 0})
              </h4>
              <ul className="members-list-settings">
                {group.members?.map((member) => (
                  <li key={member._id} className="member-item-settings">
                    <img
                      src={`https://api.dicebear.com/7.x/big-ears/svg?seed=${member._id}`}
                      alt={member.username}
                      className="member-avatar-settings"
                    />
                    <div className="member-details-settings">
                      <p className="member-name-settings">
                        {member.username}
                        {member._id === currentUserId && (
                          <span className="member-you-badge">You</span>
                        )}
                      </p>
                      <p className="member-role-settings">
                        {group.owner === member._id ? "Owner" : "Member"}
                      </p>
                    </div>
                    {isOwner && member._id !== currentUserId && (
                      <button
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(member)}
                        title="Remove member"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Danger Zone */}
            <div className="group-settings-section">
              <div className="danger-zone">
                <h4 className="danger-zone-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                  Danger Zone
                </h4>
                {isOwner ? (
                  <>
                    <p className="danger-zone-description">
                      Deleting this group will permanently remove all items,
                      activity history, and remove all members. This action
                      cannot be undone.
                    </p>
                    <button
                      className="danger-zone-btn"
                      onClick={handleDeleteGroup}
                    >
                      Delete Group
                    </button>
                  </>
                ) : (
                  <>
                    <p className="danger-zone-description">
                      Leave this group. You can rejoin later with an invite
                      link.
                    </p>
                    <button
                      className="danger-zone-btn"
                      onClick={handleLeaveGroup}
                    >
                      Leave Group
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation */}
      {confirmModal.type === "removeMember" && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, type: null, data: null })
          }
          onConfirm={confirmRemoveMember}
          title="Remove Member?"
          message={`Are you sure you want to remove "${confirmModal.data?.username}" from "${group.name}"?`}
          confirmText="Remove"
          cancelText="Cancel"
          warningMessage="This member will lose access to all group content."
        />
      )}

      {/* Leave Group Confirmation */}
      {confirmModal.type === "leaveGroup" && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, type: null, data: null })
          }
          onConfirm={confirmLeaveGroup}
          title="Leave Group?"
          message={`Are you sure you want to leave "${group.name}"? You can rejoin with an invite link.`}
          confirmText="Leave Group"
          cancelText="Cancel"
        />
      )}

      {/* Delete Group Confirmation */}
      {confirmModal.type === "deleteGroup" && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, type: null, data: null })
          }
          onConfirm={confirmDeleteGroup}
          title="Delete Group?"
          message="This will permanently delete the group and all its contents."
          confirmText="Delete Group"
          cancelText="Cancel"
          requireTextMatch={true}
          textToMatch={group.name}
          warningMessage="This action cannot be undone!"
          warningList={[
            "All items in the group",
            "All activity history",
            "All members will be removed",
          ]}
        />
      )}

      {/* Owner Leave Modal */}
      <OwnerLeaveModal
        isOpen={ownerLeaveModalOpen}
        onClose={() => setOwnerLeaveModalOpen(false)}
        groupName={group.name}
        onDeleteGroup={handleDeleteGroup}
      />
    </>
  );
};

export default GroupSettingsModal;
