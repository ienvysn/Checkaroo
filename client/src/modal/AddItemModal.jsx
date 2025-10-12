import React, { useState } from "react";
import useEscapeKey from "../hooks/useEscKey";
import "./AddItemModal.css";

const AddItemModal = ({ isOpen, onClose, onAddItem, groupMembers }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem({
      name: itemName.trim(),
      quantity: parseInt(quantity) || 1,
      assignedTo: assignedTo || null,
    });

    // Reset form
    setItemName("");
    setQuantity("1");
    setAssignedTo("");
    onClose();
  };

  const handleCancel = () => {
    setItemName("");
    setQuantity("1");
    setAssignedTo("");
    onClose();
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add item to list</h3>
          <button className="modal-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="item-name">Item name</label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g., Milk"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigned-to">Assign to</label>
            <select
              id="assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="form-select"
            >
              <option value="">Unassigned</option>
              {groupMembers?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.username}
                </option>
              ))}
            </select>
          </div>

          <p className="form-help-text">
            Assign items to members or leave unassigned. You can edit details
            later.
          </p>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-add-item">
              <span>+</span> Add item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
