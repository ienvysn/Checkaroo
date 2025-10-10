import { useEffect, useState } from "react";
import {
  getGroups,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  getRecentActivities,
} from "../api";
import AddItemModal from "../modal/AddItemModal";
import ShareGroupModal from "../modal/shareGroupModal";
import CreateGroupModal from "../modal/CreateGroupModal";
import ActivityModal from "../modal/ActivityModal";
import ConfirmModal from "../modal/ConfirmModal";
import GroupSettingsModal from "../modal/GroupSettingModal";

function ListComponent() {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(
    localStorage.getItem("selectedGroupId") ||
      localStorage.getItem("personalGroupId")
  );
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  // const [testModalOpen, setTestModalOpen] = useState(false);
  // const [testModalType, setTestModalType] = useState("simple");
  const [isGroupSettingsModalOpen, setIsGroupSettingsModalOpen] =
    useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);

      const storedSelectedId = localStorage.getItem("selectedGroupId");
      const storedPersonalId = localStorage.getItem("personalGroupId");

      if (
        storedSelectedId &&
        res.data.find((g) => g._id === storedSelectedId)
      ) {
        setSelectedGroupId(storedSelectedId);
        localStorage.removeItem("selectedGroupId");
      } else if (res.data.length > 0 && !selectedGroupId) {
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

  const fetchActivities = async () => {
    if (selectedGroupId) {
      try {
        const res = await getRecentActivities(selectedGroupId);
        setActivities(res.data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchItems();
    fetchActivities();
  }, [selectedGroupId]);

  const handleAddFromModal = (itemData) => {
    addItem(selectedGroupId, itemData).then((res) => {
      setItems([...items, res.data]);
      fetchActivities();
    });
  };

  const handleToggle = (id, isComplete) => {
    updateItem(selectedGroupId, id, { isComplete: !isComplete }).then((res) => {
      setItems(items.map((item) => (item._id === id ? res.data : item)));
      fetchActivities();
    });
  };

  const handleDelete = (id) => {
    deleteItem(selectedGroupId, id).then(() => {
      setItems(items.filter((item) => item._id !== id));
      fetchActivities();
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
  const handleGroupUpdated = () => {
    fetchGroups();
    fetchActivities();
  };

  const handleGroupDeleted = () => {
    // Redirect to personal group
    const personal = groups.find((g) => g.isPersonal);
    if (personal) {
      setSelectedGroupId(personal._id);
    }

    fetchGroups();
  };
  const handleGroupClick = (groupId) => {
    setSelectedGroupId(groupId);
  };

  const handleGroupLeft = () => {
    const personal = groups.find((g) => g.isPersonal);
    if (personal) {
      setSelectedGroupId(personal._id);
    }

    fetchGroups();
  };
  const handleGroupCreated = (newGroup) => {
    setGroups([...groups, newGroup]);
    setSelectedGroupId(newGroup._id);
    localStorage.setItem("selectedGroupId", newGroup._id);
  };

  const getActivityText = (activity) => {
    const isCurrentUser = activity.user === currentUserId;
    const userName = isCurrentUser ? "You" : activity.username;

    switch (activity.action) {
      case "added_item":
        return `${userName} added ${activity.itemName}`;
      case "marked_complete":
        return `${userName} marked ${activity.itemName} as bought`;
      case "marked_incomplete":
        return `${userName} unmarked ${activity.itemName}`;
      case "deleted_item":
        return `${userName} removed ${activity.itemName}`;
      case "joined_group":
        return `${userName} joined the group`;
      case "left_group":
        return `${userName} left the group`;
      default:
        return "";
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
                  src={`https://api.dicebear.com/7.x/big-ears/svg?seed=${group._id}`}
                  alt="Group"
                />
                <span>{group.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-footer">
          <button
            className="btn-secondary"
            onClick={() => setIsCreateGroupModalOpen(true)}
          >
            + New Group
          </button>
          <button className="btn-primary" onClick={handleShareClick}>
            Invite
          </button>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
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
            {/* Settings button only show for non-personal groups */}
            {selectedGroup && !selectedGroup.isPersonal && (
              <button
                className="btn-icon"
                onClick={() => setIsGroupSettingsModalOpen(true)}
                title="Group Settings"
                style={{ marginLeft: "8px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: "20px", height: "20px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            )}
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

                {items.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
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
                          d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </div>
                    <h3 className="empty-state-title">No items yet</h3>
                    <p className="empty-state-description">
                      Add items by pressing the button below to get started with
                      your list.
                    </p>
                    <button
                      className="empty-state-action"
                      onClick={() => setIsAddItemModalOpen(true)}
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Add your first item
                    </button>
                  </div>
                ) : (
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
                          <span className="item-quantity">
                            x{item.quantity}
                          </span>
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
                )}
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
                  <button
                    className="btn-link"
                    onClick={() => setIsActivityModalOpen(true)}
                  >
                    View all
                  </button>
                </div>
              </div>
              {activities.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--medium-gray)",
                    padding: "20px 0",
                    fontSize: "14px",
                  }}
                >
                  No recent activities
                </p>
              ) : (
                <ul className="activity-list">
                  {activities.map((activity) => (
                    <li key={activity._id}>
                      <img
                        src={`https://api.dicebear.com/7.x/big-ears/svg?seed=${activity.user}`}
                        alt="User"
                      />
                      <p>
                        {getActivityText(activity)}
                        <span>{getTimeAgo(activity.createdAt)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
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
                        src={`https://api.dicebear.com/7.x/big-ears/svg?seed=${member._id}`}
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
          inviteToken={selectedGroup.inviteToken}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        groupId={selectedGroupId}
        currentUserId={currentUserId}
      />
      <GroupSettingsModal
        isOpen={isGroupSettingsModalOpen}
        onClose={() => setIsGroupSettingsModalOpen(false)}
        group={selectedGroup}
        currentUserId={currentUserId}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
        onGroupLeft={handleGroupLeft}
      />
    </div>
  );
}

export default ListComponent;
