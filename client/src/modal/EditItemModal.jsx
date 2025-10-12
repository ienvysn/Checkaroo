import React, { useState, useEffect } from "react";
import useEscapeKey from "../hooks/useEscKey";
import "./AddItemModal.css";

const EditItemModal = ({ isOpen, onClose, onEditItem, item, groupMembers }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (item) {
      setItemName(item.name || "");
      setQuantity(item.quantity?.toString() || "1");
      setAssignedTo(item.assignedTo?._id || "");
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onEditItem(item._id, {
      name: itemName.trim(),
      quantity: parseInt(quantity) || 1,
      assignedTo: assignedTo || null,
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useEscapeKey(isOpen, handleCancel);

  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit item</h3>
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

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-add-item">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
