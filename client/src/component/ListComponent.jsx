import { useEffect, useState } from "react";
import { getGroups, getItems, addItem, updateItem, deleteItem } from "../api";
import AddItemModal from "../AddItemModal";
import ShareGroupModal from "../shareGroupModal";

function ListComponent() {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(
    localStorage.getItem("personalGroupId")
  );
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroupId) {
        const personal = res.data.find((g) => g.isPersonal);
        if (personal) {
          setSelectedGroupId(personal._id);
          localStorage.setItem("personalGroupId", personal._id);
        } else {
          setSelectedGroupId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const fetchItems = async () => {
    if (selectedGroupId) {
      try {
        const res = await getItems(selectedGroupId);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedGroupId]);

  const handleAddFromModal = (itemData) => {
    addItem(selectedGroupId, itemData).then((res) => {
      setItems([...items, res.data]);
    });
  };

  const handleToggle = (id, isComplete) => {
    updateItem(selectedGroupId, id, { isComplete: !isComplete }).then((res) => {
      setItems(items.map((item) => (item._id === id ? res.data : item)));
    });
  };

  const handleDelete = (id) => {
    deleteItem(selectedGroupId, id).then(() => {
      setItems(items.filter((item) => item._id !== id));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("personalGroupId");
    window.location.reload();
  };

  const handleShareClick = () => {
    if (selectedGroup && selectedGroup.inviteToken) {
      setIsShareModalOpen(true);
    } else {
      alert("This is a personal list and cannot be shared.");
    }
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroupId(groupId);
  };

  const selectedGroup = groups.find((group) => group._id === selectedGroupId);
  const personalGroup = groups.find((group) => group.isPersonal);
  const sharedGroups = groups.filter((group) => !group.isPersonal);

  return (
    <div className="checkaroo-container">
      <nav className="left-panel">
        <div className="panel-header">
          <span className="logo">❖</span>
          <h2>Shared Lists</h2>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search groups" />
        </div>

        <div className="personal-list">
          <p>Personal</p>
          <ul>
            {personalGroup && (
              <li
                className={
                  selectedGroupId === personalGroup._id ? "active" : ""
                }
                onClick={() => handleGroupClick(personalGroup._id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="list-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span>{personalGroup.name}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="groups-list">
          <p>Your groups</p>
          <ul>
            {sharedGroups.map((group) => (
              <li
                key={group._id}
                className={selectedGroupId === group._id ? "active" : ""}
                onClick={() => handleGroupClick(group._id)}
              >
                <img
                  src={`https://i.pravatar.cc/30?u=${group._id}`}
                  alt="Group"
                />
                <span>{group.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-footer">
          <button className="btn-secondary">+ New Group</button>
          <button className="btn-primary" onClick={handleShareClick}>
            Invite
          </button>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="main-view">
        <header className="main-header">
          <div className="header-left">
            <button className="btn-icon">{"<"}</button>
            <h3>{selectedGroup ? selectedGroup.name : "Personal List"}</h3>
          </div>
          <div className="header-right">
            <span>
              {selectedGroup
                ? `${selectedGroup.members.length} members`
                : "1 member"}
            </span>
          </div>
        </header>

        <div className="main-content">
          <main className="center-panel">
            <section className="list-section-card">
              <div className="list-header-top">
                <h3>List</h3>
              </div>

              <div className="item-list-container">
                <div className="item-list-header">
                  <span />
                  <span>Item</span>
                  <span>Quantity</span>
                  <span>Added/Assigned</span>
                  <span className="header-actions">Actions</span>
                </div>
                <ul className="item-list">
                  {items
                    .slice()
                    .sort((a, b) => a.isComplete - b.isComplete)
                    .map((item) => (
                      <li
                        key={item._id}
                        className={item.isComplete ? "completed" : ""}
                      >
                        <input
                          type="checkbox"
                          onClick={() =>
                            handleToggle(item._id, item.isComplete)
                          }
                          checked={item.isComplete}
                          onChange={() =>
                            handleToggle(item._id, item.isComplete)
                          }
                        />
                        <span
                          className="item-name"
                          style={{
                            textDecoration: item.isComplete
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {item.name}
                        </span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-added-by">added by You</span>
                        <div className="item-actions">
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(item._id)}
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
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="add-item-form">
                <p className="tip-text">
                  Tip: Click the checkbox to mark an item as bought. Completed
                  items move to history.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setIsAddItemModalOpen(true)}
                >
                  + Add
                </button>
              </div>
            </section>
          </main>

          <aside className="right-panel">
            <div className="activity-log-section">
              <div className="section-header">
                <h4>Activity Log</h4>
                <div className="activity-view-options">
                  <button className="btn-link">View all</button>
                </div>
              </div>
              <ul className="activity-list">
                <li>
                  <img src="https://i.pravatar.cc/30?u=renee" alt="User" />
                  <p>
                    <b>Renee</b> marked Milk as bought <span>2m ago</span>
                  </p>
                </li>
                <li>
                  <img src="https://i.pravatar.cc/30?u=jay" alt="User" />
                  <p>
                    <b>Jay</b> added Paper towels <span>15m ago</span>
                  </p>
                </li>
              </ul>
            </div>
            <div className="members-section">
              <div className="section-header">
                <h4>Members</h4>
              </div>
              <div className="invite-box">
                <p>Invite via email or link</p>
                <button className="btn-primary" onClick={handleShareClick}>
                  Share
                </button>
              </div>
              <ul className="members-list">
                {selectedGroup &&
                  selectedGroup.members.map((member) => (
                    <li key={member._id}>
                      <img
                        src={`https://i.pravatar.cc/30?u=${member._id}`}
                        alt="User"
                      />
                      <div className="member-info">
                        <span>{member.username}</span>
                        <small>
                          {selectedGroup.owner === member._id
                            ? "Owner"
                            : "Member"}
                        </small>
                      </div>
                      <button className="btn-icon">...</button>
                    </li>
                  ))}
              </ul>
              <div className="live-updates">
                <span></span> Live updates across members
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddFromModal}
      />

      {selectedGroup && (
        <ShareGroupModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          groupName={selectedGroup.name}
          groupId={selectedGroup._id}
        />
      )}
    </div>
  );
}

export default ListComponent;
