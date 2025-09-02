import React from "react";

function ListComponent() {
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
        <div className="groups-list">
          <p>Your groups</p>
          <ul>
            <li className="active">
              <img src="https://i.pravatar.cc/30?u=family" alt="Group" />
              <span>Family Groceries</span>
            </li>
            <li>
              <img src="https://i.pravatar.cc/30?u=trip" alt="Group" />
              <span>Weekend Trip</span>
            </li>
            <li>
              <img src="https://i.pravatar.cc/30?u=chores" alt="Group" />
              <span>Apartment Chores</span>
            </li>
          </ul>
        </div>
        <div className="panel-footer">
          <button className="btn-secondary">+ New Group</button>
          <button className="btn-primary">Invite</button>
        </div>
      </nav>

      <main className="center-panel">
        <header className="main-header">
          <div className="header-left">
            <button className="btn-icon">{"<"}</button>
            <h3>Family Groceries</h3>
          </div>
          <div className="header-right">
            <span>3 members</span>
            <button className="btn-secondary">Activity</button>
            <button className="btn-primary">+ Add</button>
          </div>
        </header>

        <section className="list-section-card">
          <div className="list-header-top">
            <h3>List</h3>
            <div className="list-filters">
              <button className="filter-btn active">
                <span>🔀</span> Shared
              </button>
              <button className="filter-btn">
                <span>👤</span> Assigned to you
              </button>
            </div>
          </div>

          <div className="add-item-form">
            <input type="text" placeholder="Add an item (e.g., Milk)" />
            <button className="btn-primary">+ Add</button>
          </div>

          <div className="item-list-container">
            <div className="item-list-header">
              <span />
              <span>Item</span>
              <span>Category</span>
              <span>Added/Assigned</span>
              <span className="header-actions">Actions</span>
            </div>
            <ul className="item-list">
              <li>
                <input type="checkbox" />
                <span className="item-name">Bananas</span>
                <span className="item-category">Grocery</span>
                <span className="item-added-by">added by Ana</span>
                <div className="item-actions">
                  <button className="btn-icon btn-edit">✏️</button>
                  <button className="btn-icon btn-delete">🗑️</button>
                </div>
              </li>
              <li>
                <input type="checkbox" />
                <span className="item-name">Eggs</span>
                <span className="item-category">Grocery</span>
                <span className="item-added-by">added by Lee</span>
                <div className="item-actions">
                  <button className="btn-icon btn-edit">✏️</button>
                  <button className="btn-icon btn-delete">🗑️</button>
                </div>
              </li>
              <li>
                <input type="checkbox" />
                <span className="item-name">Paper towels</span>
                <span className="item-category">Household</span>
                <span className="item-added-by">added by Jay</span>
                <div className="item-actions">
                  <button className="btn-icon btn-edit">✏️</button>
                  <button className="btn-icon btn-delete">🗑️</button>
                </div>
              </li>
            </ul>
          </div>
          <p className="tip-text">
            Tip: Click the checkbox to mark an item as bought. Completed items
            move to history.
          </p>
        </section>
      </main>

      <aside className="right-panel">
        <div className="activity-log-section">
          <div className="section-header">
            <h4>Activity Log</h4>
            <div className="activity-view-options">
              <span>Today</span>
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
            <span>QR</span>
          </div>
          <div className="invite-box">
            <p>Invite via email or link</p>
            <button className="btn-primary">Share</button>
          </div>
          <ul className="members-list">
            <li>
              <img src="https://i.pravatar.cc/30?u=ana" alt="User" />
              <div className="member-info">
                <span>Ana</span>
                <small>Owner</small>
              </div>
              <button className="btn-icon">...</button>
            </li>
            <li>
              <img src="https://i.pravatar.cc/30?u=jay" alt="User" />
              <div className="member-info">
                <span>Jay</span>
                <small>Member</small>
              </div>
              <button className="btn-icon">...</button>
            </li>
          </ul>
          <div className="live-updates">
            <span></span> Live updates across members
          </div>
        </div>
      </aside>
    </div>
  );
}

export default ListComponent;
