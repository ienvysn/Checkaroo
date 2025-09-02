import React, { useState, useEffect } from "react";
import axios from "axios";

// The base URL for our backend API
const API_URL = "http://localhost:5000/api/items";

function ListComponent() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");

  // Fetch all items from the backend when the component loads
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(API_URL);
        setItems(response.data);
        console.log("Fetched items successfully:", response.data); // Debugging line
      } catch (error) {
        console.error("Error fetching items:", error); // Debugging line
      }
    };
    fetchItems();
  }, []);

  // Handle adding a new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return; // Prevent adding empty items

    try {
      const response = await axios.post(API_URL, { name: newItemName });
      setItems([response.data, ...items]); // Add the new item to the top of the list
      setNewItemName(""); // Clear the input field
      console.log("Added new item:", response.data); // Debugging line
    } catch (error) {
      console.error("Error adding item:", error); // Debugging line
    }
  };

  // Handle toggling the complete status of an item
  const handleToggleComplete = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`);
      setItems(items.map((item) => (item._id === id ? response.data : item)));
      console.log("Toggled item complete:", response.data); // Debugging line
    } catch (error) {
      console.error("Error updating item:", error); // Debugging line
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setItems(items.filter((item) => item._id !== id));
      console.log("Deleted item with id:", id); // Debugging line
    } catch (error) {
      console.error("Error deleting item:", error); // Debugging line
    }
  };

  return (
    <div className="list-container">
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add an item (e.g., Milk)"
        />
        <button type="submit">+ Add</button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item._id} className={item.isComplete ? "completed" : ""}>
            <div
              className="item-content"
              onClick={() => handleToggleComplete(item._id)}
            >
              <input type="checkbox" checked={item.isComplete} readOnly />
              <span>{item.name}</span>
            </div>
            <button
              onClick={() => handleDeleteItem(item._id)}
              className="delete-btn"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListComponent;
